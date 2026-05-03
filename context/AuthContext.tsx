'use client';

import React, { createContext, useContext } from 'react';

// ============================================================
// MODE LOCAL — Firebase Auth est désactivé temporairement.
// Pour réactiver pour le déploiement :
// 1. Supprimez le bloc "Stub local" ci-dessous
// 2. Décommentez le bloc "FIREBASE AUTH COMPLET" en bas
// ============================================================

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'client';
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// --- Stub local : aucun utilisateur connecté ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value: AuthContextValue = {
    currentUser: null,
    loading: false,
    login: async () => {},
    signup: async () => {},
    loginWithGoogle: async () => {},
    logout: async () => {},
    resetPassword: async () => {},
    isAdmin: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* --- FIREBASE AUTH COMPLET (à réactiver pour le déploiement) ---

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const ADMIN_EMAIL = 'anis.federe@gmail.com';

async function resolveRole(user: FirebaseUser): Promise<'admin' | 'client'> {
  if (user.email === ADMIN_EMAIL) return 'admin';
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) return snap.data().role ?? 'client';
  } catch {}
  return 'client';
}

async function ensureUserDoc(user: FirebaseUser, role: 'admin' | 'client') {
  try {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        name: user.displayName ?? 'Utilisateur',
        email: user.email,
        role,
        createdAt: new Date(),
      });
    }
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await resolveRole(user);
        await ensureUserDoc(user, role);
        setCurrentUser({ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL, role });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const role: 'admin' | 'client' = email === ADMIN_EMAIL ? 'admin' : 'client';
    await setDoc(doc(db, 'users', user.uid), { name, email, role, createdAt: new Date() });
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => signOut(auth);
  const resetPassword = async (email: string) => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, loginWithGoogle, logout, resetPassword, isAdmin: currentUser?.role === 'admin' }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
---------------------------------------------------------------- */
