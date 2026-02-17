const express = require('express');

const { User } = require('../models/User');
const { Session } = require('../models/Session');
const { Otp } = require('../models/Otp');
const { requireAuth } = require('../middleware/auth');
const { randomToken, sha256Base64Url, hashPassword, verifyPassword, generateOtpCode, hashOtp } = require('../utils/crypto');
const { sendWhatsAppOtp } = require('../services/whatsapp');

const router = express.Router();

function normalizePhone(phone) {
  return String(phone || '').trim();
}

async function createSession(userId) {
  const token = randomToken(32);
  const tokenHash = sha256Base64Url(token);
  const ttlDays = Number(process.env.SESSION_TTL_DAYS || 30);
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  await Session.create({ user: userId, tokenHash, expiresAt });
  return token;
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, phoneE164, password } = req.body || {};
    if (!name || !phoneE164 || !password) return res.status(400).json({ error: 'missing_fields' });

    const phone = normalizePhone(phoneE164);
    const exists = await User.findOne({ phoneE164: phone });
    if (exists) return res.status(409).json({ error: 'phone_in_use' });

    const user = await User.create({
      name: String(name).trim(),
      phoneE164: phone,
      passwordHash: hashPassword(password),
    });

    const token = await createSession(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, phoneE164: user.phoneE164, whatsappVerified: user.whatsappVerified },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { phoneE164, password } = req.body || {};
    if (!phoneE164 || !password) return res.status(400).json({ error: 'missing_fields' });

    const phone = normalizePhone(phoneE164);
    const user = await User.findOne({ phoneE164: phone });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    if (!verifyPassword(password, user.passwordHash)) return res.status(401).json({ error: 'invalid_credentials' });

    const token = await createSession(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, phoneE164: user.phoneE164, whatsappVerified: user.whatsappVerified },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, phoneE164: req.user.phoneE164, whatsappVerified: req.user.whatsappVerified },
  });
});

router.post('/whatsapp/request', async (req, res, next) => {
  try {
    const { phoneE164 } = req.body || {};
    if (!phoneE164) return res.status(400).json({ error: 'missing_phone' });
    const phone = normalizePhone(phoneE164);

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.deleteMany({ phoneE164: phone });
    await Otp.create({ phoneE164: phone, codeHash: hashOtp(code), expiresAt });

    const sent = await sendWhatsAppOtp({ phoneE164: phone, code });
    res.json({ ok: true, ...('mockCode' in sent ? { mockCode: sent.mockCode } : {}) });
  } catch (err) {
    next(err);
  }
});

router.post('/whatsapp/verify', async (req, res, next) => {
  try {
    const { phoneE164, code } = req.body || {};
    if (!phoneE164 || !code) return res.status(400).json({ error: 'missing_fields' });
    const phone = normalizePhone(phoneE164);

    const otp = await Otp.findOne({ phoneE164: phone });
    if (!otp) return res.status(400).json({ error: 'otp_not_found' });
    if (otp.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ _id: otp._id });
      return res.status(400).json({ error: 'otp_expired' });
    }
    if (otp.codeHash !== hashOtp(code)) return res.status(400).json({ error: 'otp_invalid' });

    await Otp.deleteOne({ _id: otp._id });
    const user = await User.findOneAndUpdate({ phoneE164: phone }, { whatsappVerified: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    res.json({ ok: true, whatsappVerified: true });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await Session.deleteOne({ _id: req.session._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
