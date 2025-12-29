import React from 'react';
import { ShoppingBag, MessageCircle, CheckCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';
import './StaticPages.css';

const HowItWorks = () => {
    return (
        <motion.div
            className="static-page container"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            <h1 className="page-title">Comment ça marche ?</h1>

            <div className="steps-container">
                <div className="step-card">
                    <div className="step-icon"><ShoppingBag size={40} /></div>
                    <h3>1. Choisissez vos articles</h3>
                    <p>Parcourez notre catalogue de vêtements vintage et neufs. Utilisez les filtres pour trouver votre bonheur.</p>
                </div>

                <div className="step-card">
                    <div className="step-icon"><MessageCircle size={40} /></div>
                    <h3>2. Réservez en un clic</h3>
                    <p>Cliquez sur "Réserver" et envoyez-nous un message pré-rempli sur WhatsApp ou Instagram.</p>
                </div>

                <div className="step-card">
                    <div className="step-icon"><CheckCircle size={40} /></div>
                    <h3>3. Confirmation</h3>
                    <p>Nous confirmons la disponibilité de l'article avec vous instantanément.</p>
                </div>

                <div className="step-card">
                    <div className="step-icon"><CreditCard size={40} /></div>
                    <h3>4. Paiement & Retrait</h3>
                    <p>Le paiement se fait sur place lors du retrait de votre commande en boutique.</p>
                </div>
            </div>

            <div className="cta-section">
                <h2>Prêt à trouver votre style ?</h2>
                <Link to="/shop" className="btn">Voir la boutique</Link>
            </div>
        </motion.div>
    );
};

export default HowItWorks;
