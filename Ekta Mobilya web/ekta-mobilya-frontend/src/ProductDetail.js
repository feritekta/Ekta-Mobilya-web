import React from 'react';
import { GrFavorite } from "react-icons/gr";

// YORUM: Bu bileşen, ana sayfada veya hesabımdan bir ürüne tıklandığında açılan büyük penceredir.
function ProductDetail({ product, onClose, onFavorite }) {
  return (
    <div className="modal-overlay" onClick={onClose}> {/* Karartılmış arka plan */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Beyaz içerik alanı */}

        {/* Kapatma Butonu (X) */}
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="detail-container">

          {/* SOL TARAF: Büyük ve Net Ürün Görseli */}
          <div className="detail-image">
            <img
              src="https://via.placeholder.com/800x600?text=EKTA+Mobilya+Büyük+Görsel"
              alt={product.name}
            />
          </div>

          {/* SAĞ TARAF: Ürün Bilgileri ve Eylemler */}
          <div className="detail-info">
            <h1 style={{ color: '#5d4037', marginTop: 0 }}>{product.name}</h1>
            <p className="price-tag">{product.price} TL</p>
            <hr style={{ borderColor: '#eee', margin: '20px 0' }} />

            <p className="description" style={{ lineHeight: '1.8', color: '#555' }}>
              {product.description || "Bu ürün için detaylı açıklama bulunmamaktadır."}
              {/* GELECEKTE: Buraya malzeme, boyut gibi yeni detaylar eklenecek. */}
            </p>

            <div className="detail-actions" style={{ marginTop: 'auto' }}> {/* Eylemleri en alta sabitlemek için auto-margin */}
              <button className="add-to-cart-btn">Hemen Sipariş Ver</button>

              {/* Detay sayfasındaki favori butonu */}
              <div
                className={`favorite-icon-wrapper ${product.isFavorite ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(); // App.js'deki fonksiyonu tetikler
                }}
                
                style={{
                  cursor: 'pointer',
                  // Arka planı da duruma göre anlık değiştirelim
                  backgroundColor: product.isFavorite ? '#5d4037' : '#f4f1ee'
                }}
              >
                <GrFavorite
                  className="favorite-icon"
                  style={{
                    // İÇ DOLGU: Favoriyse beyaz (kahve zemin üstünde), değilse şeffaf
                    fill: product.isFavorite ? '#fff' : 'none',
                    color: product.isFavorite ? '#fff' : '#5d4037',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;