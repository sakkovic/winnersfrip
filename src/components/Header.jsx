import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ShoppingBag } from 'lucide-react';
import './Header.css'; // We'll create a small CSS file for specific header styles if needed, or use inline/global

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

                    {/* Admin Link or Login/Logout */}
                    {currentUser ? (
                        <>
                            <Link to="/admin" className={`admin-link ${isActive('/admin')}`} onClick={() => setIsMenuOpen(false)}>Admin</Link>
                            <button onClick={() => { logout(); setIsMenuOpen(false); }} className="logout-btn" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', padding: 0, textDecoration: 'underline' }}>
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className={isActive('/login')} onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
