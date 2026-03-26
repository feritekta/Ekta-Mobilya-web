import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';
import { GrProductHunt, } from "react-icons/gr";
import { MdDashboard, MdDelete, MdEdit } from "react-icons/md";

function AdminPanel() {
    // --- STATE'LER ---
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Dosya state'leri (Kullanıcının bilgisayarından seçtiği ham dosyalar)
    const [imageFile, setImageFile] = useState(null);
    const [modelFile, setModelFile] = useState(null);

    const [newProduct, setNewProduct] = useState({
        Name: '', Price: '', Description: '', Category: 'Genel'
    });

    // --- YETKİ VE VERİ ÇEKME ---
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
            const res = await axios.get('https://localhost:7087/api/products');
            setProducts(res.data);
        } catch (err) { console.error("Hata:", err); }
    };

    // --- DOSYA YÜKLEME FONKSİYONU (API'ye Dosya Atar) ---
    const uploadToApi = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append('file', file); // Backend'deki "IFormFile file" ile aynı isim

        try {
            const res = await axios.post('https://localhost:7087/api/products/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.url; // Dönen değer: /uploads/abc.jpg
        } catch (err) {
            console.error("Dosya yükleme hatası:", err);
            return null;
        }
    };

    // --- ÜRÜN EKLEME (Önce Dosya, Sonra Veri) ---
    const handleAddProduct = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // 1. Dosyaları arka planda yükle
        const uploadedImg = await uploadToApi(imageFile);
        const uploadedModel = await uploadToApi(modelFile);

        const productData = {
            ...newProduct,
            Price: Number(newProduct.Price),
            ImageUrl: uploadedImg || '', // Sunucudan gelen yol
            ModelUrl: uploadedModel || '/koltuk.glb'
        };

        try {
            await axios.post('https://localhost:7087/api/products/add', productData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Başarıyla eklendi!");
            setShowAddModal(false);
            fetchProducts();
        } catch (err) { alert("Ekleme başarısız."); }
    };

    // --- SİLME ---
    const handleDelete = async (productId) => {
        if (!window.confirm("Silinsin mi?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`https://localhost:7087/api/products/delete/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProducts(prev => prev.filter(p => (p.id || p.Id) !== productId));
        } catch (err) { alert("Silinemedi."); }
    };

    // --- DÜZENLEME (Edit) ---
    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Yeni dosya seçildiyse yükle, seçilmediyse eskisini kullan
        const newImg = await uploadToApi(imageFile);

        const updatedData = {
            Name: editingProduct.name || editingProduct.Name,
            Price: Number(editingProduct.price || editingProduct.Price),
            Description: editingProduct.description || editingProduct.Description,
            Category: editingProduct.category || editingProduct.Category,
            ImageUrl: newImg || editingProduct.imageUrl || editingProduct.ImageUrl,
            ModelUrl: editingProduct.modelUrl || editingProduct.ModelUrl
        };

        try {
            await axios.put(`https://localhost:7087/api/products/update/${editingProduct.id || editingProduct.Id}`, updatedData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setShowEditModal(false);
            fetchProducts();
        } catch (err) { alert("Güncellenemedi."); }
    };

    return (
        <div className="admin-layout">
            {/* SOL MENÜ */}
            <aside className="admin-sidebar">
                <div className="admin-logo">EKTA PANEL</div>
                <ul>
                    <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}><MdDashboard /> Dashboard</li>
                    <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}><GrProductHunt /> Ürün Yönetimi</li>
                </ul>
                <button className="back-to-site" onClick={() => window.location.href = "/"}>Vitrine Dön</button>
            </aside>

            {/* ANA İÇERİK */}
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
                                                src={p.imageUrl?.startsWith('/')
                                                    ? `https://localhost:7087${p.imageUrl}`
                                                    : p.imageUrl}
                                                alt="Ürün"
                                                className="table-img"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }} // Resim bulunamazsa hata vermesin
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
                                <input type="text" placeholder="Ürün Adı" required onChange={e => setNewProduct({ ...newProduct, Name: e.target.value })} />
                                <input type="number" placeholder="Fiyat" required onChange={e => setNewProduct({ ...newProduct, Price: e.target.value })} />
                                <input type="text" placeholder="Kategori" onChange={e => setNewProduct({ ...newProduct, Category: e.target.value })} />
                                <textarea placeholder="Açıklama" onChange={e => setNewProduct({ ...newProduct, Description: e.target.value })} />

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

                {/* DÜZENLEME MODALI (Gerektiğinde Form İçeriği Ekleme Modalına Benzer Yapılır) */}
                {showEditModal && editingProduct && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal">
                            <h2>Ürünü Düzenle</h2>
                            <form className="admin-form" onSubmit={handleUpdateProduct}>
                                <input type="text" value={editingProduct.name || editingProduct.Name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                                <input type="number" value={editingProduct.price || editingProduct.Price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} />
                                <input type="file" onChange={e => setImageFile(e.target.files[0])} />
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