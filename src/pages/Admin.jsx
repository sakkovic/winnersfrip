import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Upload, Database, X, Image as ImageIcon, Plus, Search, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, writeBatch, doc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { products as localProducts } from '../data/products';
import './Admin.css';

const Admin = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingId, setEditingId] = useState(null);

    // Dashboard Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Form State
    const initialFormState = {
        name: '',
        price: '',
        category: 'hauts',
        size: 'M',
        condition: 'seconde_main',
        origin: 'europe',
        style: 'streetwear',
        gender: 'unisexe',
        color: 'noir',
        description: '',
        isNewArrival: false
    };

    const [formData, setFormData] = useState(initialFormState);
    const [previewImages, setPreviewImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch Products
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);
        } catch (error) {
            console.error("Error fetching products:", error);
            alert("Erreur lors du chargement des produits.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Filtered Products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // CRUD Actions
    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
        try {
            await deleteDoc(doc(db, "products", id));
            setProducts(prev => prev.filter(p => p.id !== id));
            alert("Produit supprimé !");
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Erreur lors de la suppression.");
        }
    };

    const startEdit = (product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            size: product.size,
            condition: product.condition,
            origin: product.origin,
            style: product.style,
            gender: product.gender,
            color: product.color,
            description: product.description,
            isNewArrival: product.isNewArrival || false
        });

        // Handle images
        const images = product.images || (product.image ? [product.image] : []);
        setPreviewImages(images.map(url => ({ url, name: 'Image existante' })));

        setView('form');
    };

    const startCreate = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setPreviewImages([]);
        setView('form');
    };

    // Form Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;
        setUploadProgress(10);
        setUploadError(null);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                setPreviewImages(prev => [...prev, { url, name: file.name }]);
                setUploadProgress(Math.round(((i + 1) / files.length) * 100));
            } catch (error) {
                console.error(`Upload error:`, error);
                setUploadError(`Erreur: ${error.message}`);
            }
        }
        setUploadProgress(0);
    };

    const removeImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Optional image check
        if (previewImages.length === 0) {
            if (!window.confirm("Continuer sans image ?")) return;
        }

        setIsSubmitting(true);
        try {
            const imageUrls = previewImages.map(img => img.url);
            const productData = {
                ...formData,
                images: imageUrls,
                price: Number(formData.price),
                currency: "€",
                updatedAt: new Date()
            };

            if (editingId) {
                // Update
                await updateDoc(doc(db, "products", editingId), productData);
                alert("Produit modifié avec succès !");
            } else {
                // Create
                productData.createdAt = new Date();
                await addDoc(collection(db, "products"), productData);
                alert("Produit ajouté avec succès !");
            }

            fetchProducts(); // Refresh list
            setView('list');
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Erreur lors de l'enregistrement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Drag & Drop Handlers
    const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };

    // Render List View
    if (view === 'list') {
        return (
            <div className="admin-page container">
                <div className="admin-header">
                    <h1>Tableau de Bord</h1>
                    <button className="btn" onClick={startCreate}>
                        <Plus size={20} /> Nouveau Produit
                    </button>
                </div>

                <div className="admin-toolbar">
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="category-filter"
                    >
                        <option value="all">Toutes les catégories</option>
                        <option value="hauts">Hauts</option>
                        <option value="bas">Bas</option>
                        <option value="robes">Robes</option>
                        <option value="vestes">Vestes</option>
                        <option value="chaussures">Chaussures</option>
                        <option value="accessoires">Accessoires</option>
                    </select>
                </div>

                {isLoading ? (
                    <div className="loading">Chargement...</div>
                ) : (
                    <div className="table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Nom</th>
                                    <th>Catégorie</th>
                                    <th>Prix</th>
                                    <th>État</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => {
                                        const img = product.images?.[0] || product.image;
                                        return (
                                            <tr key={product.id}>
                                                <td>
                                                    <div className="table-img">
                                                        {img ? <img src={img} alt={product.name} /> : <div className="no-img">No Img</div>}
                                                    </div>
                                                </td>
                                                <td>{product.name}</td>
                                                <td><span className="badge">{product.category}</span></td>
                                                <td>{product.price}€</td>
                                                <td>{product.condition}</td>
                                                <td>
                                                    <div className="actions">
                                                        <button className="btn-icon edit" onClick={() => startEdit(product)} title="Modifier">
                                                            <Edit size={18} />
                                                        </button>
                                                        <button className="btn-icon delete" onClick={() => handleDelete(product.id)} title="Supprimer">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Aucun produit trouvé.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    // Render Form View
    return (
        <div className="admin-page container">
            <div className="form-header">
                <button className="btn-back" onClick={() => setView('list')}>
                    <ArrowLeft size={20} /> Retour
                </button>
                <h1>{editingId ? 'Modifier le Produit' : 'Ajouter un Produit'}</h1>
            </div>

            <div className="admin-layout">
                <form onSubmit={handleSubmit} className="admin-form">
                    {/* Reuse existing form fields */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nom du produit</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Prix (€)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Catégorie</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="hauts">Hauts</option>
                                <option value="bas">Bas</option>
                                <option value="robes">Robes</option>
                                <option value="vestes">Vestes</option>
                                <option value="chaussures">Chaussures</option>
                                <option value="neuf">Neuf</option>
                                <option value="seconde_main">Seconde Main</option>
                                <option value="comme_neuf">Comme Neuf</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Origine</label>
                            <select name="origin" value={formData.origin} onChange={handleChange}>
                                <option value="europe">Europe</option>
                                <option value="local">Local</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Genre</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="homme">Homme</option>
                                <option value="femme">Femme</option>
                                <option value="enfant">Enfant</option>
                                <option value="unisexe">Unisexe</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Couleur</label>
                            <select name="color" value={formData.color} onChange={handleChange}>
                                <option value="noir">Noir</option>
                                <option value="blanc">Blanc</option>
                                <option value="bleu">Bleu</option>
                                <option value="rouge">Rouge</option>
                                <option value="vert">Vert</option>
                                <option value="beige">Beige</option>
                                <option value="marron">Marron</option>
                                <option value="multicolore">Multicolore</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Style</label>
                        <input type="text" name="style" value={formData.style} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Images</label>
                        <div
                            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                hidden
                                multiple
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e.target.files)}
                            />
                            <Upload size={32} color={isDragging ? "#007bff" : "#666"} />
                            <p>{isDragging ? "Déposez..." : "Glissez ou cliquez pour ajouter des images"}</p>
                            {uploadProgress > 0 && <div className="progress-bar"><div style={{ width: `${uploadProgress}%` }}></div></div>}
                        </div>
                        {uploadError && <div className="error-message">{uploadError}</div>}

                        {previewImages.length > 0 && (
                            <div className="image-previews">
                                {previewImages.map((img, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={img.url} alt="Preview" />
                                        <button type="button" onClick={() => removeImage(index)} className="remove-img"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3"></textarea>
                    </div>

                    <div className="form-group checkbox">
                        <label>
                            <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} />
                            Nouvelle Arrivée ?
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setView('list')}>Annuler</button>
                        <button type="submit" className="btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Enregistrement...' : (editingId ? 'Modifier' : 'Ajouter')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Admin;
