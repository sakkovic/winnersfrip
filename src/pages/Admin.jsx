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
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'reservations'
    const [reservations, setReservations] = useState([]);

    const [view, setView] = useState('list'); // 'list' or 'form'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null); // { id, name }

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'hauts',
        origin: 'europe',
        gender: 'femme',
        color: 'noir',
        style: '',
        description: '',
        isNewArrival: false,
        images: [],
        condition: 'seconde_main',
        size: '',
        brand: '',
        material: ''
    });

    // Image Upload State
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);
    const [previewImages, setPreviewImages] = useState([]);
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
        } finally {
            setIsLoading(false);
        }
    };

    // Filter Logic
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Form Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const startCreate = () => {
        setEditingId(null);
        setFormData({
            name: '',
            price: '',
            category: 'hauts',
            origin: 'europe',
            gender: 'femme',
            color: 'noir',
            style: '',
            description: '',
            isNewArrival: false,
            images: [],
            condition: 'seconde_main',
            size: '',
            brand: '',
            material: ''
        });
        setPreviewImages([]);
        setView('form');
    };

    const startEdit = (product, e) => {
        if (e) e.stopPropagation();
        setEditingId(product.id);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            origin: product.origin || 'europe',
            gender: product.gender || 'femme',
            color: product.color || 'noir',
            style: product.style || '',
            description: product.description || '',
            isNewArrival: product.isNewArrival || false,
            images: product.images || (product.image ? [product.image] : []),
            condition: product.condition || 'seconde_main',
            size: product.size || '',
            brand: product.brand || '',
            material: product.material || ''
        });

        const images = product.images || (product.image ? [product.image] : []);
        setPreviewImages(images.map(url => ({ url })));

        setView('form');
    };

    const handleDelete = (product, e) => {
        if (e) e.stopPropagation();
        setDeleteConfirmation({ id: product.id, name: product.name });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;

        const { id } = deleteConfirmation;
        try {
            await deleteDoc(doc(db, "products", id));
            setProducts(prev => prev.filter(p => p.id !== id));
            setDeleteConfirmation(null);
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Erreur lors de la suppression: " + error.message);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    // Image Upload Handlers
    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;

        const newPreviews = Array.from(files).map(file => ({
            url: URL.createObjectURL(file),
            file
        }));
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const removeImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    // Image Compression Helper
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Resize to max 800px width
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.7); // 70% quality
                };
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setUploadError(null);
        setUploadProgress(0);

        try {
            // Upload images first
            const imageUrls = [];

            // Keep existing URLs
            const existingUrls = previewImages.filter(img => !img.file).map(img => img.url);
            imageUrls.push(...existingUrls);

            // Upload new files
            const newFiles = previewImages.filter(img => img.file).map(img => img.file);
            const totalFiles = newFiles.length;

            for (let i = 0; i < totalFiles; i++) {
                const file = newFiles[i];

                // Compress image
                const compressedFile = await compressImage(file);

                const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, compressedFile);
                const url = await getDownloadURL(snapshot.ref);
                imageUrls.push(url);

                // Update progress
                setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
            }

            const productData = {
                ...formData,
                price: Number(formData.price),
                images: imageUrls,
                image: imageUrls[0] || '', // Backwards compatibility
                updatedAt: new Date(),
                status: 'available' // Default status
            };

            if (editingId) {
                await updateDoc(doc(db, "products", editingId), productData);
                setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...productData, id: editingId } : p));
            } else {
                productData.createdAt = new Date();
                const docRef = await addDoc(collection(db, "products"), productData);
                setProducts(prev => [...prev, { ...productData, id: docRef.id }]);
            }

            setView('list');
        } catch (error) {
            console.error("Error saving product:", error);
            setUploadError("Erreur lors de l'enregistrement: " + error.message);
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    // Fetch Reservations
    const fetchReservations = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "reservations"));
            const resData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort by date desc
            resData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            setReservations(resData);
        } catch (error) {
            console.error("Error fetching reservations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'products') fetchProducts();
        if (activeTab === 'reservations') fetchReservations();
    }, [activeTab]);

    // Reservation Actions
    const handleCancelReservation = async (reservation, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Annuler cette réservation et remettre le produit en vente ?")) return;

        try {
            // 1. Update Reservation status
            await updateDoc(doc(db, "reservations", reservation.id), {
                status: 'cancelled'
            });

            // 2. Update Product status (if productId exists)
            if (reservation.productId) {
                await updateDoc(doc(db, "products", reservation.productId), {
                    status: 'available',
                    reservedBy: null
                });
            }

            alert("Réservation annulée.");
            fetchReservations();
        } catch (error) {
            console.error("Error cancelling reservation:", error);
            alert("Erreur lors de l'annulation: " + error.message);
        }
    };

    const handleConfirmReservation = async (reservation, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Confirmer la vente de cet article ?")) return;

        try {
            await updateDoc(doc(db, "reservations", reservation.id), {
                status: 'confirmed'
            });

            // Product remains 'reserved' or change to 'sold' if you prefer
            if (reservation.productId) {
                await updateDoc(doc(db, "products", reservation.productId), {
                    status: 'sold'
                });
            }

            alert("Vente confirmée !");
            fetchReservations();
        } catch (error) {
            console.error("Error confirming reservation:", error);
            alert("Erreur lors de la confirmation: " + error.message);
        }
    };

    // Helper for Size Options
    const getSizeOptions = (category) => {
        const numericSizes = Array.from({ length: 36 }, (_, i) => (i + 15).toString());

        if (category === 'chaussures') {
            return numericSizes;
        }
        // Clothing Sizes
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL', ...numericSizes];
    };

    // Render List View
    if (view === 'list') {
        return (
            <div className="admin-page container">
                <div className="admin-header">
                    <h1>Tableau de Bord</h1>
                    <div className="admin-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            Produits
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reservations')}
                        >
                            Réservations
                        </button>
                    </div>
                    {activeTab === 'products' && (
                        <button className="btn" onClick={startCreate}>
                            <Plus size={20} /> Nouveau Produit
                        </button>
                    )}
                </div>

                {activeTab === 'products' ? (
                    <>
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
                                            <th>Statut</th>
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
                                                            <span className={`status-badge ${product.status || 'available'}`}>
                                                                {product.status === 'reserved' ? 'Réservé' : (product.status === 'sold' ? 'Vendu' : 'Dispo')}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="actions">
                                                                <button className="btn-icon edit" onClick={(e) => startEdit(product, e)} title="Modifier">
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button className="btn-icon delete" onClick={(e) => handleDelete(product, e)} title="Supprimer">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Aucun produit trouvé.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    // RESERVATIONS TAB
                    <div className="table-container">
                        {isLoading ? <div className="loading">Chargement...</div> : (
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th>Client</th>
                                        <th>Contact</th>
                                        <th>Date</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.length > 0 ? (
                                        reservations.map(res => (
                                            <tr key={res.id}>
                                                <td>
                                                    <div className="res-product">
                                                        <img src={res.productImage} alt="" width="40" />
                                                        <span>{res.productName}</span>
                                                    </div>
                                                </td>
                                                <td>{res.userName}</td>
                                                <td>
                                                    <div>{res.userPhone}</div>
                                                    <div style={{ fontSize: '0.8em', color: '#666' }}>{res.userEmail}</div>
                                                </td>
                                                <td>{res.createdAt?.toDate().toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge ${res.status}`}>
                                                        {res.status === 'pending' ? 'En attente' : (res.status === 'confirmed' ? 'Confirmé' : 'Annulé')}
                                                    </span>
                                                </td>
                                                <td>
                                                    {res.status === 'pending' && (
                                                        <div className="actions">
                                                            <button className="btn-icon confirm" onClick={(e) => handleConfirmReservation(res, e)} title="Confirmer Vente">
                                                                <Check size={18} color="green" />
                                                            </button>
                                                            <button className="btn-icon delete" onClick={(e) => handleCancelReservation(res, e)} title="Annuler Réservation">
                                                                <X size={18} color="red" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Aucune réservation.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        );
    }

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
                    {/* Basic Info */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nom du produit</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Robe fleurie Zara" />
                        </div>
                        <div className="form-group">
                            <label>Marque</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Ex: Zara, H&M, Vintage..." />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Prix (€)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>État</label>
                            <select name="condition" value={formData.condition} onChange={handleChange}>
                                <option value="neuf">Neuf avec étiquette</option>
                                <option value="comme_neuf">Comme neuf</option>
                                <option value="tres_bon_etat">Très bon état</option>
                                <option value="bon_etat">Bon état</option>
                                <option value="satisfaisant">Satisfaisant</option>
                                <option value="seconde_main">Seconde Main (Générique)</option>
                            </select>
                        </div>
                    </div>

                    {/* Categories & Details */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Catégorie</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="hauts">Hauts (T-shirts, Chemises...)</option>
                                <option value="bas">Bas (Pantalons, Jupes...)</option>
                                <option value="robes">Robes & Combinaisons</option>
                                <option value="vestes">Vestes & Manteaux</option>
                                <option value="chaussures">Chaussures</option>
                                <option value="accessoires">Accessoires</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Taille</label>
                            <select name="size" value={formData.size} onChange={handleChange}>
                                <option value="">Sélectionner la taille</option>
                                {getSizeOptions(formData.category).map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                                <option value="unique">Taille Unique</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Genre</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="femme">Femme</option>
                                <option value="homme">Homme</option>
                                <option value="enfant">Enfant</option>
                                <option value="unisexe">Unisexe</option>
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

                    {/* Style & Material */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Style</label>
                            <select name="style" value={formData.style} onChange={handleChange}>
                                <option value="">Sélectionner un style</option>
                                <option value="streetwear">Streetwear</option>
                                <option value="vintage">Vintage</option>
                                <option value="sport">Sport / Casual</option>
                                <option value="chic">Chic / Élégant</option>
                                <option value="y2k">Y2K</option>
                                <option value="minimaliste">Minimaliste</option>
                                <option value="boheme">Bohème</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Matière</label>
                            <input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="Ex: Coton, Soie, Cuir..." />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Couleur</label>
                        <select name="color" value={formData.color} onChange={handleChange}>
                            <option value="noir">Noir</option>
                            <option value="blanc">Blanc</option>
                            <option value="gris">Gris</option>
                            <option value="beige">Beige</option>
                            <option value="bleu">Bleu</option>
                            <option value="rouge">Rouge</option>
                            <option value="vert">Vert</option>
                            <option value="jaune">Jaune</option>
                            <option value="rose">Rose</option>
                            <option value="marron">Marron</option>
                            <option value="violet">Violet</option>
                            <option value="orange">Orange</option>
                            <option value="multicolore">Multicolore</option>
                        </select>
                    </div>

                    {/* Images */}
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
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Description détaillée de l'article..."></textarea>
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
                            {isSubmitting ? (uploadProgress > 0 ? `Envoi ${uploadProgress}%...` : 'Traitement...') : (editingId ? 'Modifier' : 'Ajouter')}
                        </button>
                    </div>
                </form>
            </div>
            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div className="modal-overlay">
                    <div className="logout-modal-content">
                        <h3>Confirmer la suppression</h3>
                        <p>Êtes-vous sûr de vouloir supprimer "{deleteConfirmation.name}" ?</p>
                        <div className="logout-modal-actions">
                            <button className="btn-secondary" onClick={cancelDelete}>Annuler</button>
                            <button className="btn-primary-logout" onClick={confirmDelete}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
