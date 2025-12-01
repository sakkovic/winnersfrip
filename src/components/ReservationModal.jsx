import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './ReservationModal.css';

const ReservationModal = ({ product, isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    if (!isOpen || !product) return null;

    if (!currentUser) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                    <h2>Connexion requise</h2>
                    <p>Vous devez être connecté pour réserver un article.</p>
                    <button className="btn btn-full" onClick={() => navigate('/login')}>Se connecter</button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const phone = formData.get('phone');

        try {
            // 1. Create Reservation
            await addDoc(collection(db, "reservations"), {
                productId: product.id,
                productName: product.name,
                productPrice: product.price,
                productImage: product.images?.[0] || product.image,
                userId: currentUser.uid,
                userEmail: currentUser.email,
                userName: formData.get('name'),
                userPhone: phone,
                status: 'pending', // pending, confirmed, cancelled
                createdAt: new Date()
            });

            // 2. Update Product Status
            await updateDoc(doc(db, "products", product.id), {
                status: 'reserved',
                reservedBy: currentUser.uid
            });

            alert("Réservation effectuée avec succès ! Nous vous contacterons bientôt.");
            onClose();
            // Optionally refresh page or parent state
            window.location.reload();
        } catch (error) {
            console.error("Error creating reservation:", error);
            alert("Erreur lors de la réservation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                <h2>Réserver cet article</h2>
                <div className="modal-product-summary">
                    <img src={product.images?.[0] || product.image} alt={product.name} />
                    <div>
                        <h4>{product.name}</h4>
                        <p className="price">{product.price} {product.currency}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nom complet</label>
                        <input type="text" name="name" required placeholder="Votre nom" defaultValue={currentUser.displayName || ''} />
                    </div>
                    <div className="form-group">
                        <label>Numéro de téléphone</label>
                        <input type="tel" name="phone" required placeholder="Votre numéro" />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={currentUser.email} disabled />
                    </div>

                    <p className="note">
                        La réservation bloque l'article pour vous. Nous vous contacterons pour finaliser l'achat.
                    </p>

                    <button type="submit" className="btn btn-full" disabled={loading}>
                        {loading ? 'Traitement...' : 'Confirmer la réservation'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;
