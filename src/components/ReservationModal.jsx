import React from 'react';
import { X } from 'lucide-react';
import './ReservationModal.css';

const ReservationModal = ({ product, isOpen, onClose }) => {
    if (!isOpen || !product) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const phone = formData.get('phone');

        // Construct WhatsApp message
        const message = `Bonjour, je souhaite réserver l'article suivant : ${product.name} (Réf: ${product.id}). Mon nom est ${name}.`;
        const whatsappUrl = `https://wa.me/216XXXXXXXX?text=${encodeURIComponent(message)}`;

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                <h2>Réserver cet article</h2>
                <div className="modal-product-summary">
                    <img src={product.image} alt={product.name} />
                    <div>
                        <h4>{product.name}</h4>
                        <p className="price">{product.price} {product.currency}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nom complet</label>
                        <input type="text" name="name" required placeholder="Votre nom" />
                    </div>
                    <div className="form-group">
                        <label>Numéro de téléphone</label>
                        <input type="tel" name="phone" required placeholder="Votre numéro" />
                    </div>
                    <div className="form-group">
                        <label>Email (optionnel)</label>
                        <input type="email" name="email" placeholder="Votre email" />
                    </div>

                    <p className="note">
                        En cliquant sur "Confirmer", vous serez redirigé vers WhatsApp pour finaliser la réservation avec nous.
                    </p>

                    <button type="submit" className="btn btn-full">Confirmer sur WhatsApp</button>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;
