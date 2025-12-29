import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { addDoc, collection, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './ReservationModal.css'; // Reusing styles

const CheckoutModal = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const { cart, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    if (!currentUser) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                    <h2>Connexion requise</h2>
                    <p>Vous devez être connecté pour réserver des articles.</p>
                    <button className="btn btn-full" onClick={() => { onClose(); navigate('/login'); }}>Se connecter</button>
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
            // We store the list of items
            const reservationData = {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                userName: formData.get('name'),
                userPhone: phone,
                status: 'pending',
                createdAt: new Date(),
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    promoPrice: item.promoPrice || null,
                    image: item.images?.[0] || item.image
                })),
                totalAmount: cartTotal
            };

            await addDoc(collection(db, "reservations"), reservationData);

            // 2. Update Product Statuses (Batch)
            const batch = writeBatch(db);
            cart.forEach(item => {
                const productRef = doc(db, "products", item.id);
                batch.update(productRef, {
                    status: 'reserved',
                    reservedBy: currentUser.uid
                });
            });
            await batch.commit();

            alert("Réservation confirmée pour " + cart.length + " articles !");
            clearCart();
            onClose();
        } catch (error) {
            console.error("Error creating reservation:", error);
            alert("Erreur lors de la réservation: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                <h2>Confirmer la Réservation</h2>

                <div className="modal-product-summary" style={{ display: 'block', maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem' }}>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                            <img src={item.images?.[0] || item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {item.isPromo && item.promoPrice ? item.promoPrice : item.price}€
                                </div>
                            </div>
                        </div>
                    ))}
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px', fontWeight: 'bold', textAlign: 'right' }}>
                        Total: {cartTotal}€
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

                    <p className="note">
                        La réservation bloque ces articles pour vous. Nous vous contacterons rapidement.
                    </p>

                    <button type="submit" className="btn btn-full" disabled={loading}>
                        {loading ? 'Traitement...' : 'Confirmer tout le panier'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;
