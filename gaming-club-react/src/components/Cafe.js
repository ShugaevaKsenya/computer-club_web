
// 
import React, { useState, useEffect } from 'react';
import { useCart, CartProvider} from '../context/CartContext';
import '../styles/Cafe.css';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/Api';

const Cafe = () => {
  const navigate = useNavigate();
  const { clubId } = useParams();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const bookingStarted = localStorage.getItem('bookingStarted') === 'true';
  const { 
      addToCart,
      cartItems, 
      updateCartItemQuantity, 
      clearCart, 
      getTotalPrice, 
      getTotalItems,
      getCartSummary  
    } = useCart();

    
  useEffect(() => {
    const lastClubId = localStorage.getItem('cartClubId');
    if (lastClubId && lastClubId !== clubId) {
      clearCart(); // очищаем корзину при смене клуба
    }
    localStorage.setItem('cartClubId', clubId);
  }, [clubId]);


  useEffect(() => {
    const loadFoods = async () => {
      try {
        setLoading(true);
        const foodsData = await apiService.getFoodsByClub(clubId);
        const initializedMenu = foodsData.map(food => ({
          ...food,
          quantity: 0
        }));
        setMenuItems(initializedMenu);
      } catch (error) {
        console.error('Ошибка при загрузке меню кафе:', error);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) {
      loadFoods();
    }
  }, [clubId]);
 
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
  const handleContinueBooking = () => {
    const clubIdForBooking = localStorage.getItem('cartClubId') || clubId;
    localStorage.setItem('selectedClubId', clubIdForBooking);
    localStorage.setItem('bookingStarted', 'true');
    navigate('/booking');
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
          <h2 className="cafe-title">Кафе {clubId}</h2>
        
        </div>

        <div className="cart-summary">
          <p>Товаров в корзине: <strong>{getTotalItems()}</strong></p>
        </div>

        <div className="menu-list">
          {menuItems.map(item => (
          <div key={item.id} className="menu-item">
            <div className='items-in-row'>
            {/* Левая часть - изображение */}
            <div className="item-image">
              <img src={item.image} alt={item.name} />
            </div>
            
            {/* Центральная часть - ВСЕ В СТОЛБИК */}
            <div className="item-center">
              <span className="item-name">{item.name} {item.club_id}</span>
              
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
            </div>
            <div className='price-column'>
              {/* Цена в правом верхнем углу */}
              <span className="item-price">
                Цена:<br />
                {item.price} ₽
              </span>
              
              {/* Общая стоимость */}
              {item.quantity > 0 && (
                <span className="item-total">
                  Общая цена:<br />
                  {item.price * item.quantity}₽
                </span>
              )}
    </div>
  </div>
  </div>
))}
        </div>
        <div className="cafe-actions">
          {hasItemsInCart && (
            <button className="cafe-btn cafe-btn-secondary" onClick={addAllToCart}>
              Добавить всё в корзину
            </button>
          )}

          <button
            className="cafe-btn cafe-btn-secondary"
            onClick={() => {
              clearCart();
              localStorage.removeItem('bookingStarted');
              localStorage.removeItem('selectedClubId');
              navigate('/clubs');
            }}
          >
            Вернуться к клубам
          </button>
            {/* <button
              className="cafe-btn cafe-btn-primary"
              onClick={() => navigate('/booking')}
            >
              Продолжить бронирование
            </button> */}
            <button
              className="cafe-btn cafe-btn-primary"
              onClick={handleContinueBooking}
            >
              Продолжить бронирование
            </button>

          
        </div>
      </div>
    </section>
  );
};

export default Cafe;