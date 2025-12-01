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
    const handleCancelReservation = async (reservation) => {
        if (!window.confirm("Annuler cette réservation et remettre le produit en vente ?")) return;
        try {
            // 1. Update Reservation status
            await updateDoc(doc(db, "reservations", reservation.id), {
                status: 'cancelled'
            });
            // 2. Update Product status
            await updateDoc(doc(db, "products", reservation.productId), {
                status: 'available',
                reservedBy: null
            });
            alert("Réservation annulée.");
            fetchReservations();
        } catch (error) {
            console.error("Error cancelling reservation:", error);
            alert("Erreur lors de l'annulation.");
        }
    };

    const handleConfirmReservation = async (reservation) => {
        if (!window.confirm("Confirmer la vente de cet article ?")) return;
        try {
            await updateDoc(doc(db, "reservations", reservation.id), {
                status: 'confirmed'
            });
            // Product remains 'reserved' or change to 'sold' if you prefer
            await updateDoc(doc(db, "products", reservation.productId), {
                status: 'sold'
            });
            alert("Vente confirmée !");
            fetchReservations();
        } catch (error) {
            console.error("Error confirming reservation:", error);
            alert("Erreur lors de la confirmation.");
        }
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
                                                            <button className="btn-icon confirm" onClick={() => handleConfirmReservation(res)} title="Confirmer Vente">
                                                                <Check size={18} color="green" />
                                                            </button>
                                                            <button className="btn-icon delete" onClick={() => handleCancelReservation(res)} title="Annuler Réservation">
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

    // Render Form View (unchanged mostly, just wrapped)
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
