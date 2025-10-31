
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db: any = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  const app = getApps().length === 0 ? initializeApp({
    credential: cert(firebaseConfig),
    projectId: firebaseConfig.projectId,
  }) : getApps()[0];

  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} else {
  console.log('⚠️  Firebase credentials not found. Using in-memory storage for development.');
}

export { db };

export const COLLECTIONS = {
  BOARDS: 'boards',
  COLUMNS: 'columns', 
  GOALS: 'goals',
  COMMENTS: 'comments',
  WINS: 'wins'
} as const;
