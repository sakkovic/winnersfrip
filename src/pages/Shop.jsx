import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ProductCard from '../components/ProductCard';
import ReservationModal from '../components/ReservationModal';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { pageTransition, staggerContainer, slideUp } from '../utils/animations';
import './Shop.css';

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { products, loading, error } = useProducts();
    const { addToCart } = useCart();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: [],
        condition: searchParams.get('condition') ? [searchParams.get('condition')] : [],
        origin: searchParams.get('origin') ? [searchParams.get('origin')] : [],
        size: [],
        style: [],
        gender: [],
        color: [],
        priceRange: [],
        promotions: false
    });
    const [sort, setSort] = useState('newest');

    // Collapsible State (all open by default or specific ones)
    const [expandedSections, setExpandedSections] = useState({
        price: false,
        gender: false,
        size: false,
        style: false,
        color: false,
        condition: false,
        origin: false,
        category: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Toggle Filter Helper
    const toggleFilter = (type, value) => {
        setFilters(prev => {
            const current = prev[type];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [type]: updated };
        });
    };

    // Price Range Helper
    const checkPriceRange = (price, ranges) => {
        if (ranges.length === 0) return true;
        return ranges.some(range => {
            if (range === '0-20') return price <= 20;
            if (range === '20-50') return price > 20 && price <= 50;
            if (range === '50-100') return price > 50 && price <= 100;
            if (range === '100+') return price > 100;
            return false;
        });
    };

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Search
            if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            // Categories
            if (filters.category.length > 0 && !filters.category.includes(product.category)) return false;

            // Condition
            if (filters.condition.length > 0 && !filters.condition.includes(product.condition)) return false;

            // Origin
            if (filters.origin.length > 0 && !filters.origin.includes(product.origin)) return false;

            // Size
            if (filters.size.length > 0 && !filters.size.includes(product.size)) return false;

            // Style
            if (filters.style.length > 0 && !filters.style.includes(product.style)) return false;

            // Gender
            if (filters.gender.length > 0 && !filters.gender.includes(product.gender)) return false;

            // Color
            if (filters.color.length > 0 && !filters.color.includes(product.color)) return false;

            // Price Range
            if (!checkPriceRange(product.price, filters.priceRange)) return false;

            // Promotions
            if (filters.promotions && !product.isPromo) return false;

            return true;
        }).sort((a, b) => {
            if (sort === 'price-asc') return a.price - b.price;
            if (sort === 'price-desc') return b.price - a.price;
            return 0; // Default to original order (newest usually)
        });
    }, [products, searchTerm, filters, sort]);

    const FilterSection = ({ title, sectionKey, options, type = 'checkbox' }) => (
        <div className="filter-group">
            <div className="filter-header" onClick={() => toggleSection(sectionKey)}>
                <h4>{title}</h4>
                {expandedSections[sectionKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {expandedSections[sectionKey] && (
                <div className="filter-options">
                    {options.map(opt => (
                        <label key={opt.value} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={filters[sectionKey === 'price' ? 'priceRange' : sectionKey].includes(opt.value)}
                                onChange={() => toggleFilter(sectionKey === 'price' ? 'priceRange' : sectionKey, opt.value)}
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );

    if (error) return <div className="container" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Erreur de chargement: {error.message}</div>;

    return (
        <motion.div
            className="shop-page container"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            <div className="shop-header">
                <h1 className="page-title">Boutique</h1>

                <div className="header-controls">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input header-search"
                    />

                    <div className="sort-container">
                        <span className="sort-label">Trier par :</span>
                        <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select header-sort">
                            <option value="newest">Plus récent</option>
                            <option value="price-asc">Prix croissant</option>
                            <option value="price-desc">Prix décroissant</option>
                        </select>
                    </div>

                    <button className="btn-filter-mobile" onClick={() => setIsFilterOpen(true)}>
                        <Filter size={20} /> Filtres
                    </button>
                </div>
            </div>

            <div className="shop-layout">
                {/* Sidebar Filters */}
                <aside className={`shop-sidebar ${isFilterOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Filtres</h3>
                        <button className="close-sidebar" onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
                    </div>

                    <FilterSection
                        title="Prix"
                        sectionKey="price"
                        options={[
                            { value: '0-20', label: '0-20€' },
                            { value: '20-50', label: '20-50€' },
                            { value: '50-100', label: '50-100€' },
                            { value: '100+', label: 'Plus de 100€' }
                        ]}
                    />

                    {/* Promotions Filter */}
                    <div className="filter-group">
                        <div className="filter-header" style={{ cursor: 'default' }}>
                            <h4>Promotions</h4>
                        </div>
                        <div className="filter-options">
                            <label className="checkbox-label" style={{ fontWeight: 'bold', color: '#dc2626' }}>
                                <input
                                    type="checkbox"
                                    checked={filters.promotions}
                                    onChange={() => setFilters(prev => ({ ...prev, promotions: !prev.promotions }))}
                                />
                                Uniquement en Promotion
                            </label>
                        </div>
                    </div>

                    <FilterSection
                        title="Genre"
                        sectionKey="gender"
                        options={[
                            { value: 'homme', label: 'Homme' },
                            { value: 'femme', label: 'Femme' },
                            { value: 'enfant', label: 'Enfant' },
                            { value: 'unisexe', label: 'Unisexe' }
                        ]}
                    />

                    <FilterSection
                        title="Taille"
                        sectionKey="size"
                        options={[
                            'XS', 'S', 'M', 'L', 'XL', 'XXL',
                            '36 EU / 5 US', '37 EU / 6 US', '38 EU / 7 US', '39 EU / 8 US',
                            '40 EU / 7 US', '41 EU / 8 US', '42 EU / 9 US', '43 EU / 10 US',
                            '44 EU / 11 US', '45 EU / 12 US'
                        ].map(s => ({ value: s, label: s }))}
                    />

                    <FilterSection
                        title="Style"
                        sectionKey="style"
                        options={['streetwear', 'vintage', 'sport', 'chic', 'y2k', 'minimaliste'].map(s => ({ value: s, label: s }))}
                    />

                    <FilterSection
                        title="Couleur"
                        sectionKey="color"
                        options={['noir', 'blanc', 'bleu', 'rouge', 'vert', 'beige', 'multicolore'].map(c => ({ value: c, label: c }))}
                    />

                    <FilterSection
                        title="État"
                        sectionKey="condition"
                        options={[
                            { value: 'neuf', label: 'Neuf' },
                            { value: 'seconde_main', label: 'Seconde Main' },
                            { value: 'comme_neuf', label: 'Comme Neuf' }
                        ]}
                    />

                    <FilterSection
                        title="Origine"
                        sectionKey="origin"
                        options={[
                            { value: 'europe', label: 'Europe' },
                            { value: 'local', label: 'Local' }
                        ]}
                    />

                    <FilterSection
                        title="Catégorie"
                        sectionKey="category"
                        options={['hauts', 'bas', 'robes', 'vestes', 'chaussures', 'accessoires'].map(c => ({ value: c, label: c }))}
                    />
                </aside>

                {/* Product Grid */}
                <main className="shop-grid">
                    <div className="results-count">
                        {loading ? 'Chargement...' : `${filteredProducts.length} articles trouvés`}
                    </div>

                    {loading ? (
                        <div className="product-grid">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <div key={n} className="shop-product-wrapper">
                                    <div className="product-card">
                                        <Skeleton height={300} />
                                        <Skeleton count={2} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <motion.div
                            className="product-grid"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredProducts.map(product => (
                                <motion.div
                                    key={product.id}
                                    className="shop-product-wrapper"
                                    variants={slideUp}
                                >
                                    <ProductCard product={product} />
                                    <button
                                        className="btn-reserve-quick"
                                        onClick={() => addToCart(product)}
                                    >
                                        Ajouter au panier
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="no-results">
                            <p>Aucun article ne correspond à vos critères.</p>
                            <button className="btn-secondary" onClick={() => setFilters({ category: [], condition: [], origin: [], size: [], style: [], gender: [], color: [], priceRange: [] })}>
                                Réinitialiser les filtres
                            </button>
                        </div>
                    )}
                </main>
            </div>

            <ReservationModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </motion.div>
    );
};

export default Shop;
