const crypto = require('crypto');

function constantTimeEquals(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

function requireAdmin(req, res, next) {
  try {
    const token = req.headers['x-admin-token'] || req.headers['x-admin-seed-token'];
    const expected = process.env.ADMIN_API_TOKEN || process.env.ADMIN_SEED_TOKEN;
    if (!expected || !constantTimeEquals(token, expected)) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAdmin };
