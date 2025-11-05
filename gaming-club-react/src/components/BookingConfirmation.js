

import React, { useState, useEffect } from 'react'; 
import { apiService } from '../services/Api';
import '../styles/BookingConfirmation.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BookingConfirmation = () => {
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [tariffData, setTariffData] = useState({ coefficient: 1 });
  const [computers, setComputers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [clubs, setClubs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated } = useAuth(); 

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    bank: 'sberbank'
  });
  const [cardError, setCardError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  
  // CSS переменные как в Cafe.css
  const cssVariables = {
    '--cafe-primary-color': '#6a5af9',
    '--cafe-secondary-color': '#9d89ff',
    '--cafe-accent-color': '#c96bff',
    '--cafe-text-color': '#e0e0ff',
    '--cafe-bg-dark': 'rgba(40, 40, 60, 0.8)',
    '--cafe-bg-card': 'rgba(50, 45, 75, 0.7)',
    '--cafe-border-color': 'rgba(106, 90, 205, 0.3)',
    '--cafe-glow': 'rgba(106, 90, 249, 0.4)'
  };

  
  useEffect(() => {
    if (!isAuthenticated) {
      console.warn('⚠️ Пользователь не авторизован, редирект на login');
      navigate('/login');
      return;
    }
  
    if (token) {
      // Вместо несуществующего setToken используем setAuthHeader
      apiService.setAuthHeader(`Bearer ${token}`);
      console.log('🔑 Auth token set via setAuthHeader:', token);
    }
  }, [isAuthenticated, token]);
  
  
  useEffect(() => { 
    if (!isAuthenticated) return;
    const loadBookingData = () => {
      try {
        let data = null;
        
        // Приоритет: location.state -> savedBooking -> lastBooking
        if (location.state) {
          data = location.state;
          console.log('📋 Booking data loaded from location state');
        } else {
          const savedData = localStorage.getItem('savedBooking') || localStorage.getItem('lastBooking');
          console.log('Loading booking data from localStorage:', savedData);
          
          if (savedData) {
            data = JSON.parse(savedData);
            console.log('✅ Booking data loaded successfully');
          } else {
            console.warn('❌ No booking data found');
          }
        }
  
        if (data) {
          setBookingData(prev => ({
            ...prev,              // сохраняем всё, что уже было
            ...data,              // накладываем новые данные (из state или localStorage)
            selectedPlaceRate: data.selectedPlaceRate ?? prev?.selectedPlaceRate ?? 0 // если нет — не затираем
          }));
  
          // Сохраняем в единый ключ для согласованности
          localStorage.setItem('savedBooking', JSON.stringify({
            ...data,
            selectedPlaceRate: data.selectedPlaceRate ?? JSON.parse(localStorage.getItem('savedBooking') || '{}')?.selectedPlaceRate ?? 0
          }));
        }
      } catch (error) {
        console.error('❌ Error loading booking data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    loadBookingData();
  }, [location.state]);
  

  useEffect(() => {
    const loadAdditionalData = async () => {
      if (!bookingData) return;
      
      try {
        console.log('🔄 Loading additional data from API...');
        
        // Исправленный Promise.all с fallback значениями
        const [foodsData, computersData, clubsData] = await Promise.all([
          apiService.getFoods().catch(error => {
            console.error('❌ Error loading foods:', error);
            return [];
          }),
          apiService.getComputers().catch(error => {
            console.error('❌ Error loading computers:', error);
            return [];
          }),
          apiService.getClubs().catch(error => {
            console.error('❌ Error loading clubs:', error);
            return [];
          })
        ]);
        
        console.log('📊 API Data loaded:', {
          foods: foodsData.length,
          computers: computersData.length,
          clubs: clubsData.length
        });
        
        setFoods(foodsData);
        setComputers(computersData);
        setClubs(clubsData);
        try {
          const foodsData = await apiService.getFoods();
          console.log('✅ Foods loaded:', foodsData.length);
        } catch (error) {
          if (error.status === 401) {
            console.error('❌ Unauthorized! Redirecting to login...');
            navigate('/login');
          } else {
            console.error('❌ Error loading foods:', error);
          }
        }
        
        // Загрузка тарифа с улучшенной обработкой ошибок
        try {
          let tariff;
          try {
            tariff = await apiService.getTariff(1);
          } catch (e) {
            console.log('🔄 Trying alternative tariff endpoint...');
            tariff = await apiService.request('/tariffs/1').catch(() => null);
          }
          
          if (tariff) {
            console.log('✅ Tariff data loaded:', tariff);
            setTariffData(tariff);
          } else {
            throw new Error('Tariff not available');
          }
        } catch (tariffError) {
          console.error('⚠️ Error loading tariff, using fallback:', tariffError);
          setTariffData({ coefficient: 1 }); // Fallback значение
        }
        
      } catch (error) {
        console.error('❌ Error loading additional data:', error);
      }
    };

    loadAdditionalData();
  }, [bookingData]);

  // Вспомогательные функции для получения данных с проверками
  const getComputerInfo = (computerId) => {
    if (!computerId || !computers.length) return null;
    
    const computer = computers.find(c => c.id == computerId);
    if (!computer) {
      console.log(`❌ Computer not found for ID: ${computerId}`);
      return null;
    }

    return {
      id: computer.id,
      name: computer.name || `Компьютер ${computer.id}`,
      price: computer.price,
      processor: computer.processor,
      graphicsCard: computer.graphics_card,
      ram: computer.ram,
      monitor: computer.monitor,
      headphones: computer.headphones,
      keyboard: computer.keyboard,
      mouse: computer.mouse
    };
  };

  const getClubInfo = (clubId) => {
    if (!clubId || !clubs.length) return { address: 'Не указан', name: 'Неизвестный клуб' };
    
    const club = clubs.find(c => c.id == clubId);
    if (!club) {
      console.log(`❌ Club not found for ID: ${clubId}`);
      return { address: `Клуб #${clubId}`, name: 'Неизвестный клуб' };
    }

    return club;
  };

  const getFoodInfo = (foodId) => {
    if (!foods.length) return { name: `Продукт #${foodId}`, price: 0 };
    
    const food = foods.find(f => f.id == foodId);
    if (!food) {
      console.log(`❌ Food not found for ID: ${foodId}`);
      return { name: `Продукт #${foodId}`, price: 0 };
    }
    return food;
  };

  const getPlaceInfo = (placeNumber) => {
    const placeInfo = {
      1: { type: "Gaming PC" },
      2: { type: "Gaming PC" },
      3: { type: "Gaming PC" },
      4: { type: "Gaming PC" },
      5: { type: "Streaming PC" },
      6: { type: "Competitive PC" },
      8: { type: "PlayStation 5" },
      9: { type: "PlayStation 5 Pro" },
      10: { type: "VR Station" },
      11: { type: "Audio Station" },
      12: { type: "PlayStation 4 Pro" },
      13: { type: "Nintendo Switch" },
      14: { type: "Premium Audio" }
    };
    return placeInfo[placeNumber] || { type: "Стандартное место" };
  };

  
  const {
    formData = {},
    selectedPlace,
    selectedPlaceRate = 0,
    cartItems = [],
    totalPrice = 0,
    calculatedData = {}
  } = bookingData || {};
  
  const placeRate = selectedPlaceRate || calculatedData?.placeRate || 0;
  
  const {
    place = '',
    dateFrom = '',
    timeFrom = '',
    dateTo = '',
    timeTo = '',
    address = '',
    computer_id = '',
    club_id = ''
  } = formData;

  // Расчеты стоимости
  const foodTotal = cartItems.reduce((sum, item) => {
    const foodInfo = getFoodInfo(item.id);
    return sum + (foodInfo.price || 0) * item.quantity;
  }, 0);

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    try {
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
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getBookingHours = () => {
    if (!dateFrom || !timeFrom || !dateTo || !timeTo) return 0;
    
    try {
      const startDateTime = new Date(`${dateFrom}T${timeFrom}`);
      const endDateTime = new Date(`${dateTo}T${timeTo}`);
      const hoursDiff = (endDateTime - startDateTime) / (1000 * 60 * 60);
      
      return Math.max(0, Math.round(hoursDiff * 10) / 10);
    } catch (error) {
      console.error('❌ Error calculating booking hours:', error);
      return 0;
    }
  };

  const calculateBaseCost = () => {
    if (calculatedData && calculatedData.totalCost) {
      return calculatedData.totalCost;
    }
    
    if (!dateFrom || !timeFrom || !dateTo || !timeTo) return foodTotal;
    
    try {
      const startDateTime = new Date(`${dateFrom}T${timeFrom}`);
      const endDateTime = new Date(`${dateTo}T${timeTo}`);
      const hours = (endDateTime - startDateTime) / (1000 * 60 * 60);
      
      const placeCost = Math.round(hours * placeRate);
      return placeCost + foodTotal;
    } catch (error) {
      console.error('❌ Error calculating booking cost:', error);
      return foodTotal;
    }
  };

  const calculateDiscount = (baseCost) => {
    if (!appliedPromoCode) return { percent: 0, amount: 0 };
    
    // Используем локальную переменную для актуальных данных
    const currentPromo = appliedPromoCode;
    const coefficient = currentPromo.coefficient || 0.9;
    
    const discountPercent = Math.round((1 - coefficient) * 100);
    const discountAmount = Math.round(baseCost * (1 - coefficient));
    
    return {
      percent: discountPercent,
      amount: discountAmount
    };
  };

  const calculateFinalCost = () => {
    const baseCost = calculateBaseCost();
    
    if (!appliedPromoCode) {
      return baseCost;
    }
    
    const discount = calculateDiscount(baseCost);
    return Math.max(0, baseCost - discount.amount);
  };

  // Расчет всех значений
  const bookingHours = getBookingHours();
  const baseCost = calculateBaseCost();
  const finalCost = calculateFinalCost();
  const discount = calculateDiscount(baseCost);
  const placeCost = calculatedData?.placeCost || Math.round(bookingHours * placeRate);

  // Получение информации о месте, компьютере и клубе
  const placeInfo = getPlaceInfo(selectedPlace);
  const computerInfo = getComputerInfo(computer_id);
  const clubInfo = getClubInfo(club_id);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      alert('Введите промокод');
      return;
    }

    try {
      console.log('🔄 Applying promo code:', promoCode);
      
      let promoData;
      try {
        const promoCodes = await apiService.getPromoCodes();
        promoData = promoCodes.find(p => p.code === promoCode);
        console.log('✅ Found promo code in API:', promoData);
      } catch (apiError) {
        console.log('⚠️ Cannot load promocodes from API, using default');
      }
      
      // Используем локальную переменную для немедленного применения
      let appliedPromo;
      if (promoData) {
        appliedPromo = {
          id: promoData.id,
          code: promoData.code,
          discount: promoData.discount_percent || 10,
          discount_type: 'percent',
          coefficient: promoData.coefficient || 0.9
        };
      } else {
        const coefficient = 0.9;
        const discountPercent = Math.round((1 - coefficient) * 100);
        
        appliedPromo = {
          id: Date.now(), // временный ID
          code: promoCode,
          discount: discountPercent,
          discount_type: 'percent',
          coefficient: coefficient
        };
      }
      
      setAppliedPromoCode(appliedPromo);
      alert(`✅ Промокод "${promoCode}" применен! Скидка: ${appliedPromo.discount}%`);
      
    } catch (error) {
      console.error('❌ Promo code error:', error);
      alert('❌ Ошибка при применении промокода');
    }
  };

  const handleEditBooking = () => {
    navigate('/booking', { state: bookingData });
  };

  const handleBackToHome = () => {
    localStorage.removeItem('bookingStarted');
    localStorage.removeItem('selectedClubId');
    localStorage.removeItem('bookingFormData');
    localStorage.removeItem('savedBooking');
    localStorage.removeItem('cartClubId'); // сбрасываем привязку корзины к клубу
    clearCart(); //  очищаем корзину полностью
    
    navigate('/');
  };

  const handleMockPayment = () => {
    const { number, expiry, cvv } = cardData;

    if (number.replace(/\s/g, '').length !== 16) {
      setCardError('Номер карты должен содержать 16 цифр');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setCardError('Срок действия должен быть в формате ММ/ГГ');
      return;
    }
    if (cvv.length !== 3) {
      setCardError('CVV должен содержать 3 цифры');
      return;
    }

    setProcessingPayment(true);
    setCardError('');

    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentSuccess(true);

      setTimeout(() => {
        const bookingNumber = 'CYB-2025-' + Math.floor(1000 + Math.random() * 9000);
        alert(`✅ Бронирование успешно подтверждено!\nНомер брони: ${bookingNumber}`);
        
        // Очистка данных
        localStorage.removeItem('savedBooking');
        localStorage.removeItem('lastBooking');
        localStorage.removeItem('bookingStarted');
        
        navigate('/');
      }, 2000);
    }, 1500);
  };

  const renderPromoCodeInfo = () => {
    if (!appliedPromoCode) return null;

    return (
      <div className="promo-code-applied">
        <span className="promo-success">✅ Применен промокод: {appliedPromoCode.code}</span>
        {appliedPromoCode.discount && (
          <span className="discount-badge"> (Скидка: {appliedPromoCode.discount}%)</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="booking-confirmation" style={cssVariables}>
        <div className="background-container">
          <div className="bg-overlay"></div>
        </div>
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h2>Загрузка данных бронирования...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingData || !selectedPlace) {
    return (
      <div className="booking-confirmation" style={cssVariables}>
        <div className="background-container">
          <div className="bg-overlay"></div>
        </div>
        <div className="container">
          <div className="no-booking-data">
            <h2>❌ Данные бронирования не найдены</h2>
            <p>Пожалуйста, вернитесь и создайте бронирование заново.</p>
            <div className="action-buttons">
              <button 
                className="confirmation-btn primary"
                onClick={() => navigate('/booking')}
              >
                Вернуться к бронированию
              </button>
              <button 
                className="confirmation-btn secondary"
                onClick={handleBackToHome}
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-confirmation" style={cssVariables}>
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>

      <div className="container">
        <div className="confirmation-header">
          <h1>✅ Подтверждение бронирования</h1>
          <p className="confirmation-subtitle">Проверьте данные перед оплатой</p>
        </div>

        <div className="confirmation-content">
          <div className="main-content">
            <div className="booking-info-card">
              <div className="card-header">
                <h2>📋 Информация о брони</h2>
                <div className="booking-badge">Место №{place}</div>
              </div>
              
              <div className="info-grid">
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Тип места:</span>
                    <span className="info-value highlight">{placeInfo.type}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Тариф:</span>
                    <span className="info-value">{placeRate} ₽/час</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">User ID:</span>
                    <span className="info-value highlight">{user?.id || 'Неизвестно'}</span>
                  </div>
                </div>


                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Клуб:</span>
                    <span className="info-value">{clubInfo.address || address}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Продолжительность:</span>
                    <span className="info-value highlight">{bookingHours > 0 ? `${bookingHours} часов` : 'Не указано'}</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Начало:</span>
                    <span className="info-value">
                      {formatDateDisplay(dateFrom)} <strong>{timeFrom}</strong>
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Окончание:</span>
                    <span className="info-value">
                      {formatDateDisplay(dateTo)} <strong>{timeTo}</strong>
                    </span>
                  </div>
                </div>

                {computerInfo && (
                  <div className="computer-specs">
                    <h3>💻 Характеристики компьютера</h3>
                    <div className="specs-grid">
                      <div className="spec-item">
                        <span className="spec-label">Процессор:</span>
                        <span className="spec-value">{computerInfo.processor || 'Не указан'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Видеокарта:</span>
                        <span className="spec-value">{computerInfo.graphicsCard || 'Не указана'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Оперативная память:</span>
                        <span className="spec-value">{computerInfo.ram || 'Не указана'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="promo-section">
              <div className="card-header">
                <h2>🎫 Промокод</h2>
              </div>
              <div className="promo-code-section">
                <input
                  type="text"
                  placeholder="Введите промокод"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="promo-code-input"
                />
                <button 
                  onClick={applyPromoCode}
                  className="confirmation-btn promo-btn"
                >
                  Применить
                </button>
              </div>
              {renderPromoCodeInfo()}
            </div>

            {cartItems.length > 0 && (
              <div className="food-order-section">
                <div className="card-header">
                  <h2>🍔 Заказ из кафе</h2>
                  <div className="items-count">{cartItems.length} позиций</div>
                </div>
                <div className="cart-items-list">
                  {cartItems.map(item => {
                    const foodInfo = getFoodInfo(item.id);
                    return (
                      <div key={item.id} className="cart-item-confirm">
                        <div className="item-info">
                          <span className="item-name">{foodInfo.name}</span>
                          <span className="item-quantity">×{item.quantity}</span>
                        </div>
                        <span className="item-price">{(foodInfo.price || 0) * item.quantity} ₽</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="sidebar">
            <div className="payment-card">
              <div className="card-header">
                <h3>💰 Стоимость бронирования</h3>
              </div>
              
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span>Аренда места ({bookingHours} часов × {placeRate} ₽/час):</span>
                  <span>{placeCost} ₽</span>
                </div>
                
                {cartItems.length > 0 && (
                  <div className="cost-item">
                    <span>Заказ из кафе:</span>
                    <span>{foodTotal} ₽</span>
                  </div>
                )}

                {appliedPromoCode && discount.amount > 0 && (
                  <>
                    <div className="cost-item discount">
                      <span>Скидка по промокоду ({appliedPromoCode.discount}%):</span>
                      <span>-{discount.amount} ₽</span>
                    </div>
                    <div className="cost-item original-price">
                      <span>Изначальная стоимость:</span>
                      <span className="strikethrough">{baseCost} ₽</span>
                    </div>
                  </>
                )}
                
                <div className="cost-total">
                  <span>Итого к оплате:</span>
                  <span className="total-amount">{finalCost} ₽</span>
                </div>
              </div>

              <div className="payment-section">
                {!showPaymentForm ? (
                  <button 
                    className="confirmation-btn payment-btn primary"
                    onClick={() => setShowPaymentForm(true)}
                    disabled={processingPayment}
                  >
                    💳 Перейти к оплате {finalCost} ₽
                  </button>
                ) : (
                  <div className="mock-payment-form">
                    <div className="payment-header">
                      <h4>💳 Оплата картой</h4>
                    </div>
                    
                    {cardError && <div className="payment-error">❌ {cardError}</div>}
                    {paymentSuccess && (
                      <div className="payment-success">
                        ✅ Оплата прошла успешно! Бронирование подтверждено.
                      </div>
                    )}

                    {!paymentSuccess && (
                      <>
                        <div className="form-group">
                          <label>Номер карты</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={cardData.number}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                              setCardData(prev => ({ ...prev, number: v }));
                              setCardError('');
                            }}
                            maxLength={19}
                            className="card-input"
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Срок действия</label>
                            <input
                              type="text"
                              placeholder="ММ/ГГ"
                              value={cardData.expiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                                setCardData(prev => ({ ...prev, expiry: v }));
                                setCardError('');
                              }}
                              maxLength={5}
                              className="expiry-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>CVV</label>
                            <input
                              type="password"
                              placeholder="123"
                              value={cardData.cvv}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '').slice(0, 3);
                                setCardData(prev => ({ ...prev, cvv: v }));
                                setCardError('');
                              }}
                              maxLength={3}
                              className="cvv-input"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Банк-эмитент</label>
                          <select
                            value={cardData.bank}
                            onChange={(e) => setCardData(prev => ({ ...prev, bank: e.target.value }))}
                            className="bank-select"
                          >
                            <option value="sberbank">Сбербанк</option>
                            <option value="tinkoff">Тинькофф</option>
                            <option value="vtb">ВТБ</option>
                            <option value="alfa">Альфа-Банк</option>
                            <option value="gazprom">Газпромбанк</option>
                            <option value="raiffeisen">Райффайзен</option>
                          </select>
                        </div>

                        <div className="payment-actions-row">
                          <button
                            type="button"
                            className="confirmation-btn secondary"
                            onClick={() => setShowPaymentForm(false)}
                          >
                            Назад
                          </button>
                          <button
                            type="button"
                            className="confirmation-btn primary"
                            onClick={handleMockPayment}
                            disabled={processingPayment}
                          >
                            {processingPayment ? '⏳ Обработка...' : '💳 Оплатить'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                <div className="secondary-actions">
                  <button 
                    className="confirmation-btn outline"
                    onClick={handleEditBooking}
                    disabled={processingPayment}
                  >
                    ✏️ Изменить бронь
                  </button>
                  <button 
                    className="confirmation-btn outline"
                    onClick={handleBackToHome}
                    disabled={processingPayment}
                  >
                    🏠 На главную
                  </button>
                </div>
              </div>

              <div className="payment-security">
                <div className="security-info">
                  <span>🔒 Безопасная оплата через CloudPayments</span>
                </div>
                <p className="security-note">
                  После оплаты вы получите подтверждение на email и смс
                </p>
              </div>
            </div>

            <div className="support-card">
              <div className="support-info">
                <h4>📞 Нужна помощь?</h4>
                <p>Телефон поддержки: +7 (999) 123-45-67</p>
                <p>Email: support@cyberclub.ru</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;