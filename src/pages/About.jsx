import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';
import './StaticPages.css';

const About = () => {
    return (
        <motion.div
            className="static-page container"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            <h1 className="page-title">Notre Histoire</h1>

            <div className="about-content">
                <div className="about-text">
                    <p className="lead">Winners Superfrip est né d'une passion pour la mode unique et durable.</p>
                    <p>
                        Nous croyons que le style ne devrait pas coûter une fortune, ni à votre portefeuille, ni à la planète.
                        C'est pourquoi nous sélectionnons avec soin les meilleures pièces vintage et seconde main,
                        ainsi que des articles neufs à prix cassés.
                    </p>
                    <p>
                        Basés à Monastir, nous servons une communauté d'étudiants et de passionnés de mode
                        qui cherchent à se démarquer avec des vêtements qu'on ne trouve pas partout.
                    </p>

                    <h3>Nos Valeurs</h3>
                    <ul className="values-list">
                        <li>🌿 <strong>Mode Durable :</strong> Donner une seconde vie aux vêtements.</li>
                        <li>💎 <strong>Qualité :</strong> Sélection rigoureuse de chaque pièce.</li>
                        <li>💸 <strong>Accessibilité :</strong> Des prix justes pour tous.</li>
                    </ul>
                </div>
                <div className="about-image">
                    <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80" alt="Notre boutique" />
                </div>
            </div>
        </motion.div>
    );
};

export default About;
