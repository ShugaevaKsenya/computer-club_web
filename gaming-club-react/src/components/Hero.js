import React from 'react';
import '../styles/Hero.css';

const Hero = () => {
  const handleBookingClick = () => {
    // Переход на отдельную страницу бронирования
    window.location.href = '/booking';
  };

  const handleCafeClick = () => {
    // Прокрутка к секции кафе на главной странице
    const cafeSection = document.getElementById('cafe');
    if (cafeSection) {
      cafeSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClubsClick = () => {
    // Прокрутка к секции клубов на главной странице
    const clubsSection = document.getElementById('clubs');
    if (clubsSection) {
      clubsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="hero-section">
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Keyboard background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>
      <div className="container hero-content-wrapper">
        <div className="hero-left">
          <h1 className="hero-title">Сеть компьютерных клубов г. Саратов</h1>
          <p className="hero-subtitle">ИГРОВЫЕ ПК, PS-4, PS-5К</p>
          <div className="hero-buttons">
            <button onClick={handleBookingClick} className="btn">Забронировать</button>
            <button onClick={handleCafeClick} className="btn">Перейти в кафе</button>
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
            <button onClick={handleClubsClick} className="btn">Выбрать клуб</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;