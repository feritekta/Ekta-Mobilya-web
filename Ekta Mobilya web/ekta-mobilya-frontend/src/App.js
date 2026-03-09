import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Auth from './Auth';
import ProductDetail from './ProductDetail';
import Footer from './Footer';
import { GrFavorite } from "react-icons/gr";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";

function App() {
  const [products, setProducts] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Slider Ayarları
  const sliderImages = ["/boho.jpg", "/yatakodası.png", "/mutfak.png"];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!showAuth) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [showAuth, sliderImages.length]);

  useEffect(() => {
    const userId = user ? user.id : '';
    axios.get(`https://localhost:7087/api/products/${userId}`)
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, [showAuth, user]);

  const handleLogout = () => {
    setUser(null);
    setShowAuth(false);
    setIsMenuOpen(false);
    alert("Başarıyla çıkış yapıldı.");
  };

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
        await axios.delete(`https://localhost:7087/api/products/favorite-remove?userId=${user.id}&productId=${productId}`);
        setProducts(products.map(p => p.id === productId ? { ...p, isFavorite: false } : p));
      } else {
        await axios.post('https://localhost:7087/api/products/favorite', { UserId: user.id, ProductId: productId });
        setProducts(products.map(p => p.id === productId ? { ...p, isFavorite: true } : p));
      }
    } catch (err) { console.error(err); }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="App">
      {/* Navbar Bölümü */}
      <nav className="navbar">
        <div className="nav-left"><div className="logo-text">EKTA MOBİLYA</div></div>
        <div className="nav-center" onClick={() => {setShowAuth(false); setIsMenuOpen(false);}}>
          <img src="ektaMobilyaLogo.png" alt="EKTA Logo" className="main-logo-img" />
        </div>
        <div className="nav-right">
          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li onClick={() => scrollToSection('product-area')}>Ürünler</li>
            <li onClick={() => scrollToSection('footer')}>Hakkımızda</li>
            <li onClick={() => scrollToSection('footer')}>İletişim</li>
            <li onClick={() => {setShowAuth(true); setIsMenuOpen(false);}} className="account-btn">
              {user ? `Hesabım (${user.username})` : 'Hesabım'}
            </li>
          </ul>
          <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <IoClose /> : <GiHamburgerMenu />}
          </div>
        </div>
      </nav>

      {/* Mobil Karartma Overlay */}
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      {showAuth ? (
        <Auth user={user} onClose={() => setShowAuth(false)} onLoginSuccess={setUser} onLogout={handleLogout} />
      ) : (
        <>
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

          <div id="product-area" className="product-grid">
            {products.map(p => (
              <div key={p.id} className="product-card" onClick={() => setSelectedProduct(p)}>
                <img src="https://via.placeholder.com/300x200?text=EKTA+Mobilya" alt={p.name} />
                <div className="card-footer">
                  <span>{p.price} TL</span>
                  <div className={`favorite-icon-wrapper ${p.isFavorite ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleFavorite(p.id); }}>
                    <GrFavorite />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3D Bölümü: Görselde Gördüğün Tasarım */}
          <div className="three-d-section">
            <div className="three-d-text">
              <h2>3D Tasarımlarımızı Keşfedin</h2>
              <p>Ürünlerimizi her açıdan inceleyebilir, detaylara yakından bakabilirsiniz.</p>
              {/* KAYBOLAN BUTON BURADA */}
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

          <Footer />
        </>
      )}

      {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} onFavorite={() => handleFavorite(selectedProduct.id)} />}
    </div>
  );
}
export default App;