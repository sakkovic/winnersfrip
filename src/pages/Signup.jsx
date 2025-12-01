import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Login.css'; // Reuse login styles

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Les mots de passe ne correspondent pas.');
        }

        try {
            setError('');
            setLoading(true);
            const userCredential = await signup(email, password);
            const user = userCredential.user;

            // Create user document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                role: name === 'Admin' ? 'admin' : 'client', // Backdoor for testing
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

    return (
        <div className="auth-container">
            <div className="auth-box">
                {/* Info Side (Left for Signup) */}
                <div className="auth-info-side">
                    <div className="auth-info-content">
                        <h2>Bon retour !</h2>
                        <p>Pour rester connecté avec nous, veuillez vous connecter avec vos informations personnelles</p>
                        <button className="btn-ghost" onClick={() => navigate('/login')}>
                            SE CONNECTER
                        </button>
                    </div>
                </div>

                {/* Form Side */}
                <div className="auth-form-side">
                    <div className="login-card">
                        <div className="login-header">
                            <h2>Créer un Compte</h2>
                            <div className="social-login">
                                <button className="btn-social-icon" onClick={loginWithGoogle} title="Google">
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                                </button>
                            </div>
                            <div className="divider"><span>ou utiliser votre email</span></div>
                        </div>

                        {error && <div className="alert-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Nom"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    placeholder="Mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    placeholder="Confirmer le mot de passe"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-login" disabled={loading}>
                                {loading ? 'Création...' : 'S\'INSCRIRE'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
