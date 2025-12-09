import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import ReservationModal from '../components/ReservationModal';
import ProductCard from '../components/ProductCard';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mainImage, setMainImage] = useState(null);

    useEffect(() => {
        const fetchProductAndRelated = async () => {
            setLoading(true);
            try {
                // Fetch Product
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const productData = { id: docSnap.id, ...docSnap.data() };
                    setProduct(productData);

                    // Set initial main image
                    const images = productData.images && productData.images.length > 0
                        ? productData.images
                        : (productData.image ? [productData.image] : []);
                    if (images.length > 0) setMainImage(images[0]);

                    // Fetch Related Products (same category)
                    if (productData.category) {
                        const q = query(
                            collection(db, "products"),
                            where("category", "==", productData.category),
                            limit(5) // Fetch 5 to filter out current
                        );
                        const querySnapshot = await getDocs(q);
                        const related = querySnapshot.docs
                            .map(d => ({ id: d.id, ...d.data() }))
                            .filter(p => p.id !== id)
                            .slice(0, 4);
                        setRelatedProducts(related);
                    }
                } else {
                    setProduct(null);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductAndRelated();
    }, [id]);

    if (loading) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Chargement...</div>;
    }

    if (!product) {
        return (
            <div className="container not-found">
                <h2>Produit non trouvé</h2>
                <Link to="/shop" className="btn">Retour à la boutique</Link>
            </div>
        );
    }

    // Handle both new array format and old string format
    const productImages = product.images && product.images.length > 0
        ? product.images
        : (product.image ? [product.image] : []);

    return (
        <div className="product-details-page container">
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <Link to="/">Home</Link>
                <span>&gt;</span>
                <Link to="/shop">Shop</Link>
                <span>&gt;</span>
                <span className="current">{product.name}</span>
            </div>

            <div className="product-layout">
                {/* Gallery Section */}
                <div className="product-gallery-wrapper">
                    <div className="thumbnails-vertical">
                        {productImages.map((img, index) => (
                            <div
                                key={index}
                                className={`thumbnail-item ${mainImage === img ? 'active' : ''}`}
                                onMouseEnter={() => setMainImage(img)}
                                onClick={() => setMainImage(img)}
                            >
                                <img src={img} alt={`${product.name} view ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                    <div className="main-image-container">
                        {mainImage ? (
                            <img src={mainImage} alt={product.name} className="main-img" />
                        ) : (
                            <div className="no-image-placeholder">Pas d'image</div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="product-info-column">
                    <div className="product-header-info">
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-meta-row">
                            {product.discount && <span className="badge-save">Save {product.discount}%</span>}
                            <span className="brand-name">WINNERS MONASTIR</span>
                            <span className="sku">SKU: {product.id.substring(0, 8).toUpperCase()}</span>
                        </div>

                        <div className="reviews-placeholder">
                            <div className="stars">★★★★★</div>
                            <span className="review-count">1 review</span>
                        </div>
                    </div>

                    <div className="selectors-section">
                        {/* Size Selector */}
                        <div className="selector-group">
                            <label>Size: <span className="selected-value">{product.size}</span></label>
                            <div className="size-options">
                                {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                    <button
                                        key={size}
                                        className={`size-btn ${product.size === size ? 'active' : ''} ${product.size !== size ? 'disabled' : ''}`}
                                        disabled={product.size !== size}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Gender/Category Info */}
                        <div className="selector-group">
                            <label>Gender: <span className="selected-value">{product.gender}</span></label>
                            <div className="gender-tag">{product.gender}</div>
                        </div>
                    </div>

                    <div className="price-section">
                        <span className="label">Price:</span>
                        <span className="current-price">{product.price} {product.currency || 'CAD'}</span>
                        {product.originalPrice && <span className="original-price">{product.originalPrice} {product.currency || 'CAD'}</span>}
                        <span className="payment-info">or 4 payments of {(product.price / 4).toFixed(2)} {product.currency || 'CAD'} with <span className="sezzle">sezzle</span></span>
                    </div>

                    <div className="quantity-section">
                        <label>Quantity:</label>
                        <div className="quantity-selector">
                            <button>-</button>
                            <input type="text" value="1" readOnly />
                            <button>+</button>
                        </div>
                        <span className="stock-status">● In stock</span>
                    </div>

                    <div className="action-buttons">
                        {product.status === 'reserved' ? (
                            <button className="btn-black btn-full disabled" disabled>
                                PRODUIT RÉSERVÉ
                            </button>
                        ) : (
                            <button className="btn-black btn-full" onClick={() => setIsModalOpen(true)}>
                                ADD TO CART
                            </button>
                        )}
                    </div>

                    <p className="return-policy">Non-Returnable Item</p>

                    <div className="product-description-accordion">
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <section className="related-products">
                    <h2 className="section-title">Vous aimerez aussi</h2>
                    <div className="product-grid">
                        {relatedProducts.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            <ReservationModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default ProductDetails;
