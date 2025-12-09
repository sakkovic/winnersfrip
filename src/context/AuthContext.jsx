import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin' or 'client'
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    function logout() {
        return signOut(auth);
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Fetch user role
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        // Force Admin Role for specific email
                        if (user.email === 'anis.federe@gmail.com') {
                            setUserRole('admin');
                        } else {
                            setUserRole(userDoc.data().role);
                        }
                    } else {
                        // If new user via social auth, create doc
                        const role = user.email === 'anis.federe@gmail.com' ? 'admin' : 'client';
                        await setDoc(doc(db, "users", user.uid), {
                            name: user.displayName || 'Utilisateur',
                            email: user.email,
                            role: role,
                            createdAt: new Date()
                        });
                        setUserRole(role);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    // Fallback
                    if (user.email === 'anis.federe@gmail.com') {
                        setUserRole('admin');
                    } else {
                        setUserRole('client');
                    }
                }
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        signup,
        login,
        loginWithGoogle,
        logout,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
