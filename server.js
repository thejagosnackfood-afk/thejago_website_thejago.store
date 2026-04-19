const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 8080;
const SERVICE_NAME = process.env.SERVICE_NAME || 'railway-whatsapp-service';
const APP_VERSION = process.env.npm_package_version || '1.0.0';

function normalizePhone(rawValue = '') {
    return String(rawValue).replace(/[^0-9+]/g, '').trim();
}

function resolveGatewayConfig() {
    const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL || '';
    const gatewayToken = process.env.WHATSAPP_GATEWAY_TOKEN || process.env.FONTE_TOKEN || '';
    const gatewayAuthHeader = process.env.WHATSAPP_GATEWAY_AUTH_HEADER || 'Authorization';
    const gatewayTokenPrefix = process.env.WHATSAPP_GATEWAY_TOKEN_PREFIX || 'Bearer';
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

async function sendToGateway({ to, message }) {
    const { gatewayUrl, gatewayToken, gatewayAuthHeader, authValue } = resolveGatewayConfig();
    if (!gatewayUrl || !gatewayToken) {
        throw new Error('WHATSAPP_GATEWAY_URL / WHATSAPP_GATEWAY_TOKEN belum di-set');
    }

    const headers = {
        'Content-Type': 'application/json',
        [gatewayAuthHeader]: authValue,
    };

    const gatewayToField =
        process.env.WHATSAPP_GATEWAY_TO_FIELD || (/fonnte\.com/i.test(gatewayUrl) ? 'target' : 'to');
    const gatewayMessageField = process.env.WHATSAPP_GATEWAY_MESSAGE_FIELD || 'message';
    const payload = {
        [gatewayToField]: to,
        [gatewayMessageField]: message,
    };

    const response = await fetch(gatewayUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
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
    const configured = isGatewayConfigured();
    const dryRun = isDryRunEnabled();
    const online = dryRun || configured;

    return res.status(200).json({
        ok: online,
        status: online ? 'online' : 'offline',
        qr: null,
        source: 'railway-api',
        timestamp: new Date().toISOString(),
    });
});

// 1. API WHATSAPP (Placeholder untuk integrasi WhatsApp-Web.js atau Fonte)
app.post('/api/whatsapp/send', async (req, res) => {
    const to = normalizePhone(req.body?.to);
    const message = String(req.body?.message || '').trim();
    const dryRun = isDryRunEnabled();
    const { gatewayUrl, gatewayToken } = resolveGatewayConfig();

    if (!to || !message) {
        return res.status(400).json({
            success: false,
            error: 'Body `to` dan `message` wajib diisi',
        });
    }

    if (dryRun || !gatewayUrl || !gatewayToken) {
        return res.status(dryRun ? 200 : 202).json({
            success: true,
            mode: dryRun ? 'dry-run' : 'mock',
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

    if (dryRun || !gatewayUrl || !gatewayToken) {
        return res.status(200).json({
            ok: true,
            mode: dryRun ? 'dry-run' : 'mock',
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
