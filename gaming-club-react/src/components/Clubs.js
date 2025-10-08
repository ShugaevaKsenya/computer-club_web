import React from 'react';
import '../styles/Clubs.css';

const Clubs = () => {
  const clubsData = [
    {
      title: "Рахова 53",
      address: "ул. Рахова, 53",
      info: ["18 ПК с Game Room и VIP-зоной", "Кресла DXRacer"]
    },
    {
      title: "Астраханская 15/8",
      address: "ул. Астраханская, 15/8",
      info: ["18 ПК с Game Room и VIP-зоной", "Кресла DXRacer", "Зоны PS5 и PS4 PRO"]
    },
    {
      title: "Московская 11",
      address: "ул. Московская, 11",
      info: ["18 ПК с Game Room и VIP-зоной", "Кресла DXRacer"]
    }
  ];

  const handleBookingClick = (address) => {
    // Сохраняем адрес в localStorage (более надежно, чем sessionStorage)
    localStorage.setItem('selectedClubAddress', address);
    
    // Прокрутка к секции бронирования
    const bookingSection = document.getElementById('combined-booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
      
      // Добавляем небольшой таймаут чтобы убедиться что скролл завершился
      setTimeout(() => {
        // Триггерим событие чтобы уведомить компонент бронирования
        window.dispatchEvent(new Event('clubAddressSelected'));
      }, 500);
    }
  };

  return (
    <section id="clubs" className="clubs-section">
      <div className="container">
        <div className="section-title-container">
          <h2 className="section-title">Наши клубы</h2>
        </div>
        <div className="clubs-grid">
          {clubsData.map((club, index) => (
            <article key={index} className="club-card">
              <h3>{club.title}</h3>
              {club.info.map((item, itemIndex) => (
                <p key={itemIndex}>{item}</p>
              ))}
              <div className="club-card-buttons">
                <button 
                  onClick={() => handleBookingClick(club.address)} 
                  className="btn"
                >
                  Перейти к брони
                </button>
                <a href="#cafe" className="btn">Перейти в кафе</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clubs;