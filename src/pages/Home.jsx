import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, ShieldCheck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import About from './About';
import Contact from './Contact';
import HowItWorks from './HowItWorks';
import { fadeIn, slideUp, staggerContainer, pageTransition } from '../utils/animations';
import ScrollReveal from '../components/ScrollReveal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './Home.css';

const Home = () => {
    const { products, loading } = useProducts();
    // Get first 4 new arrivals
    const featuredProducts = products.filter(p => p.isNewArrival).slice(0, 4);

    return (
        <motion.div
            className="home-page"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            {/* Hero Section */}
            <section className="hero">
                <motion.div
                    className="hero-content"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1 variants={slideUp}>
                        Vintage, Streetwear & <br />Nouvelles Arrivées d'Europe
                    </motion.h1>
                    <motion.p variants={slideUp}>
                        La mode durable à petit prix. Découvrez notre sélection unique.
                    </motion.p>
                    <motion.div className="hero-buttons" variants={slideUp}>
                        <Link to="/shop" className="btn">Voir la boutique</Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Featured Categories */}
            <section className="featured container">
                <ScrollReveal width="100%">
                    <h2 className="section-title">Nos Univers</h2>
                </ScrollReveal>
                <motion.div
                    className="categories-grid"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <motion.div variants={slideUp} className="category-card-wrapper">
                        <Link to="/shop?origin=europe" className="category-card">
                            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80" alt="Europe" />
                            <div className="category-info">
                                <h3>Arrivages Europe</h3>
                                <p>Pièces uniques importées</p>
                            </div>
                        </Link>
                    </motion.div>
                    <motion.div variants={slideUp} className="category-card-wrapper">
                        <Link to="/shop?condition=neuf" className="category-card">
                            <img src="https://images.unsplash.com/photo-1485230946086-1d99d5266642?auto=format&fit=crop&w=600&q=80" alt="Neuf" />
                            <div className="category-info">
                                <h3>Articles Neufs</h3>
                                <p>Jamais portés, prix cassés</p>
                            </div>
                        </Link>
                    </motion.div>
                    <motion.div variants={slideUp} className="category-card-wrapper">
                        <Link to="/shop?condition=seconde_main" className="category-card">
                            <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80" alt="Seconde Main" />
                            <div className="category-info">
                                <h3>Seconde Main</h3>
                                <p>Vintage & Éco-responsable</p>
                            </div>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* New Arrivals */}
            <section className="new-arrivals container">
                <ScrollReveal width="100%">
                    <h2 className="section-title">Dernières Pépites</h2>
                </ScrollReveal>

                {loading ? (
                    <div className="product-grid">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="product-card">
                                <Skeleton height={300} />
                                <Skeleton count={2} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        className="product-grid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {featuredProducts.length > 0 ? (
                            featuredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', width: '100%' }}>Aucune nouveauté pour le moment.</p>
                        )}
                    </motion.div>
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
        </motion.div>
    );
};

export default Home;
