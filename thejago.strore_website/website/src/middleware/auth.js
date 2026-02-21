const { Session } = require('../models/Session');
const { sha256Base64Url } = require('../utils/crypto');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'missing_auth' });

    const tokenHash = sha256Base64Url(token);
    const session = await Session.findOne({ tokenHash }).populate('user');
    if (!session) return res.status(401).json({ error: 'invalid_auth' });
    if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({ error: 'expired_auth' });
    }

    req.user = session.user;
    req.session = session;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };

