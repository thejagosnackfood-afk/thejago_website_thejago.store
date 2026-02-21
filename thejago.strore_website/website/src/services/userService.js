const { firestore } = require('../config/firestore');
const { hashPassword } = require('../utils/crypto');

const usersCollection = firestore.collection('users');

const toObject = (doc) => ({ id: doc.id, ...doc.data() });

const createUser = async (userData) => {
  const { phoneE164, password } = userData;
  
  // Check if user exists
  const snapshot = await usersCollection.where('phoneE164', '==', phoneE164).limit(1).get();
  if (!snapshot.empty) {
    throw new Error('phone_in_use');
  }

  const userRef = usersCollection.doc();
  const newUser = {
    ...userData,
    passwordHash: hashPassword(password),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  delete newUser.password; // Remove plain password
  
  await userRef.set(newUser);
  return { id: userRef.id, ...newUser };
};

const getUserByPhone = async (phoneE164) => {
  const snapshot = await usersCollection.where('phoneE164', '==', phoneE164).limit(1).get();
  if (snapshot.empty) return null;
  return toObject(snapshot.docs[0]);
};

const getUserById = async (userId) => {
  const doc = await usersCollection.doc(userId).get();
  if (!doc.exists) return null;
  return toObject(doc);
};

module.exports = {
  createUser,
  getUserByPhone,
  getUserById
};
