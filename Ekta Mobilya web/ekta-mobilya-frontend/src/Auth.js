import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { GrFavorite } from "react-icons/gr";

function Auth({ onClose, onLoginSuccess, user, onLogout }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [myFavorites, setMyFavorites] = useState([]);

    // Favorileri Çekme
    useEffect(() => {
        if (user && user.id) {
            axios.get(`https://localhost:7087/api/products/my-favorites/${user.id}`)
                .then(res => {
                    setMyFavorites(res.data);
                })
                .catch(err => console.log("Hata:", err));
        }
    }, [user]);

    // Favoriden Çıkarma Fonksiyonu
    const handleRemoveFavorite = async (productId) => {
        try {
            await axios.delete(`https://localhost:7087/api/products/favorite-remove?userId=${user.id}&productId=${productId}`);
            // State'i güncelle: Silinen ürünü listeden hemen çıkart
            setMyFavorites(prev => prev.filter(item => item.id !== productId));
        } catch (err) {
            console.error("Favori silinirken hata oluştu:", err);
        }
    };

    if (user) {
        return (
            <div className="auth-container">
                <button onClick={onClose} className="back-btn">← Vitrine Dön</button>
                <div className="auth-card profile-card" style={{ width: '80%', maxWidth: '1200px' }}>
                    <h2 style={{ color: '#5d4037' }}>Hoş geldin, {user.username}</h2>
                    <p style={{ color: '#666' }}>{user.email}</p>

                    <div className="profile-sections" style={{ marginTop: '30px' }}>
                        <div className="profile-section-item" style={{ justifyContent: 'center', marginBottom: '20px' }}>
                            <GrFavorite /> <span>Favorilerim</span>
                        </div>

                        {myFavorites.length > 0 ? (
                            <div className="product-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '20px',
                                padding: '10px 0'
                            }}>
                                {myFavorites.map((fav) => (
                                    <div key={fav.id} className="product-card is-fav">
                                        <img
                                            src="https://via.placeholder.com/300x200?text=EKTA+Mobilya"
                                            alt={fav.name}
                                            style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                        />
                                        <div style={{ padding: '15px' }}>
                                            <h3 style={{ margin: '0 0 5px 0', color: '#5d4037', fontSize: '16px' }}>{fav.name}</h3>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 'bold', color: '#5d4037', fontSize: '16px' }}>
                                                    {fav.price} TL
                                                </span>

                                                {/* Favoriden Çıkartma Butonu (Kalp) */}
                                                <div 
                                                    className="favorite-icon-wrapper active" 
                                                    onClick={() => handleRemoveFavorite(fav.id)}
                                                >
                                                    <GrFavorite className="favorite-icon" style={{ fill: '#5d4037', color: '#5d4037' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '14px', color: '#999', textAlign: 'center' }}>Henüz favori ürününüz bulunmuyor.</p>
                        )}
                    </div>

                    <button onClick={() => { onLogout(); onClose(); }} className="logout-btn-profile" style={{ maxWidth: '200px', margin: '30px auto' }}>
                        Güvenli Çıkış Yap
                    </button>
                </div>
            </div>
        );
    }

    // Giriş / Kayıt Formu
    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? 'login' : 'register';
        try {
            const response = await axios.post(`https://localhost:7087/api/auth/${endpoint}`, {
                Username: formData.username,
                Email: formData.email,
                PasswordHash: formData.password
            });

            if (isLogin) {
                const userData = {
                    username: response.data.username || "Değerli Müşterimiz",
                    email: formData.email,
                    id: response.data.id || response.data.Id
                };
                onLoginSuccess(userData);
                alert("Giriş Başarılı!");
            } else {
                alert("Kayıt başarılı!");
                setIsLogin(true);
            }
        } catch (error) {
            alert("Hata: " + (error.response?.data || "İşlem başarısız"));
        }
    };

    return (
        <div className="auth-container">
            <button onClick={onClose} className="back-btn">← Vitrine Dön</button>
            <div className="auth-card">
                <h2 style={{ color: '#5d4037' }}>{isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && <input type="text" placeholder="Kullanıcı Adı" required onChange={(e) => setFormData({ ...formData, username: e.target.value })} />}
                    <input type="email" placeholder="E-posta" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <input type="password" placeholder="Şifre" required onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    <button type="submit" className="auth-button">{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</button>
                </form>
                <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' }}>
                    {isLogin ? 'Hesabınız yok mu? Kayıt Olun' : 'Zaten üye misiniz? Giriş Yapın'}
                </p>
            </div>
        </div>
    );
}

export default Auth;