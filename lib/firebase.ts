import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let db: ReturnType<typeof getFirestore>;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // ignoreUndefinedProperties: never let a stray `undefined` field value crash a
  // write — Firestore rejects them by default. Optional form fields (promoPrice,
  // etc.) are simply skipped instead of throwing.
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
  });
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

export const auth = getAuth(app);
export { db };
export const storage = getStorage(app);
export default app;
