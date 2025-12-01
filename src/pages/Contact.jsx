import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Video } from 'lucide-react';
import './StaticPages.css';

const Contact = () => {
    return (
        <div className="static-page container">
            <div className="contact-frida-layout">
                <div className="contact-frida-content">
                    {/* Left Column: Info & Hours */}
                    <div className="frida-info-left">
                        <h1 className="frida-title">WINNERS</h1>

                        <div className="frida-address-section">
                            <p>MONASTIR, TUNISIE</p>
                            <p>AVENUE DE LA RÉPUBLIQUE</p>
                            <p>5000</p>
                        </div>

                        <div className="frida-contact-section">
                            <p className="frida-phone">+216 XX XXX XXX</p>
                            <p className="frida-email">CONTACT@WINNERS.COM</p>
                        </div>

                        <div className="frida-social-icons">
                            <a href="#"><Facebook size={24} /></a>
                            <a href="#"><Instagram size={24} /></a>
                        </div>

                        <div className="frida-hours-section">
                            <h3>BUSINESS HOURS</h3>
                            <div className="hours-grid">
                                <div className="hours-col">
                                    <p className="day-range">SUNDAY TO WEDNESDAY</p>
                                    <p className="time-range">9:00 A.M. TO 9:00 P.M.</p>
                                </div>
                                <div className="hours-col">
                                    <p className="day-range">THURSDAY TO SATURDAY</p>
                                    <p className="time-range">9:00 A.M. TO 10:00 P.M.</p>
                                </div>
                            </div>
                        </div>

                        <div className="frida-footer-note">
                            <p>© {new Date().getFullYear()} WINNERS SUPERFRIP</p>
                        </div>
                    </div>

                    {/* Right Column: Map */}
                    <div className="frida-map-right">
                        <div className="map-frame">
                            <iframe 
                                title="Location Map"
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight="0" 
                                marginWidth="0" 
                                src="https://maps.google.com/maps?q=QRCM+5H5,+Monastir,+Tunisie&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                style={{ border: 0, display: 'block' }}
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
