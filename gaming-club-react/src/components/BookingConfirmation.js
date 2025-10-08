import React from 'react';
import '../styles/BookingConfirmation.css';

const BookingConfirmation = ({ onBack, bookingData }) => {
  // Используем переданные данные или берем из localStorage
  const data = bookingData || JSON.parse(localStorage.getItem('lastBooking')) || {};

  console.log('=== BOOKING DATA DEBUG ===');
  console.log('Full booking data:', data);
  console.log('=== END DEBUG ===');

  const {
    formData = {},
    selectedPlace,
    placeRate,
    cartItems = [],
    totalPrice = 0
  } = data;

  // Деструктурируем formData с значениями по умолчанию
  const {
    place = '',
    dateFrom = '',
    timeFrom = '',
    dateTo = '',
    timeTo = '',
    address = ''
  } = formData;

  // Функция для получения информации о месте
  const getPlaceInfo = (placeNumber) => {
    const placeInfo = {
      1: { type: "Gaming PC", rate: 100 },
      2: { type: "Gaming PC", rate: 90 },
      3: { type: "Gaming PC", rate: 95 },
      4: { type: "Gaming PC", rate: 80 },
      5: { type: "Streaming PC", rate: 150 },
      6: { type: "Competitive PC", rate: 120 },
      8: { type: "PlayStation 5", rate: 70 },
      9: { type: "PlayStation 5 Pro", rate: 90 },
      10: { type: "VR Station", rate: 120 },
      11: { type: "Audio Station", rate: 60 },
      12: { type: "PlayStation 4 Pro", rate: 50 },
      13: { type: "Nintendo Switch", rate: 40 },
      14: { type: "Premium Audio", rate: 100 }
    };
    return placeInfo[placeNumber] || { type: "Стандартное место", rate: 80 };
  };

  const placeInfo = getPlaceInfo(selectedPlace);

  // Используем переданную стоимость или получаем из данных места
  const actualPlaceRate = placeRate || placeInfo.rate;

  console.log('=== RATE CALCULATION DEBUG ===');
  console.log('selectedPlace:', selectedPlace);
  console.log('placeRate from booking data:', placeRate);
  console.log('placeInfo.rate for this place:', placeInfo.rate);
  console.log('actualPlaceRate used:', actualPlaceRate);
  console.log('=== END RATE DEBUG ===');

  // Форматирование даты для отображения
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Завтра';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        weekday: 'short'
      });
    }
  };

  // Расчет количества часов
  const getBookingHours = () => {
    if (!dateFrom || !timeFrom || !dateTo || !timeTo) return 0;
    
    try {
      const startDateTime = new Date(`${dateFrom}T${timeFrom}`);
      const endDateTime = new Date(`${dateTo}T${timeTo}`);
      const hoursDiff = (endDateTime - startDateTime) / (1000 * 60 * 60);
      
      return Math.round(hoursDiff * 10) / 10; // Округляем до 1 decimal
    } catch (error) {
      console.error('Error calculating booking hours:', error);
      return 0;
    }
  };

  // Расчет общей стоимости бронирования
  const calculateBookingCost = () => {
    if (!dateFrom || !timeFrom || !dateTo || !timeTo) return 0;
    
    try {
      const startDateTime = new Date(`${dateFrom}T${timeFrom}`);
      const endDateTime = new Date(`${dateTo}T${timeTo}`);
      const hours = (endDateTime - startDateTime) / (1000 * 60 * 60);
      
      // Используем переданную стоимость или получаем из данных места
      let actualPlaceRate = placeRate;
      
      // Если placeRate не передан, пытаемся получить из данных места
      if (!actualPlaceRate && selectedPlace) {
        const placeInfo = getPlaceInfo(selectedPlace);
        actualPlaceRate = placeInfo.rate;
      }
      
      console.log('=== FINAL RATE CALCULATION ===');
      console.log('Hours:', hours);
      console.log('Place rate:', actualPlaceRate);
      console.log('Cart total:', totalPrice);
      console.log('=== END FINAL CALCULATION ===');

      if (!actualPlaceRate) {
        console.error('ERROR: placeRate is not defined!');
        return totalPrice; // Возвращаем хотя бы стоимость корзины
      }
      
      const placeCost = Math.round(hours * actualPlaceRate);
      return placeCost + totalPrice;
    } catch (error) {
      console.error('Error calculating booking cost:', error);
      return totalPrice;
    }
  };

  const bookingHours = getBookingHours();
  const bookingCost = calculateBookingCost();
  const placeCost = Math.round(bookingHours * actualPlaceRate);

  const handleEditBooking = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/booking';
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handlePayment = () => {
    console.log('Переход к оплате', bookingCost);
    alert(`Переход к оплате ${bookingCost} руб.`);
    localStorage.removeItem('lastBooking');
  };

  // Если данных нет или нет стоимости места, показываем сообщение
  if (!selectedPlace || !actualPlaceRate) {
    return (
      <div className="booking-confirmation">
        <div className="container">
          <div className="no-booking-data">
            <h2>Ошибка данных бронирования</h2>
            <p>Не удалось загрузить информацию о стоимости места. Пожалуйста, вернитесь и выберите место заново.</p>
            <button 
              className="btn primary"
              onClick={handleEditBooking}
            >
              Вернуться к бронированию
            </button>
            <button 
              className="btn secondary"
              onClick={handleBackToHome}
              style={{marginLeft: '10px'}}
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-confirmation">
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>

      <div className="container">
        <div className="confirmation-header">
          <h1>Подтверждение бронирования</h1>
          <p className="confirmation-subtitle">Проверьте данные перед оплатой</p>
        </div>

        <div className="confirmation-content">
          <div className="booking-info">
            <div className="info-section">
              <h2>Информация о брони</h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Место:</span>
                  <span className="info-value">Место №{place} ({placeInfo.type})</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Тариф:</span>
                  <span className="info-value">{actualPlaceRate} ₽/час</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Клуб:</span>
                  <span className="info-value">{address}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Начало:</span>
                  <span className="info-value">
                    {formatDateDisplay(dateFrom)} {timeFrom}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Окончание:</span>
                  <span className="info-value">
                    {formatDateDisplay(dateTo)} {timeTo}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Продолжительность:</span>
                  <span className="info-value">
                    {bookingHours > 0 ? `${bookingHours} часов` : 'Не указано'}
                  </span>
                </div>
              </div>
            </div>

            {cartItems.length > 0 && (
              <div className="info-section">
                <h2>Заказ из кафе</h2>
                <div className="cart-items-list">
                  {cartItems.map(item => (
                    <div key={item.id} className="cart-item-confirm">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">{item.price * item.quantity} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="payment-section">
            <div className="payment-card">
              <h3>Стоимость бронирования</h3>
              
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span>Аренда места ({bookingHours} часов × {actualPlaceRate} ₽/час):</span>
                  <span>{placeCost} ₽</span>
                </div>
                
                {cartItems.length > 0 && (
                  <div className="cost-item">
                    <span>Заказ из кафе:</span>
                    <span>{totalPrice} ₽</span>
                  </div>
                )}
                
                <div className="cost-total">
                  <span>Итого к оплате:</span>
                  <span className="total-amount">{bookingCost} ₽</span>
                </div>
              </div>

              <div className="payment-actions">
                <button 
                  className="btn payment-btn primary"
                  onClick={handlePayment}
                >
                  Перейти к оплате {bookingCost} ₽
                </button>
                
                <button 
                  className="btn secondary"
                  onClick={handleEditBooking}
                >
                  Изменить бронь
                </button>
                <button 
                  className="btn secondary"
                  onClick={handleBackToHome}
                >
                  На главную
                </button>
              </div>

              <div className="payment-security">
                <div className="security-info">
                  <span className="security-icon">🔒</span>
                  <span>Безопасная оплата через CloudPayments</span>
                </div>
                <p className="security-note">
                  После оплаты вы получите подтверждение на email и смс
                </p>
              </div>
            </div>

            <div className="support-info">
              <h4>Нужна помощь?</h4>
              <p>Телефон поддержки: +7 (999) 123-45-67</p>
              <p>Email: support@cyberclub.ru</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;