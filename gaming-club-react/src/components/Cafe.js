import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/Cafe.css';

const Cafe = () => {
  const { addToCart, getTotalItems } = useCart();
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Попкорн классический', price: 200, quantity: 0 },
    { id: 2, name: 'Попкорн карамельный', price: 250, quantity: 0 },
    { id: 3, name: 'Чипсы', price: 150, quantity: 0 },
    { id: 4, name: 'Кола', price: 180, quantity: 0 },
    { id: 5, name: 'Кофе', price: 220, quantity: 0 },
    { id: 6, name: 'Шоколад', price: 120, quantity: 0 }
  ]);

  const updateQuantity = (id, change) => {
    setMenuItems(prev => {
      return prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      );
    });
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
    setMenuItems(prev =>
      prev.map(item => ({ ...item, quantity: 0 }))
    );
  };

  const hasItemsInCart = menuItems.some(item => item.quantity > 0);

  return (
    <section id="cafe" className="cafe-section">
      <div className="container">
        <h2 className="cafe-title">Кафе</h2>
        
        <div className="cart-summary">
          <p>Товаров в корзине: {getTotalItems()}</p>
        </div>

        <div className="menu-list">
          {menuItems.map(item => (
            <div key={item.id} className="menu-item">
              <span className="item-name">{item.name}</span>
              <div className="item-divider"></div>
              <span className="item-price">{item.price} ₽</span>
              
              <div className="quantity-stepper">
                <button 
                  className="stepper-btn"
                  onClick={() => updateQuantity(item.id, -1)}
                  disabled={item.quantity === 0}
                >-</button>
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
            <button 
              className="btn secondary"
              onClick={addAllToCart}
            >
              Добавить все в корзину
            </button>
          )}
          <a href="#pricing" className="btn">Назад</a>
          <a href="#combined-booking" className="btn">
            Перейти к брони {getTotalItems() > 0 && `(${getTotalItems()})`}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Cafe;