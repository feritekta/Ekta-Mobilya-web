import React from 'react';
import { GrFavorite } from "react-icons/gr";
import { TbBadge3D } from "react-icons/tb";

const API_BASE_URL = "https://localhost:7087";

function ProductDetail({ product, onClose, onFavorite }) {
  if (!product) return null;

  const fullImageUrl = product.imageUrl?.startsWith('/uploads')
    ? `${API_BASE_URL}${product.imageUrl}`
    : (product.imageUrl || "https://via.placeholder.com/600x400?text=Resim+Yok");

  const fullModelUrl = product.modelUrl 
    ? (product.modelUrl.startsWith('http') ? product.modelUrl : `${API_BASE_URL}${product.modelUrl}`)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="detail-container">
          <div className="detail-visual-section">
            <div className="detail-image-wrapper">
              <img src={fullImageUrl} alt={product.name || product.Name} className="detail-img-fit" />
            </div>
          </div>

          <div className="detail-info-section">
            <h1 className="detail-title">{product.name || product.Name}</h1>
            <p className="detail-price">{product.price || product.Price} TL</p>
            <hr className="detail-divider" />

            <div className="detail-description">
              <h3>Ürün Bilgisi</h3>
              <p>{product.description || product.Description || "EKTA özel tasarım ürünü."}</p>
            </div>

            <div className="detail-actions-3d">
              <div className="model-preview-box">
                {fullModelUrl ? (
                  <model-viewer
                    key={fullModelUrl}
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