const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 8080;
const SERVICE_NAME = process.env.SERVICE_NAME || 'railway-whatsapp-service';
const APP_VERSION = process.env.npm_package_version || '1.0.0';
const BACKEND_UI_ORIGIN = (process.env.BACKEND_UI_ORIGIN || 'https://thejago-calculator.web.app').replace(/\/+$/, '');

function shouldRedirectBackendUi() {
    // Default: redirect UI pages to Firebase Hosting to avoid client-side runtime issues on API host.
    // Set `BACKEND_UI_REDIRECT=false` to serve UI directly from this service.
    return String(process.env.BACKEND_UI_REDIRECT || 'true').toLowerCase() !== 'false';
}

function normalizePhone(rawValue = '') {
    return String(rawValue).replace(/[^0-9+]/g, '').trim();
}

function normalizeMsisdn(rawValue = '') {
    let v = String(rawValue || '').replace(/[^0-9+]/g, '').trim();
    if (!v) return '';
    if (v.startsWith('+')) v = v.slice(1);
    if (v.startsWith('0')) v = `62${v.slice(1)}`;
    if (v.startsWith('8')) v = `62${v}`;
    return v;
}

function whatsappTransport() {
    const raw = process.env.WHATSAPP_TRANSPORT || process.env.WHATSAPP_MODE || '';
    const t = String(raw).trim().toLowerCase();
    if (t) return t;
    if (String(process.env.WHATSAPP_WEB || 'false').toLowerCase() === 'true') return 'web';
    return 'gateway';
}

function resolveGatewayConfig() {
    const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL || '';
    const gatewayToken = process.env.WHATSAPP_GATEWAY_TOKEN || process.env.FONTE_TOKEN || '';
    const gatewayAuthHeader = process.env.WHATSAPP_GATEWAY_AUTH_HEADER || 'Authorization';

    // Allow disabling the token prefix by setting WHATSAPP_GATEWAY_TOKEN_PREFIX to:
    // - empty string
    // - "none" / "raw"
    // Default is "Bearer", except Fonnte which typically expects the raw token.
    const configuredPrefix = process.env.WHATSAPP_GATEWAY_TOKEN_PREFIX;
    const isFonnte = /fonnte\.com/i.test(gatewayUrl);
    const defaultPrefix = isFonnte ? '' : 'Bearer';
    let gatewayTokenPrefix = configuredPrefix !== undefined ? configuredPrefix : defaultPrefix;
    if (gatewayTokenPrefix && /^(none|raw)$/i.test(gatewayTokenPrefix.trim())) gatewayTokenPrefix = '';

    const authValue = gatewayTokenPrefix ? `${gatewayTokenPrefix} ${gatewayToken}`.trim() : gatewayToken;

    return { gatewayUrl, gatewayToken, gatewayAuthHeader, authValue };
}

function isDryRunEnabled() {
    return String(process.env.WHATSAPP_DRY_RUN || 'false').toLowerCase() === 'true';
}

function isGatewayConfigured() {
    const { gatewayUrl, gatewayToken } = resolveGatewayConfig();
    return Boolean(gatewayUrl && gatewayToken);
}

// -------------------------
// WhatsApp Web (Baileys)
// -------------------------
let waSock = null;
let waStarting = null;
let waStatus = {
    status: 'offline', // 'offline' | 'qr' | 'online'
    qr: null, // data URL
    me: null,
    lastError: null,
    updatedAt: null,
};

function waAuthDir() {
    // For persistence on Railway, mount a Volume and set WHATSAPP_AUTH_DIR to that mount path.
    // Example: WHATSAPP_AUTH_DIR=/data/wa-auth
    return (
        process.env.WHATSAPP_AUTH_DIR ||
        process.env.WA_AUTH_DIR ||
        path.join(__dirname, 'data', 'wa-auth')
    );
}

async function ensureWhatsAppWeb() {
    if (waSock) return waSock;
    if (waStarting) return waStarting;

    waStarting = (async () => {
        const transport = whatsappTransport();
        if (transport !== 'web') return null;

        // Lazy-require so gateway-only deployments don't pay the cost.
        // eslint-disable-next-line global-require
        const baileys = require('@whiskeysockets/baileys');
        // eslint-disable-next-line global-require
        const qrcode = require('qrcode');

        const authDir = waAuthDir();
        fs.mkdirSync(authDir, { recursive: true });

        const { state, saveCreds } = await baileys.useMultiFileAuthState(authDir);
        const { version } = await baileys.fetchLatestBaileysVersion();

        const sock = baileys.default({
            version,
            auth: state,
            printQRInTerminal: true,
            // Keep logs minimal on Railway
            logger: require('pino')({ level: process.env.WHATSAPP_LOG_LEVEL || 'silent' }),
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, qr, lastDisconnect } = update || {};

            if (qr) {
                try {
                    waStatus.qr = await qrcode.toDataURL(qr);
                    waStatus.status = 'qr';
                    waStatus.lastError = null;
                    waStatus.updatedAt = new Date().toISOString();
                } catch (err) {
                    waStatus.lastError = err?.message || String(err);
                }
            }

            if (connection === 'open') {
                waStatus.status = 'online';
                waStatus.qr = null;
                waStatus.me = sock.user || null;
                waStatus.lastError = null;
                waStatus.updatedAt = new Date().toISOString();
            }

            if (connection === 'close') {
                waStatus.me = null;
                waStatus.updatedAt = new Date().toISOString();

                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const isLoggedOut =
                    statusCode === baileys.DisconnectReason.loggedOut ||
                    statusCode === baileys.DisconnectReason.badSession;

                waStatus.status = 'offline';
                waSock = null;
                waStarting = null;

                if (isLoggedOut) {
                    // Force a fresh QR next time.
                    try {
                        fs.rmSync(authDir, { recursive: true, force: true });
                    } catch {
                        // ignore
                    }
                } else {
                    // Attempt reconnect shortly.
                    setTimeout(() => {
                        ensureWhatsAppWeb().catch(() => {});
                    }, 1500);
                }
            }
        });

        waSock = sock;
        return waSock;
    })()
        .catch((err) => {
            waStatus.lastError = err?.message || String(err);
            waStatus.status = 'offline';
            waStatus.updatedAt = new Date().toISOString();
            waSock = null;
            waStarting = null;
            throw err;
        })
        .finally(() => {
            // Keep waStarting for callers awaiting; reset will happen on close/error.
        });

    return waStarting;
}

function waWebSnapshot() {
    return { ...waStatus };
}

async function sendViaWhatsAppWeb({ to, message }) {
    const sock = await ensureWhatsAppWeb();
    if (!sock || waStatus.status !== 'online') {
        const err = new Error('WhatsApp Web belum login. Scan QR dulu.');
        err.code = 'WA_NOT_ONLINE';
        throw err;
    }

    const msisdn = normalizeMsisdn(to);
    if (!msisdn) {
        const err = new Error('Nomor WhatsApp tidak valid');
        err.code = 'WA_BAD_NUMBER';
        throw err;
    }

    const jid = `${msisdn}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });
    return { jid };
}

async function sendToGateway({ to, message }) {
    const { gatewayUrl, gatewayToken, gatewayAuthHeader, authValue } = resolveGatewayConfig();
    if (!gatewayUrl || !gatewayToken) {
        throw new Error('WHATSAPP_GATEWAY_URL / WHATSAPP_GATEWAY_TOKEN belum di-set');
    }

    const isFonnte = /fonnte\.com/i.test(gatewayUrl);

    const gatewayToField = process.env.WHATSAPP_GATEWAY_TO_FIELD || (isFonnte ? 'target' : 'to');
    const gatewayMessageField = process.env.WHATSAPP_GATEWAY_MESSAGE_FIELD || 'message';
    const payload = { [gatewayToField]: to, [gatewayMessageField]: message };

    // Fonnte commonly expects form-urlencoded; other gateways usually accept JSON.
    const headers = { [gatewayAuthHeader]: authValue };
    let body;
    if (isFonnte) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        body = new URLSearchParams(payload);
    } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(payload);
    }

    const response = await fetch(gatewayUrl, {
        method: 'POST',
        headers,
        body,
    });

    const responseText = await response.text();
    let parsedBody = responseText;
    try {
        parsedBody = JSON.parse(responseText);
    } catch {
        // Gateway response is not JSON
    }

    if (!response.ok) {
        throw new Error(`Gateway error ${response.status}: ${responseText}`);
    }

    return parsedBody;
}

// 0. HEALTH CHECK (Untuk Railway)
app.get('/health', (req, res) =>
    res.status(200).json({
        ok: true,
        service: SERVICE_NAME,
        version: APP_VERSION,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    })
);

app.get('/health/deps', async (req, res) => {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const checks = {
        supabase: {
            configured: Boolean(supabaseUrl),
            ok: null,
            detail: null,
        },
    };

    if (supabaseUrl) {
        const cleanUrl = supabaseUrl.replace(/\/+$/, '');
        try {
            const healthResponse = await fetch(`${cleanUrl}/auth/v1/health`, {
                headers: supabaseAnonKey ? { apikey: supabaseAnonKey } : undefined,
            });
            checks.supabase.ok = healthResponse.ok;
            checks.supabase.detail = `status ${healthResponse.status}`;
        } catch (error) {
            checks.supabase.ok = false;
            checks.supabase.detail = error.message;
        }
    }

    const hasFailure = Object.values(checks).some((item) => item.ok === false);
    const statusCode = hasFailure ? 503 : 200;

    return res.status(statusCode).json({
        ok: !hasFailure,
        checks,
        timestamp: new Date().toISOString(),
    });
});

// 1.1 Legacy endpoint untuk halaman /backend/pendaftaran.html
app.get('/status', (req, res) => {
    const transport = whatsappTransport();
    const configured = isGatewayConfigured();
    const dryRun = isDryRunEnabled();
    const webEnabled = transport === 'web';

    if (dryRun) {
        return res.status(200).json({
            ok: true,
            status: 'online',
            qr: null,
            transport,
            source: 'railway-api',
            timestamp: new Date().toISOString(),
        });
    }

    if (webEnabled) {
        // Start/keep the WA session alive; status response includes QR (data URL) when needed.
        ensureWhatsAppWeb().catch(() => {});
        const snap = waWebSnapshot();
        const online = snap.status === 'online';
        const status = online ? 'online' : snap.qr ? 'qr' : 'offline';
        return res.status(200).json({
            // Frontend pendaftaran only consumes data when `ok === true`.
            ok: true,
            status,
            qr: snap.qr,
            transport: 'web',
            detail: snap.lastError ? `error: ${snap.lastError}` : null,
            source: 'railway-api',
            timestamp: new Date().toISOString(),
        });
    }

    const online = configured;

    return res.status(200).json({
        ok: online,
        status: online ? 'online' : 'offline',
        qr: null,
        transport: 'gateway',
        source: 'railway-api',
        timestamp: new Date().toISOString(),
    });
});

// 1. API WHATSAPP (Placeholder untuk integrasi WhatsApp-Web.js atau Fonte)
app.post('/api/whatsapp/send', async (req, res) => {
    const to = normalizePhone(req.body?.to);
    const message = String(req.body?.message || '').trim();
    const dryRun = isDryRunEnabled();
    const transport = whatsappTransport();
    const { gatewayUrl, gatewayToken } = resolveGatewayConfig();

    if (!to || !message) {
        return res.status(400).json({
            success: false,
            error: 'Body `to` dan `message` wajib diisi',
        });
    }

    if (dryRun) {
        return res.status(dryRun ? 200 : 202).json({
            success: true,
            mode: 'dry-run',
            message: 'WhatsApp API aktif, tapi gateway belum dipakai',
            detail: `Pesan terjadwal ke ${to}`,
        });
    }

    if (transport === 'web') {
        try {
            const result = await sendViaWhatsAppWeb({ to, message });
            return res.status(200).json({
                success: true,
                mode: 'web',
                to: normalizeMsisdn(to),
                result,
            });
        } catch (error) {
            return res.status(error.code === 'WA_NOT_ONLINE' ? 409 : 502).json({
                success: false,
                mode: 'web',
                error: error.message,
                status: waStatus.status,
                qr: waStatus.qr,
            });
        }
    }

    if (!gatewayUrl || !gatewayToken) {
        return res.status(202).json({
            success: true,
            mode: 'mock',
            message: 'WhatsApp API aktif, tapi gateway belum dipakai',
            detail: `Pesan terjadwal ke ${to}`,
        });
    }

    try {
        const gatewayResponse = await sendToGateway({ to, message });
        return res.status(200).json({
            success: true,
            mode: 'gateway',
            to,
            gatewayResponse,
        });
    } catch (error) {
        console.error('WhatsApp gateway error:', error.message);
        return res.status(502).json({
            success: false,
            error: 'Gagal kirim pesan ke WhatsApp gateway',
            detail: error.message,
        });
    }
});

// 1.2 Legacy endpoint untuk kompatibilitas frontend lama (/send)
app.post('/send', async (req, res) => {
    const to = normalizePhone(req.body?.phone || req.body?.to);
    const message = String(req.body?.message || 'Kartu member Anda sudah siap.').trim();
    const dryRun = isDryRunEnabled();
    const transport = whatsappTransport();
    const { gatewayUrl, gatewayToken } = resolveGatewayConfig();

    if (!to) {
        return res.status(400).json({
            ok: false,
            error: 'Body `phone`/`to` wajib diisi',
        });
    }

    if (!message) {
        return res.status(400).json({
            ok: false,
            error: 'Body `message` wajib diisi',
        });
    }

    if (dryRun) {
        return res.status(200).json({
            ok: true,
            mode: 'dry-run',
            detail: `Pesan terjadwal ke ${to}`,
        });
    }

    if (transport === 'web') {
        try {
            const result = await sendViaWhatsAppWeb({ to, message });
            return res.status(200).json({
                ok: true,
                mode: 'web',
                to: normalizeMsisdn(to),
                result,
            });
        } catch (error) {
            return res.status(error.code === 'WA_NOT_ONLINE' ? 409 : 502).json({
                ok: false,
                mode: 'web',
                error: error.message,
                status: waStatus.status,
                qr: waStatus.qr,
            });
        }
    }

    if (!gatewayUrl || !gatewayToken) {
        return res.status(200).json({
            ok: true,
            mode: 'mock',
            detail: `Pesan terjadwal ke ${to}`,
        });
    }

    try {
        const gatewayResponse = await sendToGateway({ to, message });
        return res.status(200).json({
            ok: true,
            mode: 'gateway',
            to,
            gatewayResponse,
        });
    } catch (error) {
        console.error('Legacy /send gateway error:', error.message);
        return res.status(502).json({
            ok: false,
            error: 'Gagal kirim pesan ke WhatsApp gateway',
            detail: error.message,
        });
    }
});

// 2. SERVE KALKULATOR & BACKEND STATIS
// Redirect UI pages to Firebase Hosting (stable host for static Next export),
// while keeping API endpoints (/status, /send, /api/whatsapp/send) on Railway.
if (shouldRedirectBackendUi()) {
    app.get('/backend/pendaftaran.html', (req, res) =>
        res.redirect(302, `${BACKEND_UI_ORIGIN}/backend/pendaftaran.html`)
    );
    app.get('/backend/index.html', (req, res) =>
        res.redirect(302, `${BACKEND_UI_ORIGIN}/backend/index.html`)
    );
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/backend/converter.html');
});

// Fallback untuk route /backend/* jika file statis tidak ditemukan
app.get(/^\/backend(\/.*)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'backend', 'index.html'));
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route tidak ditemukan',
        path: req.path,
    });
});

const server = app.listen(PORT, () => {
    console.log(`> ${SERVICE_NAME} live on port ${PORT}`);
});

function gracefulShutdown(signal) {
    console.log(`Received ${signal}, closing HTTP server...`);
    server.close(() => process.exit(0));
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
