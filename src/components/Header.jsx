import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ShoppingBag } from 'lucide-react';
import './Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <header className="header">
            <div className="container nav-container">
                <Link to="/" className="logo">
                    Winners Superfrip
                </Link>

                <div className="mobile-toggle" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </div>

                <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/" className={isActive('/')} onClick={() => setIsMenuOpen(false)}>Accueil</Link>
                    <Link to="/shop?gender=homme" className={isActive('/shop?gender=homme')} onClick={() => setIsMenuOpen(false)}>Homme</Link>
                    <Link to="/shop?gender=femme" className={isActive('/shop?gender=femme')} onClick={() => setIsMenuOpen(false)}>Femme</Link>
                    <Link to="/shop?gender=enfant" className={isActive('/shop?gender=enfant')} onClick={() => setIsMenuOpen(false)}>Enfant</Link>

                    <Link to="/how-it-works" className={isActive('/how-it-works')} onClick={() => setIsMenuOpen(false)}>Comment ça marche</Link>
                    <Link to="/about" className={isActive('/about')} onClick={() => setIsMenuOpen(false)}>A propos</Link>
                    <Link to="/contact" className={isActive('/contact')} onClick={() => setIsMenuOpen(false)}>Contact</Link>

                    {/* Auth Section */}
                    {currentUser ? (
                        <div className="auth-actions">
                            {currentUser.email === 'anis.federe@gmail.com' ? (
                                <Link to="/admin" className={`admin-link ${isActive('/admin')}`} onClick={() => setIsMenuOpen(false)}>Admin</Link>
                            ) : (
                                <span className="user-name">Bienvenue, {currentUser.displayName || currentUser.email.split('@')[0]}</span>
                            )}
                            <button onClick={() => { logout(); setIsMenuOpen(false); }} className="logout-btn">
                                Déconnexion
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className={`login-link ${isActive('/login')}`} onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
