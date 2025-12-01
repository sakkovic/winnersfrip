import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCJagMCi8vLBVKaGWB62MbFNrGt1OeXAF4",
    authDomain: "winners-superfrip.firebaseapp.com",
    projectId: "winners-superfrip",
    storageBucket: "winners-superfrip.firebasestorage.app",
    messagingSenderId: "403744791994",
    appId: "1:403744791994:web:bc205b602d048a6a205183",
    measurementId: "G-ML8N6C3DFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
