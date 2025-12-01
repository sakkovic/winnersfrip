import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-col">
                    <h3>Winners Superfrip</h3>
                    <p>Votre destination pour la mode vintage et streetwear à prix abordable.</p>
                </div>
                <div className="footer-col">
                    <h3>Liens Rapides</h3>
                    <ul>
                        <li><Link to="/shop">Boutique</Link></li>
                        <li><Link to="/how-it-works">Comment réserver</Link></li>
                        <li><Link to="/about">Notre histoire</Link></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h3>Contact</h3>
                    <ul>
                        <li>📍 Monastir, Tunisie</li>
                        <li>📞 +216 XX XXX XXX</li>
                        <li>📸 @winners_superfrip</li>
                    </ul>
                </div>
            </div>
            <div className="copyright">
                &copy; {new Date().getFullYear()} Winners Superfrip. Tous droits réservés.
            </div>
        </footer>
    );
};

export default Footer;
