import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import './Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setIsMenuOpen(false);
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        try {
            await logout();
            setShowLogoutConfirm(false);
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <>
            <header className="header">
                <div className="container nav-container">
                    {/* Left: Logo */}
                    <Link to="/" className="logo">
                        Winners Superfrip
                    </Link>

                    {/* Center: Navigation Links (Desktop) */}
                    <nav className="nav-center">
                        <Link to="/" className={isActive('/')}>Accueil</Link>
                        <Link to="/shop" className={isActive('/shop')}>Boutique</Link>
                        <Link to="/how-it-works" className={isActive('/how-it-works')}>Comment ça marche</Link>
                        <Link to="/about" className={isActive('/about')}>A propos</Link>
                        <Link to="/contact" className={isActive('/contact')}>Contact</Link>
                    </nav>

                    {/* Right: Auth */}
                    <div className="nav-right">
                        {/* Desktop Auth */}
                        <div className="auth-desktop">
                            {currentUser ? (
                                <div className="auth-actions">
                                    {currentUser.email === 'anis.federe@gmail.com' && (
                                        <Link to="/admin" className={`admin-link ${isActive('/admin')}`}>Admin</Link>
                                    )}
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            <User size={18} />
                                        </div>
                                        <span className="user-name">Bienvenue, {currentUser.displayName || currentUser.email.split('@')[0]}</span>
                                    </div>
                                    <button onClick={handleLogoutClick} className="logout-btn">
                                        Déconnexion
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className={`login-link ${isActive('/login')}`}>Connexion</Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <div className={`mobile-toggle ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                    {/* Mobile Auth (Top) */}
                    <div className="mobile-auth-top">
                        {currentUser ? (
                            <div className="mobile-user-info">
                                <div className="user-info-top">
                                    <div className="user-avatar">
                                        <User size={24} />
                                    </div>
                                    <span className="user-name">Bienvenue, {currentUser.displayName || currentUser.email.split('@')[0]}</span>
                                </div>
                                <div className="mobile-auth-actions">
                                    {currentUser.email === 'anis.federe@gmail.com' && (
                                        <Link to="/admin" className={`admin-link ${isActive('/admin')}`} onClick={() => setIsMenuOpen(false)}>Admin</Link>
                                    )}
                                    <button onClick={handleLogoutClick} className="logout-btn mobile-logout">
                                        Déconnexion
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mobile-login-container">
                                <span className="welcome-text">Bienvenue !</span>
                                <Link to="/login" className="login-link mobile-login-btn" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                            </div>
                        )}
                    </div>

                    <nav className="mobile-nav-links">
                        <Link to="/" className={isActive('/')} onClick={() => setIsMenuOpen(false)}>Accueil</Link>
                        <Link to="/shop" className={isActive('/shop')} onClick={() => setIsMenuOpen(false)}>Boutique</Link>
                        <Link to="/how-it-works" className={isActive('/how-it-works')} onClick={() => setIsMenuOpen(false)}>Comment ça marche</Link>
                        <Link to="/about" className={isActive('/about')} onClick={() => setIsMenuOpen(false)}>A propos</Link>
                        <Link to="/contact" className={isActive('/contact')} onClick={() => setIsMenuOpen(false)}>Contact</Link>
                    </nav>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="logout-modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Confirmation</h3>
                        <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
                        <div className="logout-modal-actions">
                            <button className="btn-secondary" onClick={() => setShowLogoutConfirm(false)}>Annuler</button>
                            <button className="btn-primary-logout" onClick={confirmLogout}>Se déconnecter</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
