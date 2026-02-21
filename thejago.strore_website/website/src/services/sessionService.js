const { firestore } = require('../config/firestore');
const { randomToken } = require('../utils/crypto');

const sessionsCollection = firestore.collection('sessions');

// Firestore automatically handles dates if using Timestamp
// We store plain JS Date objects which Firestore converts
const createSession = async (userId) => {
  // Use a simple random token (no hashing needed for Firestore simplicity, or keep hash if preferred)
  // For simplicity and speed in migration, we use the token as the document ID
  const token = randomToken(32);
  const ttlDays = Number(process.env.SESSION_TTL_DAYS || 30);
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  
  await sessionsCollection.doc(token).set({
    userId,
    expiresAt,
    createdAt: new Date()
  });

  return token;
};

const getSession = async (token) => {
  const doc = await sessionsCollection.doc(token).get();
  if (!doc.exists) return null;
  
  const session = doc.data();
  // Firestore stores dates as Timestamp, convert back to Date
  const expiresAt = session.expiresAt.toDate ? session.expiresAt.toDate() : new Date(session.expiresAt);

  if (expiresAt < new Date()) {
    await sessionsCollection.doc(token).delete();
    return null;
  }
  
  return { ...session, token }; // Return session data
};

module.exports = {
  createSession,
  getSession
};
