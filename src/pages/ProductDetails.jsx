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
            <Link to="/shop" className="back-link"><ArrowLeft size={20} /> Retour à la boutique</Link>

            <div className="product-layout">
                <div className="product-gallery">
                    <div className="main-image">
                        {mainImage ? (
                            <img src={mainImage} alt={product.name} />
                        ) : (
                            <div className="no-image-placeholder">Pas d'image</div>
                        )}
                    </div>
                    {productImages.length > 1 && (
                        <div className="thumbnails">
                            {productImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${mainImage === img ? 'active' : ''}`}
                                    onClick={() => setMainImage(img)}
                                >
                                    <img src={img} alt={`${product.name} ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-info-main">
                    <div className="product-header">
                        <h1>{product.name}</h1>
                        <p className="price-lg">{product.price} {product.currency}</p>
                    </div>

                    <div className="product-meta">
                        <div className="meta-item">
                            <span className="label">Taille:</span>
                            <span className="value">{product.size}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">État:</span>
                            <span className="value badge-text">{product.condition ? product.condition.replace('_', ' ') : 'N/A'}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Origine:</span>
                            <span className="value">{product.origin}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Style:</span>
                            <span className="value">{product.style}</span>
                        </div>
                    </div>

                    <div className="product-description">
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>

                    <div className="product-actions">
                        <button className="btn btn-lg" onClick={() => setIsModalOpen(true)}>
                            Réserver cet article
                        </button>
                        <p className="secure-text"><Check size={16} /> Réservation gratuite & sans engagement</p>
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
