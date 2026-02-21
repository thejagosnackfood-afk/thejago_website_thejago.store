const { firestore } = require('../config/firestore');
const { v4: uuidv4 } = require('uuid');

const knowledgeCollection = firestore.collection('knowledge_docs');

const toObject = (doc) => ({ id: doc.id, ...doc.data() });

const getAllDocs = async ({ limit = 50, skip = 0 } = {}) => {
  // Firestore doesn't support offset-based skip efficiently, 
  // but for small KB this is acceptable.
  // Ideally use cursor-based pagination.
  const snapshot = await knowledgeCollection
    .orderBy('updatedAt', 'desc')
    .limit(limit + skip)
    .get();
  
  const all = snapshot.docs.map(toObject);
  return all.slice(skip);
};

const countDocs = async () => {
  const snapshot = await knowledgeCollection.count().get();
  return snapshot.data().count;
};

const getDocById = async (id) => {
  const doc = await knowledgeCollection.doc(id).get();
  if (!doc.exists) return null;
  return toObject(doc);
};

const createDoc = async (data) => {
  const { title, content, isActive = true, embedding = null } = data;
  const now = new Date();
  
  // Auto-generate slug from title
  const slug = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + uuidv4().slice(0, 6);

  const newDoc = {
    title,
    slug,
    content,
    isActive,
    embedding, // Array of numbers or null
    createdAt: now,
    updatedAt: now
  };

  const ref = await knowledgeCollection.add(newDoc);
  return { id: ref.id, ...newDoc };
};

const updateDoc = async (id, data) => {
  const docRef = knowledgeCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;

  const updates = {
    ...data,
    updatedAt: new Date()
  };
  
  // If title changed, maybe update slug? 
  // For simplicity, let's keep slug stable unless explicitly changed.

  await docRef.update(updates);
  return { id, ...doc.data(), ...updates };
};

const deleteDoc = async (id) => {
  await knowledgeCollection.doc(id).delete();
  return true;
};

module.exports = {
  getAllDocs,
  countDocs,
  getDocById,
  createDoc,
  updateDoc,
  deleteDoc
};
