import admin from 'firebase-admin';

export const initializeFirebase = () => {
  try {
    // need add env
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin Initialized');
    }
  } catch (error) {
    console.error('Firebase Initialization Error:', error);
  }
};

export { admin };
