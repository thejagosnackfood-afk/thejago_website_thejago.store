const express = require('express');

const { createUser, getUserByPhone, getUserById } = require('../services/userService');
const { createSession, getSession } = require('../services/sessionService');
const { verifyPassword } = require('../utils/crypto');

const router = express.Router();

function normalizePhone(phone) {
  return String(phone || '').trim();
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, phoneE164, password } = req.body || {};
    if (!name || !phoneE164 || !password) return res.status(400).json({ error: 'missing_fields' });

    const phone = normalizePhone(phoneE164);
    
    // Create user (service handles duplication check)
    const user = await createUser({
      name: String(name).trim(),
      phoneE164: phone,
      password: password,
      whatsappVerified: false
    });

    const token = await createSession(user.id);
    res.json({
      token,
      user: { id: user.id, name: user.name, phoneE164: user.phoneE164, whatsappVerified: user.whatsappVerified },
    });
  } catch (err) {
    if (err.message === 'phone_in_use') {
      return res.status(409).json({ error: 'phone_in_use' });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { phoneE164, password } = req.body || {};
    if (!phoneE164 || !password) return res.status(400).json({ error: 'missing_fields' });

    const phone = normalizePhone(phoneE164);
    const user = await getUserByPhone(phone);
    
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    if (!verifyPassword(password, user.passwordHash)) return res.status(401).json({ error: 'invalid_credentials' });

    const token = await createSession(user.id);
    res.json({
      token,
      user: { id: user.id, name: user.name, phoneE164: user.phoneE164, whatsappVerified: user.whatsappVerified },
    });
  } catch (err) {
    next(err);
  }
});

// Mock Auth Middleware for route
const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) return res.status(401).json({ error: 'missing_auth' });

  try {
    const session = await getSession(token);
    if (!session) return res.status(401).json({ error: 'invalid_auth' });
    
    const user = await getUserById(session.userId);
    if (!user) return res.status(401).json({ error: 'user_not_found' });

    req.user = user;
    req.session = session;
    next();
  } catch (err) {
    next(err);
  }
};

router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: { id: req.user.id, name: req.user.name, phoneE164: req.user.phoneE164, whatsappVerified: req.user.whatsappVerified },
  });
});

// Whatsapp OTP endpoints omitted for brevity in Firestore migration (can be added similarly)

module.exports = router;
