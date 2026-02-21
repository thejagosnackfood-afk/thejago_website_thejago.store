const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore
// Cloud Run automatically provides credentials via the Service Account
const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'thejagosnackfood-420',
  databaseId: '(default)',
});

async function checkFirestoreConnection() {
  try {
    const collections = await firestore.listCollections();
    console.log('✅ Firestore connected successfully. Collections:', collections.length);
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
}

module.exports = { firestore, checkFirestoreConnection };
