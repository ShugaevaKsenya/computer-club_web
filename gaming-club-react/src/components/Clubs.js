/**/
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Clubs.css';
import { useCart } from '../context/CartContext';
const Clubs = () => {
  const navigate = useNavigate();
  const { 
      cartItems, 
      updateCartItemQuantity, 
      clearCart, 
      getTotalPrice, 
      getTotalItems,
      getCartSummary,
      addToCart,
     
    } = useCart();

  const clubsData = [
    { id: 1, title: "Рахова 53", address: "ул. Рахова, 53", info: ["18 ПК с Game Room и VIP-зоной", "Кресла DXRacer", "Зоны PS5 и PS4 PRO"] },
    { id: 2, title: "Астраханская 15/8", address: "ул. Астраханская, 15/8", info: ["18 ПК с Game Room и VIP-зоной", "Кресла DXRacer", "Зоны PS5 и PS4 PRO"] },
    { id: 3, title: "Московская 11", address: "ул. Московская, 11", info: ["18 ПК с Game Room и VIP-зоной", "Кресла DXRacer", "Зоны PS5 и PS4 PRO"] }
  ];

  // const handleBackToHome = () => {
  //   navigate('/');
  // };
  const handleBackToHome = () => {
    localStorage.removeItem('bookingStarted');
    localStorage.removeItem('selectedClubId');
    localStorage.removeItem('bookingFormData');
    localStorage.removeItem('savedBooking');
    localStorage.removeItem('cartClubId'); // сбрасываем привязку корзины к клубу
    clearCart(); //  очищаем корзину полностью
    navigate('/');
  };
  
  const handleBookingClick = (clubId) => {
    const previousClubId = localStorage.getItem('cartClubId');
  
    if (previousClubId && previousClubId !== clubId.toString()) {
    localStorage.removeItem('bookingStarted');
      localStorage.removeItem('selectedClubId');
      localStorage.removeItem('bookingFormData');
      localStorage.removeItem('savedBooking');
      localStorage.removeItem('cartClubId'); 
      clearCart(); // очищаем корзину, если сменился клуб
    }
  
    localStorage.setItem('selectedClubId', clubId);
    localStorage.setItem('bookingStarted', 'true');
    localStorage.setItem('cartClubId', clubId); // привязываем корзину к клубу
    navigate('/booking');
  };
  
  const handleCafeClick = (clubId) => {
    const previousClubId = localStorage.getItem('cartClubId');
  
    if (previousClubId && previousClubId !== clubId.toString()) {
      localStorage.removeItem('bookingStarted');
      localStorage.removeItem('selectedClubId');
      localStorage.removeItem('bookingFormData');
      localStorage.removeItem('savedBooking');
      localStorage.removeItem('cartClubId'); 
      clearCart(); // очищаем корзину при смене клуба
    }
  
    localStorage.setItem('selectedClubId', clubId);
    localStorage.setItem('cartClubId', clubId);
    navigate(`/cafe/${clubId}`);
  };
  


  return (
    <section id="clubs" className="clubs-section">
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>

      <div className="container">
        <div className="clubs-section-title-container">
          <h2 className="clubs-section-title">Наши клубы</h2>
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
                <button onClick={() => handleBookingClick(club.id)} className="club-btn club-btn-primary">
                  Перейти к брони
                </button>
                
                <button onClick={() => handleCafeClick(club.id)} className="club-btn club-btn-secondary">
                  Перейти в кафе
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="clubs-actions">
          {/* <button onClick={() => handleBackToHome} className="club-btn club-btn-secondary">
            ← Вернуться на главную
          </button> */}
          <button type="button" className="club-btn club-btn-return" onClick={handleBackToHome}>
          ← Вернуться на главную
              </button>
        </div>
      </div>
    </section>
  );
};

export default Clubs;