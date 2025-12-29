import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';
import './StaticPages.css';
import Map from '../components/Map';

const Contact = () => {
    return (
        <motion.div
            className="static-page container"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            <div className="contact-frida-layout">
                <div className="contact-frida-content">
                    {/* Left Column: Info & Hours */}
                    <div className="frida-info-left">
                        <h1 className="frida-title">CONTACT</h1>

                        <div className="frida-locations-section">
                            <div className="location-item">
                                <div className="location-dot"></div>
                                <div className="location-details">
                                    <h3 className="location-name">Winners Monastir</h3>
                                    <p className="location-address">QRFJ+J5R, Monastir, Tunisie</p>
                                    <p className="location-address">Avenue de la République</p>
                                </div>
                            </div>
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
                            <h3>HEURES D'OUVERTURE</h3>
                            <div className="hours-grid">
                                <div className="hours-col">
                                    <p className="day-range">DIMANCHE AU MERCREDI</p>
                                    <p className="time-range">09H00 À 21H00</p>
                                </div>
                                <div className="hours-col">
                                    <p className="day-range">JEUDI AU SAMEDI</p>
                                    <p className="time-range">09H00 À 22H00</p>
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
                            <Map />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Contact;
