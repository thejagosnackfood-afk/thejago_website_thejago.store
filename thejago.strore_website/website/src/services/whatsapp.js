async function sendWhatsAppOtp({ phoneE164, code }) {
  const provider = process.env.WHATSAPP_PROVIDER || 'mock';

  if (provider === 'mock') {
    // For local/dev only. Do not use in production.
    if (process.env.WHATSAPP_MOCK !== 'true') {
      throw new Error('WhatsApp mock provider disabled (set WHATSAPP_MOCK=true for dev)');
    }
    return { ok: true, mockCode: code, provider: 'mock' };
  }

  if (provider === 'fonnte') {
    const token = process.env.FONNTE_TOKEN;
    if (!token) throw new Error('Missing FONNTE_TOKEN for WhatsApp provider fonnte');

    const apiUrl = process.env.FONNTE_API_URL || 'https://api.fonnte.com/send';
    const target = String(phoneE164 || '').replace(/[^\d]/g, '');
    if (!target) throw new Error('Invalid phoneE164 for WhatsApp OTP');

    const message =
      process.env.WHATSAPP_OTP_TEMPLATE?.replace('{CODE}', String(code)) ||
      `Kode OTP The Jago: ${code}. Berlaku 5 menit.`;

    const body = new URLSearchParams();
    body.set('target', target);
    body.set('message', message);
    if (process.env.FONNTE_COUNTRY_CODE) body.set('countryCode', String(process.env.FONNTE_COUNTRY_CODE));

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      body,
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Fonnte send failed (${res.status}): ${text.slice(0, 300)}`);
    }

    return { ok: true, provider: 'fonnte', raw: safeJson(text) || text };
  }

  // Keep this explicit to avoid silently "sending" nothing in production.
  throw new Error(`WhatsApp provider not configured: ${provider}`);
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

module.exports = { sendWhatsAppOtp };
