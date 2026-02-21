const { firestore } = require('../config/firestore');

const threadsCollection = firestore.collection('chat_threads');

/**
 * Get or create a chat thread
 * @param {Object} params
 * @param {string} params.threadId - Existing thread ID
 * @param {string} params.channel - Channel (web, whatsapp, api)
 * @param {string} params.externalId - External ID (e.g. phone number)
 */
const getOrCreateThread = async ({ threadId, channel = 'web', externalId }) => {
  if (threadId) {
    const doc = await threadsCollection.doc(threadId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
  }

  // If externalId provided, try to find existing thread
  if (externalId) {
    const snapshot = await threadsCollection
      .where('channel', '==', channel)
      .where('externalId', '==', externalId)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
  }

  // Create new thread
  const newThread = {
    channel,
    externalId: externalId || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const ref = await threadsCollection.add(newThread);
  return { id: ref.id, ...newThread };
};

/**
 * Save a message to the thread
 * @param {string} threadId
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content
 */
const saveMessage = async (threadId, role, content) => {
  const messagesCollection = threadsCollection.doc(threadId).collection('messages');
  
  const message = {
    role,
    content,
    createdAt: new Date()
  };
  
  await messagesCollection.add(message);
  
  // Update thread timestamp
  await threadsCollection.doc(threadId).update({ updatedAt: new Date() });
  
  return message;
};

/**
 * Load message history for a thread
 * @param {string} threadId
 * @param {number} limit
 */
const loadHistory = async (threadId, limit = 10) => {
  const messagesCollection = threadsCollection.doc(threadId).collection('messages');
  
  const snapshot = await messagesCollection
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
    
  const messages = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Reverse to chronological order (oldest first) for context
  return messages.reverse();
};

module.exports = {
  getOrCreateThread,
  saveMessage,
  loadHistory
};
