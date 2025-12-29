import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';
import './CartSidebar.css';

const CartSidebar = () => {
    const { cart, removeFromCart, isCartOpen, toggleCart, cartTotal } = useCart();

    // Grouping logic if needed, but for now simple list
    // Assuming checkout will be handled via a CheckoutModal or similar flow triggered here.
    // For now we will add a "Checkout" button that might open a modal (to be implemented next).

    // We can reuse ReservationModal logic? Or create a new CheckoutModal.
    // The user asked for "proceed for reservation ... or remove".
    // So "Confirmer la Réservation" button.

    const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setIsCheckoutOpen(true);
        toggleCart(); // Close sidebar
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <div className="cart-overlay" onClick={toggleCart}></div>
                    <motion.div
                        className="cart-sidebar"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="cart-header">
                            <h3>Mon Panier ({cart.length})</h3>
                            <button className="close-cart" onClick={toggleCart}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="cart-content">
                            {cart.length === 0 ? (
                                <div className="empty-cart">
                                    <ShoppingBag size={48} opacity={0.2} />
                                    <p>Votre panier est vide</p>
                                    <button className="btn-secondary" onClick={toggleCart}>
                                        Continuer mes achats
                                    </button>
                                </div>
                            ) : (
                                <div className="cart-items">
                                    {cart.map((item, index) => (
                                        <div key={`${item.id}-${index}`} className="cart-item">
                                            <div className="cart-item-img">
                                                <img src={item.image || item.images?.[0]} alt={item.name} />
                                            </div>
                                            <div className="cart-item-info">
                                                <h4>{item.name}</h4>
                                                <div className="cart-item-meta">
                                                    <span className="cart-item-price">
                                                        {item.isPromo && item.promoPrice ? (
                                                            <>
                                                                <span className="old-price-sm">{item.price}€</span>
                                                                <span className="promo-price-sm">{item.promoPrice}€</span>
                                                            </>
                                                        ) : (
                                                            <span>{item.price}€</span>
                                                        )}
                                                    </span>
                                                    <span className="cart-item-size">Taille: {item.size}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="remove-item-btn"
                                                onClick={() => removeFromCart(item.id)}
                                                title="Retirer du panier"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="cart-footer">
                                <div className="cart-total">
                                    <span>Total</span>
                                    <span className="total-amount">{cartTotal}€</span>
                                </div>
                                <button className="btn-checkout" onClick={handleCheckout}>
                                    Confirmer la Réservation
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
            {/* We will need to render the Checkout Modal here or in App if global */}
            {isCheckoutOpen && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                />
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;
