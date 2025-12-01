import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Login.css';

const Auth = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, loginWithGoogle, userRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Sync state with URL
    useEffect(() => {
        if (location.pathname === '/signup') {
            setIsSignUp(true);
        } else {
            setIsSignUp(false);
        }
    }, [location.pathname]);

    // Redirect if already logged in
    useEffect(() => {
        if (userRole === 'admin') navigate('/admin');
        if (userRole === 'client') navigate('/shop');
    }, [userRole, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
        } catch (err) {
            console.error("Login error:", err);
            setError('Échec de la connexion. Vérifiez vos identifiants.');
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Les mots de passe ne correspondent pas.');
        }

        try {
            setError('');
            setLoading(true);
            const userCredential = await signup(email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                role: name === 'Admin' ? 'admin' : 'client',
                createdAt: new Date()
            });

            if (name === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/shop');
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError('Échec de l\'inscription. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = (mode) => {
        if (mode === 'signup') {
            navigate('/signup');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="auth-container">
            <div className={`auth-content-container ${isSignUp ? "right-panel-active" : ""}`} id="container">

                {/* Sign Up Container */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSignup}>
                        <h1>Créer un Compte</h1>
                        <div className="social-container">
                            <button type="button" className="social" onClick={loginWithGoogle}><i className="fab fa-google-plus-g"></i></button>
                            {/* Replaced icon with image for consistency if needed, but using text/icon for now as per standard template */}
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon-small" />
                        </div>
                        <span>ou utiliser votre email pour l'inscription</span>
                        <input type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <input type="password" placeholder="Confirmer MDP" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        {error && isSignUp && <p className="error-text">{error}</p>}
                        <button type="submit" disabled={loading}>{loading ? 'Création...' : 'S\'INSCRIRE'}</button>
                    </form>
                </div>

                {/* Sign In Container */}
                <div className="form-container sign-in-container">
                    <form onSubmit={handleLogin}>
                        <h1>Se Connecter</h1>
                        <div className="social-container">
                            <button type="button" className="social" onClick={loginWithGoogle}>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon-small" />
                            </button>
                        </div>
                        <span>ou utiliser votre compte</span>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        {error && !isSignUp && <p className="error-text">{error}</p>}
                        <a href="#">Mot de passe oublié ?</a>
                        <button type="submit" disabled={loading}>{loading ? 'Connexion...' : 'SE CONNECTER'}</button>
                    </form>
                </div>

                {/* Overlay Container */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Bon retour !</h1>
                            <p>Pour rester connecté avec nous, veuillez vous connecter avec vos informations personnelles</p>
                            <button className="ghost" onClick={() => toggleMode('login')}>SE CONNECTER</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Bonjour, Ami !</h1>
                            <p>Entrez vos informations personnelles et commencez votre voyage avec nous</p>
                            <button className="ghost" onClick={() => toggleMode('signup')}>S'INSCRIRE</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
