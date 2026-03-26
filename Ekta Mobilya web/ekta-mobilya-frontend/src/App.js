// ==========================================
// 1. KÜTÜPHANE VE BİLEŞEN İMPORTLARI
// ==========================================
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Auth from './Auth';
import ProductDetail from './ProductDetail';
import Footer from './Footer';
import { GrFavorite } from "react-icons/gr";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './AdminPanel';

function App() {
  // ==========================================
  // 2. STATE (DURUM) TANIMLAMALARI
  // ==========================================
  const [products, setProducts] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- API VE SUNUCU AYARLARI ---
  const API_BASE_URL = "https://localhost:7087";

  // --- SLIDER (AFİŞ) AYARLARI ---
  const sliderImages = ["/boho.jpg", "/yatakodası.png", "/mutfak.png"];
  const [currentSlide, setCurrentSlide] = useState(0);

  // ==========================================
  // 3. EFFECT (OTOMATİK ÇALIŞAN) FONKSİYONLAR
  // ==========================================

  // --- SLIDER OTOMASYONU: 5 Saniyede bir resmi değiştirir ---
  useEffect(() => {
    if (!showAuth) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [showAuth, sliderImages.length]);

  // --- VERİ ÇEKME: Backend'den ürün listesini getirir ---
  useEffect(() => {
    const userId = user ? user.id : '';
    axios.get(`${API_BASE_URL}/api/products/${userId}`)
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, [showAuth, user]);

  // ==========================================
  // 4. KULLANICI ETKİLEŞİM FONKSİYONLARI
  // ==========================================

  // --- ÇIKIŞ İŞLEMİ ---
  const handleLogout = () => {
    setUser(null);
    setShowAuth(false);
    setIsMenuOpen(false);
    alert("Başarıyla çıkış yapıldı.");
  };

  // --- FAVORİ EKLEME/SİLME İŞLEMİ ---
  const handleFavorite = async (productId) => {
    if (!user) {
      alert("Önce giriş yapmalısınız!");
      setSelectedProduct(null);
      setShowAuth(true);
      return;
    }
    try {
      const isAlreadyFav = products.find(p => p.id === productId)?.isFavorite;
      if (isAlreadyFav) {
        await axios.delete(`${API_BASE_URL}/api/products/favorite-remove?userId=${user.id}&productId=${productId}`);
        setProducts(products.map(p => p.id === productId ? { ...p, isFavorite: false } : p));
      } else {
        await axios.post(`${API_BASE_URL}/api/products/favorite`, { UserId: user.id, ProductId: productId });
        setProducts(products.map(p => p.id === productId ? { ...p, isFavorite: true } : p));
      }
    } catch (err) { console.error(err); }
  };

  // --- SAYFA İÇİ KAYDIRMA (Scroll) ---
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <Router>
      <div className="App">

        {/* ==========================================
          5. NAVBAR (NAVİGASYON ÇUBUĞU)
          ========================================== */}
        <nav className="navbar">
          <div className="nav-left"><div className="logo-text">EKTA MOBİLYA</div></div>
          <div className="nav-center" onClick={() => { setShowAuth(false); setIsMenuOpen(false); }}>
            <img src="ektaMobilyaLogo.png" alt="EKTA Logo" className="main-logo-img" />
          </div>
          <div className="nav-right">
            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              <li onClick={() => scrollToSection('product-area')}>Ürünler</li>
              <li onClick={() => scrollToSection('footer')}>Hakkımızda</li>
              <li onClick={() => scrollToSection('footer')}>İletişim</li>
              <li onClick={() => { setShowAuth(true); setIsMenuOpen(false); }} className="account-btn">
                {user ? `Hesabım (${user.username})` : 'Hesabım'}
              </li>
            </ul>
            <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <IoClose /> : <GiHamburgerMenu />}
            </div>
          </div>
        </nav>

        {/* MOBİL MENÜ ARKA PLANI */}
        {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

        <Routes>
          {/* ==========================================
            6. SAYFA ROTALARI (ROUTES)
            ========================================== */}
          <Route path="/" element={
            showAuth ? (
              /* --- GİRİŞ / KAYIT EKRANI --- */
              <Auth user={user} onClose={() => setShowAuth(false)} onLoginSuccess={setUser} onLogout={handleLogout} />
            ) : (
              <>
                {/* --- SLIDER (GÖRSEL GEÇİŞ) ALANI --- */}
                <div className="slider-container">
                  {sliderImages.map((img, index) => (
                    <div key={index} className={`slide ${index === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url(${img})` }}>
                      <div className="slider-overlay">
                        <h2 className="slider-text">Şıklığın ve Konforun Buluşma Noktası</h2>
                        <button className="slider-btn" onClick={() => scrollToSection('product-area')}>Hemen İncele</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- ÜRÜN LİSTELEME (GRID) ALANI --- */}
                <div id="product-area" className="product-grid">
                  {products.map(p => (
                    <div key={p.id} className="product-card" onClick={() => setSelectedProduct(p)}>

                      {/* 1. RESİM KAPSAYICI (Taşmayı önlemek için eklendi) */}
                      <div className="product-card-image">
                        <img
                          src={p.imageUrl?.startsWith('/uploads')
                            ? `${API_BASE_URL}${p.imageUrl}`
                            : (p.imageUrl)}
                          alt={p.name}
                        />
                      </div>

                      {/* 2. BİLGİ ALANI (Resimle arasına mesafe koyar) */}
                      <div className="card-footer">
                        <div className="card-info">
                          {/* İsim alanı 2 satırla sınırlı kalacak */}
                          <span className="product-name">{p.name || p.Name}</span>
                          <span className="product-price">{p.price || p.Price} TL</span>
                        </div>

                        <div className={`favorite-icon-wrapper ${p.isFavorite ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleFavorite(p.id); }}>
                          <GrFavorite />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* --- 3D DENEYİM VE MODEL-VIEWER ALANI --- */}
                <div className="three-d-section">
                  <div className="three-d-text">
                    <h2>3D Tasarımlarımızı Keşfedin</h2>
                    <p>Ürünlerimizi her açıdan inceleyebilir, detaylara yakından bakabilirsiniz.</p>
                    <button className="three-d-experience-btn">HEMEN DENEYİMLE</button>
                  </div>
                  <div className="model-wrapper">
                    <model-viewer
                      src="/koltuk.glb"
                      alt="3D Model"
                      auto-rotate
                      camera-controls
                      ar
                      ar-modes="webxr scene-viewer quick-look"
                      style={{ width: '100%', height: '500px' }}
                    >
                      <button slot="ar-button" className="ar-button">🏠 ODAMDA CANLI GÖR</button>
                    </model-viewer>
                  </div>
                </div>

                {/* --- ALT BİLGİ (FOOTER) --- */}
                <Footer />
              </>
            )
          } />

          {/* --- ADMİN PANELİ ROTASI --- */}
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        {/* ==========================================
          7. MODAL VE AYRINTI PENCERELERİ
          ========================================== */}
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onFavorite={() => handleFavorite(selectedProduct.id)}
          />
        )}
      </div>
    </Router>
  );
}
export default App;