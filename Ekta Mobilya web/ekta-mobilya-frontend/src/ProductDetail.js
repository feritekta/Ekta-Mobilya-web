import React from 'react';
import { GrFavorite } from "react-icons/gr";
import { TbBadge3D } from "react-icons/tb";

const API_BASE_URL = "https://localhost:7087";

function ProductDetail({ product, onClose, onFavorite }) {
  // 1. Resim Yolunu Belirle
  const fullImageUrl = product.imageUrl?.startsWith('/uploads')
    ? `${API_BASE_URL}${product.imageUrl}`
    : (product.imageUrl || "https://via.placeholder.com/600x400?text=Resim+Yok");

  // 2. MODEL YOLU (Senin seçtiğin dosyanın gelmesini sağlayan kısım)
  // Eğer veritabanında modelUrl doluysa onu kullanır, değilse hiçbir şey yüklemez.
  const fullModelUrl = product.modelUrl 
    ? (product.modelUrl.startsWith('http') ? product.modelUrl : `${API_BASE_URL}${product.modelUrl}`)
    : null;

  console.log("Seçilen Ürünün Model Yolu:", fullModelUrl);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="detail-container">
          {/* SOL TARAF: Ürün Fotoğrafı */}
          <div className="detail-visual-section">
            <div className="detail-image-wrapper">
              <img src={fullImageUrl} alt={product.name} className="detail-img-fit" />
            </div>
          </div>

          {/* SAĞ TARAF: Bilgiler ve Senin Seçtiğin Model */}
          <div className="detail-info-section">
            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-price">{product.price} TL</p>
            <hr className="detail-divider" />

            <div className="detail-description">
              <h3>Ürün Bilgisi</h3>
              <p>{product.description || "EKTA özel tasarım."}</p>
            </div>

            <div className="detail-actions-3d">
              <div className="model-preview-box">
                {fullModelUrl ? (
                  <model-viewer
                    key={fullModelUrl} // Dosya değiştiğinde model-viewer'ı yenilemeye zorlar
                    src={fullModelUrl}
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    camera-controls
                    shadow-intensity="1"
                    auto-rotate
                    style={{ width: '100%', height: '100%' }}
                  >
                    <button slot="ar-button" className="ar-button-detail">🏠 ODADA GÖR</button>
                  </model-viewer>
                ) : (
                  <div className="no-model-info">
                     <p>Bu ürünün 3D modeli henüz eklenmemiş.</p>
                  </div>
                )}
              </div>

              <div className="action-buttons-row">
                <button className="view-3d-btn">
                  <TbBadge3D size={26} /> 3D MODELİ İNCELE
                </button>
                <div className={`fav-btn-circle ${product.isFavorite ? 'active' : ''}`} onClick={onFavorite}>
                  <GrFavorite size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;