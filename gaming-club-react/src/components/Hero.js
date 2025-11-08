/**/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Hero.css';

const Hero = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleBookingClick = () => navigate('/clubs');
  const handleCafeClick = () => navigate('/cafe');
  const handleClubsClick = () => navigate('/clubs');
  const handleMyBookingClick = () => navigate('/my-bookings');
  const handleLoginClick = () => navigate('/login');

  const handleLogout = () => {
    logout();
    navigate('/');

    
  };

  return (
    <section id="hero" className="hero-section">
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Keyboard background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>
      <div className="auth-corner">
  {user ? (
    <button onClick={handleLogout} className="hero-auth-btn">
      Выйти ({user.email})
    </button>
  ) : (
    <button onClick={handleLoginClick} className="hero-auth-btn">
      Войти
    </button>
  )}
</div>

      <div className="container hero-content-wrapper">
        <div className="hero-left">
          <h1 className="hero-title">Сеть компьютерных клубов г. Саратов</h1>
          <p className="hero-subtitle">ИГРОВЫЕ ПК, PS-4, PS-5К</p>
          <div className="hero-buttons">
  <button onClick={handleBookingClick} className="hero-btn">Забронировать</button>
  {/* <button onClick={handleCafeClick} className="hero-btn hero-btn-secondary">Перейти в кафе</button> */}
  {user && (
    <button onClick={handleMyBookingClick} className="hero-btn hero-btn-secondary">
      Мои брони
    </button>
  )}
</div>
        </div>
        <div className="hero-right">
          <div className="info-card">
            <h3 className="info-card-title">3 клуба в городе</h3>
            <p className="info-card-address">
              ул. Б. Казачья, 67<br />
              ул. Рабочая, 53<br />
              ул. Шелковичная, 29/35
            </p>
            {/* <button onClick={handleClubsClick} className="hero-btn">Выбрать клуб</button> */}
           
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;