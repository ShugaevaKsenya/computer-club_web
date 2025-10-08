import React from 'react';
import '../styles/Layout.css';

const Layout = () => {
  return (
    <section id="layout" className="layout-section">
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>
      <div className="layout-content-box">
        <div className="decorative-vectors">
          <img src="/images/30_51.svg" alt="decorative shape" className="decorative-shape shape-1" />
          <img src="/images/30_49.svg" alt="decorative shape" className="decorative-shape shape-2" />
          <img src="/images/30_47.svg" alt="decorative shape" className="decorative-shape shape-3" />
          <img src="/images/30_45.svg" alt="decorative shape" className="decorative-shape shape-4" />
        </div>
        
        {/* PC Setups */}
        {[1, 2, 3, 4, 5, 6].map((num, index) => (
          <div key={`pc-${num}`} className={`pc-setup setup-${num}`}>
            <img src="/images/6356f02b474a41d638cf709af15fe1f7c6dd92c0.png" alt={`PC setup ${num}`} />
            <span className="layout-number">{num}</span>
          </div>
        ))}
        
        {/* Console Setups */}
        {[8, 9, 12, 13].map((num) => (
          <div key={`console-${num}`} className={`console-setup setup-${num}`}>
            <img src="/images/1b9fb18a794f8543e1b7ff770153e91c8879c831.png" alt={`Console setup ${num}`} />
            <span className="layout-number">{num}</span>
          </div>
        ))}
        
        {/* Headphones */}
        {[10, 11, 14].map((num) => (
          <div key={`headphones-${num}`} className={`headphones-setup setup-${num}`}>
            <img src="/images/2fc05fccb4c07d9e1bb638c4487609fd22b2f1ec.png" alt={`Headphones ${num}`} />
            <span className="layout-number">{num}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Layout;