import React from 'react';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';
import './StaticPages.css';

const Contact = () => {
    return (
        <div className="static-page container">
            <h1 className="page-title">Contactez-nous</h1>

            <div className="contact-layout">
                <div className="contact-info">
                    <h3>Nos Coordonnées</h3>
                    <div className="contact-item">
                        <Phone size={20} />
                        <span>+216 XX XXX XXX</span>
                    </div>
                    <div className="contact-item">
                        <Mail size={20} />
                        <span>contact@winners-superfrip.com</span>
                    </div>
                    <div className="contact-item">
                        <MapPin size={20} />
                        <span>Monastir, Tunisie</span>
                    </div>
                    <div className="contact-item">
                        <Instagram size={20} />
                        <span>@winners_superfrip</span>
                    </div>

                    <div className="map-placeholder">
                        <p>Carte Google Maps ici</p>
                    </div>
                </div>

                <form className="contact-form">
                    <h3>Envoyez-nous un message</h3>
                    <div className="form-group">
                        <label>Nom</label>
                        <input type="text" required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" required />
                    </div>
                    <div className="form-group">
                        <label>Message</label>
                        <textarea rows="5" required></textarea>
                    </div>
                    <button type="submit" className="btn">Envoyer</button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
