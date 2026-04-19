import admin from 'firebase-admin';

export function getDb() {
  if (!admin.apps.length) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');

      if (clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else {
        // App Hosting and other Google runtimes can use ADC without bundling a service account key.
        admin.initializeApp({ projectId });
      }
      console.log('Firebase Admin initialized');
    } catch (error) {
      console.error('Firebase initialization error:', error.message);
      return null;
    }
  }
  return admin.firestore();
}

export default admin;
