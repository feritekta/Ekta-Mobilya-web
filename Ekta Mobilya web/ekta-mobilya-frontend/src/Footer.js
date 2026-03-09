import React from 'react';

function Footer() {
  return (
    <footer id="footer" className="ekta-footer">
      <div className="footer-content">
        <section className="footer-section">
          <h3>Hakkımızda</h3>
          <p>EKTA Mobilya olarak yıllardır evlerinize estetik ve konfor katıyoruz. Kaliteli malzeme, özgün tasarım ve müşteri memnuniyeti temel prensiplerimizdir.</p>
        </section>

        <section className="footer-section">
          <h3>İletişim</h3>
          <p>19 Mayıs Mah. 19 Mayıs cd. 26/A KEÇİÖREN/Ankara</p>
          <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="map-link">yol tarifi için tıklayınız</a>
          <p>Telefon: 0312 320 00 08</p>
          <p>E-posta: ekta.mobilya@gmail.com</p>
        </section>
      </div>
      <div className="footer-bottom">
        <p>© 2026 EKTA Mobilya. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}

export default Footer;