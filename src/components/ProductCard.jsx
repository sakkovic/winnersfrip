import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { id, name, price, currency, images, image, size, condition } = product;
    // Handle both new array format and old string format
    const displayImage = images && images.length > 0 ? images[0] : image;

    return (
        <div className="product-card">
            <div className="product-image">
                <Link to={`/product/${id}`}>
                    <img src={displayImage} alt={name} />
                </Link>
                {product.isNewArrival && <span className="badge-new">Nouveau</span>}
                {condition === 'seconde_main' && <span className="badge second-hand">Seconde Main</span>}
            </div>
            <div className="product-info">
                {product.brand && <h5 className="product-brand">{product.brand}</h5>}
                <h4 className="product-title"><Link to={`/product/${id}`}>{name}</Link></h4>
                <p className="price">{price} {currency}</p>
            </div>
        </div>
    );
};

export default ProductCard;
