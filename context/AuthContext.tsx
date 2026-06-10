'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Role resolution ──────────────────────────────────────────────────────────
// The admin email is treated as the sole owner. Any other user is "client".
// Firestore can later override a user's role via /users/{uid}.role.

const ADMIN_EMAIL = 'anis.federe@gmail.com';

async function resolveRole(user: FirebaseUser): Promise<'admin' | 'client'> {
  if (user.email === ADMIN_EMAIL) return 'admin';
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) return (snap.data().role as 'admin' | 'client') ?? 'client';
  } catch {
    /* Firestore not reachable — fall through to client */
  }
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
  } catch {
    /* Soft fail — user doc is non-critical for login */
  }
}

// ── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await resolveRole(user);
        await ensureUserDoc(user, role);
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role,
        });
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
    if (name) await updateProfile(user, { displayName: name });
    const role: 'admin' | 'client' = email === ADMIN_EMAIL ? 'admin' : 'client';
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        createdAt: new Date(),
      });
    } catch {
      /* Soft fail */
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const logout = async () => signOut(auth);
  const resetPassword = async (email: string) => sendPasswordResetEmail(auth, email);

  const value: AuthContextValue = {
    currentUser,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetPassword,
    isAdmin: currentUser?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children even while auth is loading; consumers gate as needed. */}
      {children}
    </AuthContext.Provider>
  );
}
