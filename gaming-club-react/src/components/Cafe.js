
// export default Cafe;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Cafe.css';

const Cafe = () => {
  const navigate = useNavigate();
  const { addToCart, getTotalItems, foods, loading } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const bookingStarted = localStorage.getItem('bookingStarted') === 'true';
  
  useEffect(() => {
    if (foods && foods.length > 0) {
      const initializedMenu = foods.map(food => ({
        ...food,
        quantity: 0
      }));
      setMenuItems(initializedMenu);
    }
  }, [foods]);

  const updateQuantity = (id, change) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      )
    );
  };

  const addItemToCart = (item) => {
    if (item.quantity > 0) {
      addToCart(item);
      setMenuItems(prev =>
        prev.map(menuItem =>
          menuItem.id === item.id
            ? { ...menuItem, quantity: 0 }
            : menuItem
        )
      );
    }
  };

  const addAllToCart = () => {
    menuItems.forEach(item => {
      if (item.quantity > 0) {
        addToCart(item);
      }
    });
    setMenuItems(prev => prev.map(item => ({ ...item, quantity: 0 })));
  };

  const handleBackToBooking = () => navigate('/booking');
  const handleBackToClubs = () => navigate('/clubs');

  const hasItemsInCart = menuItems.some(item => item.quantity > 0);

  if (loading) {
    return (
      <section className="cafe-section">
        <div className="background-container">
          <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
          <div className="bg-overlay"></div>
        </div>
        <div className="container">
          <div className="section-title-container">
            <h2 className="cafe-title">Загрузка меню...</h2>
            <button className="cafe-btn cafe-btn-secondary" onClick={() => navigate(-1)}>← Назад</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cafe-section">
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>

      <div className="container">
        <div className="section-title-container">
          <h2 className="cafe-title">Кафе</h2>
          <button className="cafe-btn cafe-btn-secondary" onClick={() => navigate(-1)}>← Назад</button>
        </div>

        <div className="cart-summary">
          <p>Товаров в корзине: <strong>{getTotalItems()}</strong></p>
        </div>

        <div className="menu-list">
          {menuItems.map(item => (
            <div key={item.id} className="menu-item">
              <div className="item-header">
                <span className="item-name">{item.name}</span>
                <span className="item-price">{item.price} ₽</span>
              </div>
              
              <div className="quantity-stepper">
                <button 
                  className="stepper-btn"
                  onClick={() => updateQuantity(item.id, -1)}
                  disabled={item.quantity === 0}
                >−</button>
                <span className="quantity">{item.quantity}</span>
                <button 
                  className="stepper-btn"
                  onClick={() => updateQuantity(item.id, 1)}
                >+</button>
              </div>
              
              <button
                className="add-to-cart-btn"
                onClick={() => addItemToCart(item)}
                disabled={item.quantity === 0}
              >
                Добавить
              </button>

              {item.quantity > 0 && (
                <span className="item-total">
                  {item.price * item.quantity} ₽
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="cafe-actions">
          {hasItemsInCart && (
            <button className="cafe-btn cafe-btn-secondary" onClick={addAllToCart}>
              Добавить всё в корзину
            </button>
          )}
          
          <button className="cafe-btn" onClick={handleBackToClubs}>
            К выбору клуба
          </button>
          
          {/* Показываем кнопку "Вернуться к брони" ТОЛЬКО если бронь начата */}
          {bookingStarted && (
            <button className="cafe-btn cafe-btn-primary" onClick={handleBackToBooking}>
              Вернуться к брони {getTotalItems() > 0 && `(${getTotalItems()})`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Cafe;