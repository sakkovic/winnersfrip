'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
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
  emailVerified: boolean;
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** Re-send the email-verification link to the signed-in user. */
  resendVerification: () => Promise<void>;
  /** Reload the Firebase user (e.g. after they click the verification link). */
  refreshUser: () => Promise<void>;
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

const ADMIN_EMAILS = ['anis.federe@gmail.com', 'maleksakkaepbouzgarrou@gmail.com'];

async function resolveRole(user: FirebaseUser): Promise<'admin' | 'client'> {
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return 'admin';
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

  const buildAuthUser = async (user: FirebaseUser): Promise<AuthUser> => {
    const role = await resolveRole(user);
    await ensureUserDoc(user, role);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role,
      emailVerified: user.emailVerified,
    };
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user ? await buildAuthUser(user) : null);
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
    const role: 'admin' | 'client' = (email && ADMIN_EMAILS.includes(email.toLowerCase())) ? 'admin' : 'client';
    // Send the email-verification link. Non-fatal: account still works if it fails.
    try {
      await sendEmailVerification(user);
    } catch {
      /* Soft fail — user can resend from the account page. */
    }
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

  const logout = async () => signOut(auth);
  const resetPassword = async (email: string) => sendPasswordResetEmail(auth, email);

  const resendVerification = async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    if (auth.currentUser) setCurrentUser(await buildAuthUser(auth.currentUser));
  };

  const value: AuthContextValue = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    resendVerification,
    refreshUser,
    isAdmin: currentUser?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children even while auth is loading; consumers gate as needed. */}
      {children}
    </AuthContext.Provider>
  );
}
