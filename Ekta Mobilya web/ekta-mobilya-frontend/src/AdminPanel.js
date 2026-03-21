import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';
import { GrProductHunt, GrUserAdmin } from "react-icons/gr";
import { MdDashboard, MdDelete, MdEdit } from "react-icons/md";

function AdminPanel() {
    // --- STATE TANIMLAMALARI ---
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [newProduct, setNewProduct] = useState({
        Name: '',
        Price: '',
        Description: '',
        ImageUrl: '',
        Category: 'Genel',
        ModelUrl: '/koltuk.glb'
    });

    // --- YETKİ KONTROLÜ ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || role !== 'Admin') {
            alert("Bu sayfaya erişmek için Admin yetkiniz olmalı!");
            window.location.href = "/login";
        }
    }, []);

    // --- VERİ ÇEKME İŞLEMİ ---
    const fetchProducts = async () => {
        try {
            const res = await axios.get('https://localhost:7087/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error("Ürünler yüklenirken hata:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // --- ÜRÜN SİLME FONKSİYONU ---
    const handleDelete = async (productId) => {
        if (!productId) {
            alert("Ürün ID'si bulunamadı!");
            return;
        }

        const token = localStorage.getItem('token');
        if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

        try {
            await axios.delete(`https://localhost:7087/api/products/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProducts(prev => prev.filter(p => (p.id || p.Id) !== productId));
            alert("Ürün başarıyla silindi.");
        } catch (err) {
            console.error("Silme hatası:", err.response);
            alert("Silme işlemi başarısız.");
        }
    };

    // --- YENİ ÜRÜN EKLEME FONKSİYONU ---
    const handleAddProduct = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const productData = {
            ...newProduct,
            Price: Number(newProduct.Price) || 0
        };

        try {
            await axios.post('https://localhost:7087/api/products', productData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            alert("Ürün başarıyla eklendi!");
            setShowAddModal(false);
            setNewProduct({ Name: '', Price: '', Description: '', ImageUrl: '', Category: 'Genel', ModelUrl: '/koltuk.glb' });
            fetchProducts();
        } catch (err) {
            alert("Ekleme hatası: " + JSON.stringify(err.response?.data));
        }
    };

    // --- GÜNCELLEME FONKSİYONLARI ---
    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
        setShowEditModal(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const id = editingProduct.id || editingProduct.Id;

        // Backend'in beklediği formatta veriyi hazırlıyoruz
        const updatedData = {
            Name: editingProduct.name || editingProduct.Name,
            Price: Number(editingProduct.price || editingProduct.Price),
            Category: editingProduct.category || editingProduct.Category,
            Description: editingProduct.description || editingProduct.Description,
            ImageUrl: editingProduct.imageUrl || editingProduct.ImageUrl,
            ModelUrl: editingProduct.modelUrl || editingProduct.ModelUrl
        };

        try {
            await axios.put(`https://localhost:7087/api/products/${id}`, updatedData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            alert("Ürün güncellendi!");
            setShowEditModal(false);
            fetchProducts();
        } catch (err) {
            console.error("Güncelleme hatası:", err);
            alert("Güncelleme başarısız.");
        }
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo">EKTA PANEL</div>
                <ul>
                    <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                        <MdDashboard /> Dashboard
                    </li>
                    <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
                        <GrProductHunt /> Ürün Yönetimi
                    </li>
                    <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                        <GrUserAdmin /> Kullanıcılar
                    </li>
                </ul>
                <button className="back-to-site" onClick={() => window.location.href = "/"}>Vitrine Dön</button>
            </aside>

            <main className="admin-main">
                {activeTab === 'dashboard' && (
                    <div className="dashboard-view">
                        <h2>Genel Özet</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>{products.length}</h3>
                                <p>Toplam Ürün</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="products-view">
                        <div className="view-header">
                            <h2>Ürün Yönetimi</h2>
                            <button className="add-new-btn" onClick={() => setShowAddModal(true)}>+ Yeni Ürün Ekle</button>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Görsel</th>
                                    <th>Ürün Adı</th>
                                    <th>Fiyat</th>
                                    <th>Kategori</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p, index) => (
                                    <tr key={p.id || p.Id || index}>
                                        <td>
                                            <img src={p.imageUrl || p.ImageUrl || "https://via.placeholder.com/50"} alt="" className="table-img" />
                                        </td>
                                        <td>{p.name || p.Name}</td>
                                        <td>{p.price || p.Price} TL</td>
                                        <td>{p.category || p.Category}</td>
                                        <td className="actions">
                                            <button className="edit-btn" onClick={() => handleEditClick(p)}><MdEdit /></button>
                                            <button className="delete-btn" onClick={() => handleDelete(p.id || p.Id)}><MdDelete /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- EKLEME MODALI --- */}
                {showAddModal && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal">
                            <h2>Yeni Ürün Ekle</h2>
                            <form className="admin-form" onSubmit={handleAddProduct}>
                                <input type="text" placeholder="Ürün Adı" value={newProduct.Name} required onChange={(e) => setNewProduct({ ...newProduct, Name: e.target.value })} />
                                <input type="number" placeholder="Fiyat" value={newProduct.Price} required onChange={(e) => setNewProduct({ ...newProduct, Price: e.target.value })} />
                                <input type="text" placeholder="Kategori" value={newProduct.Category} required onChange={(e) => setNewProduct({ ...newProduct, Category: e.target.value })} />
                                <textarea placeholder="Açıklama" value={newProduct.Description} onChange={(e) => setNewProduct({ ...newProduct, Description: e.target.value })} />
                                <input type="text" placeholder="Görsel URL (/images/koltuk.jpg)" value={newProduct.ImageUrl} onChange={(e) => setNewProduct({ ...newProduct, ImageUrl: e.target.value })} />
                                <input type="text" placeholder="3D Model URL (/models/koltuk.glb)" value={newProduct.ModelUrl} onChange={(e) => setNewProduct({ ...newProduct, ModelUrl: e.target.value })} />
                                <div className="modal-buttons">
                                    <button type="submit" className="save-btn">Ürünü Kaydet</button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>İptal</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- DÜZENLEME MODALI --- */}
                {showEditModal && editingProduct && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal">
                            <h2>Ürünü Düzenle</h2>
                            <form className="admin-form" onSubmit={handleUpdateProduct}>
                                <input 
                                    type="text" 
                                    value={editingProduct.name || editingProduct.Name} 
                                    onChange={(e) => setEditingProduct({ ...editingProduct, Name: e.target.value, name: e.target.value })} 
                                />
                                <input 
                                    type="number" 
                                    value={editingProduct.price || editingProduct.Price} 
                                    onChange={(e) => setEditingProduct({ ...editingProduct, Price: e.target.value, price: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Görsel URL"
                                    value={editingProduct.imageUrl || editingProduct.ImageUrl} 
                                    onChange={(e) => setEditingProduct({ ...editingProduct, ImageUrl: e.target.value, imageUrl: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="3D Model URL"
                                    value={editingProduct.modelUrl || editingProduct.ModelUrl} 
                                    onChange={(e) => setEditingProduct({ ...editingProduct, ModelUrl: e.target.value, modelUrl: e.target.value })} 
                                />
                                <textarea 
                                    placeholder="Açıklama"
                                    value={editingProduct.description || editingProduct.Description} 
                                    onChange={(e) => setEditingProduct({ ...editingProduct, Description: e.target.value, description: e.target.value })} 
                                />
                                <div className="modal-buttons">
                                    <button type="submit" className="save-btn">Güncelle</button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>İptal</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminPanel;