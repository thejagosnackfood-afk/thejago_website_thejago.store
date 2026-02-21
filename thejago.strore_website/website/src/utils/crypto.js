const crypto = require('crypto');

function sha256Base64Url(input) {
  return crypto.createHash('sha256').update(String(input)).digest('base64url');
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('base64url')) {
  const iterations = 120_000;
  const keylen = 32;
  const digest = 'sha256';
  const derived = crypto.pbkdf2Sync(String(password), salt, iterations, keylen, digest).toString('base64url');
  return `pbkdf2_${digest}$${iterations}$${salt}$${derived}`;
}

function verifyPassword(password, stored) {
  const s = String(stored || '');
  const [scheme, iterationsStr, salt, derived] = s.split('$$');
  if (!scheme || !iterationsStr || !salt || !derived) return false;
  const iterations = Number(iterationsStr);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;
  const digest = scheme.replace('pbkdf2_', '');
  const keylen = 32;
  const check = crypto.pbkdf2Sync(String(password), salt, iterations, keylen, digest).toString('base64url');
  const a = Buffer.from(check);
  const b = Buffer.from(derived);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(code) {
  // Separate hash so OTP storage never contains plaintext.
  return sha256Base64Url(`otp:${code}`);
}

module.exports = {
  sha256Base64Url,
  randomToken,
  hashPassword,
  verifyPassword,
  generateOtpCode,
  hashOtp,
};
