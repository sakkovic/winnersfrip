import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // Reuse login styles

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(email);
            setMessage('Vérifiez votre boîte de réception pour les instructions.');
        } catch (err) {
            console.error("Reset password error:", err);
            setError('Échec de la réinitialisation du mot de passe.');
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-form-side" style={{ width: '100%' }}>
                    <div className="login-card">
                        <div className="login-header">
                            <h2>Réinitialiser le mot de passe</h2>
                            <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
                                Entrez votre email pour recevoir les instructions.
                            </p>
                        </div>

                        {error && <div className="alert-error">{error}</div>}
                        {message && <div className="alert-success">{message}</div>}

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-login" disabled={loading}>
                                {loading ? 'Envoi...' : 'RÉINITIALISER'}
                            </button>
                        </form>

                        <div className="auth-links" style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link to="/login" className="forgot-password-link">
                                Retour à la connexion
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
