import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle, userRole } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (userRole === 'admin') navigate('/admin');
        if (userRole === 'client') navigate('/shop');
    }, [userRole, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            // Navigation handled by useEffect
        } catch (err) {
            console.error("Login error:", err);
            setError('Échec de la connexion. Vérifiez vos identifiants.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                {/* Form Side */}
                <div className="auth-form-side">
                    <div className="login-card">
                        <div className="login-header">
                            <h2>Se Connecter</h2>
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
                                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                    <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#666', textDecoration: 'none' }}>
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                            </div>
                            <button type="submit" className="btn-login" disabled={loading}>
                                {loading ? 'Connexion...' : 'SE CONNECTER'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Side */}
                <div className="auth-info-side">
                    <div className="auth-info-content">
                        <h2>Bonjour, Ami !</h2>
                        <p>Entrez vos informations personnelles et commencez votre voyage avec nous</p>
                        <button className="btn-ghost" onClick={() => navigate('/signup')}>
                            S'INSCRIRE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
