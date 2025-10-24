
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Clubs.css';

const Clubs = () => {
  const navigate = useNavigate();

  const clubsData = [
    { id: 1, title: "Рахова 53", address: "ул. Рахова, 53", info: ["18 ПК с Game Room и VIP-зоной", "Кресла DXRacer", "Зоны PS5 и PS4 PRO"] },
    { id: 2, title: "Астраханская 15/8", address: "ул. Астраханская, 15/8", info: ["18 ПК с Game Room и VIP-зоной", "Кресла DXRacer", "Зоны PS5 и PS4 PRO"] },
    { id: 3, title: "Московская 11", address: "ул. Московская, 11", info: ["18 ПК с Game Room и VIP-зоной", "Кресла DXRacer", "Зоны PS5 и PS4 PRO"] }
  ];

  const handleBookingClick = (clubId) => {
    localStorage.setItem('selectedClubId', clubId);
    navigate('/booking');
  };

  const handleCafeClick = () => {
    navigate('/cafe');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <section id="clubs" className="clubs-section">
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>

      <div className="container">
        <div className="section-title-container">
          <h2 className="section-title">Наши клубы</h2>
        </div>

        <div className="clubs-grid">
          {clubsData.map((club) => (
            <article key={club.id} className="club-card">
              <div className="club-header">
                <h3>{club.title}</h3>
                <span className="club-address">{club.address}</span>
              </div>
              <ul className="club-info-list">
                {club.info.map((item, i) => (
                  <li key={i} className="club-info-item">✓ {item}</li>
                ))}
              </ul>
              <div className="club-card-buttons">
                <button onClick={() => handleBookingClick(club.id)} className="btn primary">
                  Перейти к брони
                </button>
                <button onClick={handleCafeClick} className="btn secondary">
                  Перейти в кафе
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="clubs-actions">
          <button onClick={handleBackToHome} className="btn secondary">
            ← Вернуться на главную
          </button>
        </div>
      </div>
    </section>
  );
};

export default Clubs;