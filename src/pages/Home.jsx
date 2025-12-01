import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import About from './About';
import Contact from './Contact';
import HowItWorks from './HowItWorks';
import './Home.css';

const Home = () => {
    const { products, loading } = useProducts();
    // Get first 4 new arrivals
    const featuredProducts = products.filter(p => p.isNewArrival).slice(0, 4);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Vintage, Streetwear & <br />Nouvelles Arrivées d'Europe</h1>
                    <p>La mode durable à petit prix. Découvrez notre sélection unique.</p>
                    <div className="hero-buttons">
                        <Link to="/shop" className="btn">Voir la boutique</Link>
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="featured container">
                <h2 className="section-title">Nos Univers</h2>
                <div className="categories-grid">
                    <Link to="/shop?origin=europe" className="category-card">
                        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80" alt="Europe" />
                        <div className="category-info">
                            <h3>Arrivages Europe</h3>
                            <p>Pièces uniques importées</p>
                        </div>
                    </Link>
                    <Link to="/shop?condition=neuf" className="category-card">
                        <img src="https://images.unsplash.com/photo-1485230946086-1d99d5266642?auto=format&fit=crop&w=600&q=80" alt="Neuf" />
                        <div className="category-info">
                            <h3>Articles Neufs</h3>
                            <p>Jamais portés, prix cassés</p>
                        </div>
                    </Link>
                    <Link to="/shop?condition=seconde_main" className="category-card">
                        <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80" alt="Seconde Main" />
                        <div className="category-info">
                            <h3>Seconde Main</h3>
                            <p>Vintage & Éco-responsable</p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="new-arrivals container">
                <h2 className="section-title">Dernières Pépites</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement des nouveautés...</div>
                ) : (
                    <div className="product-grid">
                        {featuredProducts.length > 0 ? (
                            featuredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', width: '100%' }}>Aucune nouveauté pour le moment.</p>
                        )}
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link to="/shop" className="btn">Tout voir</Link>
                </div>
            </section>

            {/* Info Sections */}
            <div className="info-sections">
                <HowItWorks />
                <About />
                <Contact />
            </div>
        </div>
    );
};

export default Home;
