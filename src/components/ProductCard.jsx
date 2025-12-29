import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { slideUp } from '../utils/animations';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { id, name, price, currency, images, image, size, condition, isPromo, promoPrice } = product;
    // Handle both new array format and old string format
    const displayImage = images && images.length > 0 ? images[0] : image;

    // Image loading state
    const [imageLoaded, setImageLoaded] = useState(false);

    // Calculate discount percentage if promo
    const discount = isPromo && promoPrice ? Math.round(((price - promoPrice) / price) * 100) : 0;

    return (
        <motion.div
            className="product-card"
            variants={slideUp}
            initial="initial"
            whileHover="hover"
            animate="initial"
        >
            <motion.div
                className="product-image"
                style={{ overflow: 'hidden', borderRadius: '8px' }}
            >
                <Link to={`/product/${id}`}>
                    <motion.img
                        src={displayImage}
                        alt={name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: imageLoaded ? 1 : 0 }}
                        variants={{
                            hover: { scale: 1.05 },
                            initial: { scale: 1 }
                        }}
                        transition={{ duration: 0.4 }}
                        onLoad={() => setImageLoaded(true)}
                    />
                </Link>
                {product.isNewArrival && <span className="badge-new">Nouveau</span>}
                {isPromo && <span className="badge-promo">-{discount}%</span>}
                {!isPromo && condition === 'seconde_main' && <span className="badge second-hand">Seconde Main</span>}
            </motion.div>
            <div className="product-info">
                {product.brand && <h5 className="product-brand">{product.brand}</h5>}
                <h4 className="product-title"><Link to={`/product/${id}`}>{name}</Link></h4>

                {isPromo ? (
                    <div className="price-container">
                        <span className="price-original">{price} {currency}</span>
                        <span className="price-promo">{promoPrice} {currency}</span>
                    </div>
                ) : (
                    <p className="price">{price} {currency}</p>
                )}
            </div>
        </motion.div>
    );
};

export default ProductCard;
