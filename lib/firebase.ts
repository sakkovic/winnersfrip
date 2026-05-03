import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCJagMCi8vLBVKaGWB62MbFNrGt1OeXAF4',
  authDomain: 'winners-superfrip.firebaseapp.com',
  projectId: 'winners-superfrip',
  storageBucket: 'winners-superfrip.firebasestorage.app',
  messagingSenderId: '403744791994',
  appId: '1:403744791994:web:bc205b602d048a6a205183',
  measurementId: 'G-ML8N6C3DFZ',
};

let app;
let db: ReturnType<typeof getFirestore>;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  db = initializeFirestore(app, { experimentalForceLongPolling: true });
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

export const auth = getAuth(app);
export { db };
export const storage = getStorage(app);
export default app;
