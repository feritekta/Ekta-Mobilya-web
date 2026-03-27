import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';
import { GrProductHunt } from "react-icons/gr";
import { MdDashboard, MdDelete, MdEdit } from "react-icons/md";

const API_BASE_URL = "https://localhost:7087";

function AdminPanel() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const [modelFile, setModelFile] = useState(null);

    const [newProduct, setNewProduct] = useState({
        Name: '', Price: '', Description: '', Category: 'Genel'
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'Admin') {
            alert("Admin girişi gerekli!");
            window.location.href = "/login";
        }
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products`);
            setProducts(res.data);
        } catch (err) { console.error("Hata:", err); }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append("Name", newProduct.Name);
        formData.append("Price", newProduct.Price);
        formData.append("Description", newProduct.Description || "");
        formData.append("Category", newProduct.Category || "Genel");

        if (imageFile) formData.append("ImageFile", imageFile);
        if (modelFile) formData.append("ModelFile", modelFile);

        try {
            await axios.post(`${API_BASE_URL}/api/products/add`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            alert("Ürün başarıyla eklendi!");
            setShowAddModal(false);
            setNewProduct({ Name: '', Price: '', Description: '', Category: 'Genel' });
            setImageFile(null);
            setModelFile(null);
            fetchProducts();
        } catch (err) { 
            alert("Ekleme başarısız."); 
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        
        formData.append("Name", editingProduct.name || editingProduct.Name);
        formData.append("Price", editingProduct.price || editingProduct.Price);
        formData.append("Description", editingProduct.description || editingProduct.Description || "");
        formData.append("Category", editingProduct.category || editingProduct.Category || "Genel");

        if (imageFile) formData.append("ImageFile", imageFile);
        if (modelFile) formData.append("ModelFile", modelFile);

        try {
            const id = editingProduct.id || editingProduct.Id;
            await axios.put(`${API_BASE_URL}/api/products/update/${id}`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Ürün güncellendi!");
            setShowEditModal(false);
            setImageFile(null);
            setModelFile(null);
            fetchProducts();
        } catch (err) { 
            alert("Güncellenemedi."); 
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_BASE_URL}/api/products/delete/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProducts(prev => prev.filter(p => (p.id || p.Id) !== productId));
        } catch (err) { alert("Silinemedi."); }
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo">EKTA PANEL</div>
                <ul>
                    <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}><MdDashboard /> Dashboard</li>
                    <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}><GrProductHunt /> Ürün Yönetimi</li>
                </ul>
                <button className="back-to-site" onClick={() => window.location.href = "/"}>Vitrine Dön</button>
            </aside>

            <main className="admin-main">
                {activeTab === 'products' && (
                    <div className="products-view">
                        <div className="view-header">
                            <h2>Ürün Yönetimi</h2>
                            <button className="add-new-btn" onClick={() => setShowAddModal(true)}>+ Yeni Ürün</button>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr><th>Görsel</th><th>Ad</th><th>Fiyat</th><th>İşlem</th></tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id || p.Id}>
                                        <td>
                                            <img
                                                src={p.imageUrl?.startsWith('/') ? `${API_BASE_URL}${p.imageUrl}` : p.imageUrl}
                                                alt="Ürün"
                                                className="table-img"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                                            />
                                        </td>
                                        <td>{p.name || p.Name}</td>
                                        <td>{p.price || p.Price} TL</td>
                                        <td>
                                            <button className="edit-btn" onClick={() => { setEditingProduct(p); setShowEditModal(true); }}><MdEdit /></button>
                                            <button className="delete-btn" onClick={() => handleDelete(p.id || p.Id)}><MdDelete /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* EKLEME MODALI */}
                {showAddModal && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal">
                            <h2>Yeni Ürün Ekle</h2>
                            <form className="admin-form" onSubmit={handleAddProduct}>
                                <input type="text" placeholder="Ürün Adı" required value={newProduct.Name} onChange={e => setNewProduct({ ...newProduct, Name: e.target.value })} />
                                <input type="number" placeholder="Fiyat" required value={newProduct.Price} onChange={e => setNewProduct({ ...newProduct, Price: e.target.value })} />
                                <input type="text" placeholder="Kategori" value={newProduct.Category} onChange={e => setNewProduct({ ...newProduct, Category: e.target.value })} />
                                <textarea placeholder="Açıklama" value={newProduct.Description} onChange={e => setNewProduct({ ...newProduct, Description: e.target.value })} />

                                <label>Ürün Resmi:</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />

                                <label>3D Model (.glb):</label>
                                <input type="file" accept=".glb" onChange={e => setModelFile(e.target.files[0])} />

                                <div className="modal-buttons">
                                    <button type="submit" className="save-btn">Kaydet</button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>İptal</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* DÜZENLEME MODALI */}
                {showEditModal && editingProduct && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal">
                            <h2>Ürünü Düzenle: {editingProduct.name || editingProduct.Name}</h2>
                            <form className="admin-form" onSubmit={handleUpdateProduct}>
                                <input 
                                    type="text" 
                                    value={editingProduct.name || editingProduct.Name || ""} 
                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} 
                                />
                                <input 
                                    type="number" 
                                    value={editingProduct.price || editingProduct.Price || ""} 
                                    onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} 
                                />
                                
                                <label>Yeni Resim (Opsiyonel):</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                                
                                <label>Yeni 3D Model (Opsiyonel):</label>
                                <input type="file" accept=".glb" onChange={e => setModelFile(e.target.files[0])} />

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