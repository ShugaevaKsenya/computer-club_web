import React, { useState, useEffect } from 'react';
import { apiService } from '../services/Api';
import '../styles/BookingConfirmation.css';
import { useNavigate } from 'react-router-dom';
const BookingConfirmation = () => {
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [tariffData, setTariffData] = useState(null);
  const [computers, setComputers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [clubs, setClubs] = useState([]);
  const navigate = useNavigate();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
const [cardData, setCardData] = useState({
  number: '',
  expiry: '',
  cvv: '',
  bank: 'sberbank'
});
const [cardError, setCardError] = useState('');
const [paymentSuccess, setPaymentSuccess] = useState(false);
  useEffect(() => {
    const loadBookingData = () => {
      try {
        const savedData = localStorage.getItem('lastBooking');
        console.log('📦 Loading booking data from localStorage:', savedData);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setBookingData(parsedData);
          console.log('✅ Booking data loaded successfully');
        } else {
          console.warn('❌ No booking data found in localStorage');
        }
      } catch (error) {
        console.error('❌ Error loading booking data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, []);

  useEffect(() => {
    const loadAdditionalData = async () => {
      if (!bookingData) return;
      
      try {
        console.log('🔄 Loading additional data from API...');
        
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
          let tariff;
          try {
            tariff = await apiService.getTariff(1);
          } catch (e) {
            console.log('⚠️ Trying alternative tariff endpoint...');
            tariff = await apiService.request('/tariffs/1');
          }
          console.log('💰 Tariff data loaded:', tariff);
          setTariffData(tariff);
        } catch (tariffError) {
          console.error('❌ Error loading tariff:', tariffError);
          setTariffData({ coefficient: 1 });
        }
        
      } catch (error) {
        console.error('❌ Error loading additional data:', error);
      }
    };

    loadAdditionalData();
  }, [bookingData]);

  // Метод для сохранения локальных данных о еде
  const saveLocalFoodItems = (bookingId, foodItems) => {
    try {
      const localFoodData = {
        bookingId: bookingId,
        items: foodItems,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`local_food_${bookingId}`, JSON.stringify(localFoodData));
      console.log('💾 Local food data saved:', localFoodData);
    } catch (error) {
      console.error('❌ Error saving local food data:', error);
    }
  };

  // Сохраняем сводку заказа еды
  const saveFoodOrderSummary = (bookingId, cartItems, totalPrice) => {
    try {
      const orderSummary = {
        bookingId: bookingId,
        items: cartItems.map(item => ({
          name: item.name,
          food_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: totalPrice,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`food_order_${bookingId}`, JSON.stringify(orderSummary));
      console.log('📋 Food order summary saved for manual processing:', orderSummary);
    } catch (error) {
      console.error('❌ Error saving food order summary:', error);
    }
  };

  const data = bookingData || {};

  const {
    formData = {},
    selectedPlace,
    placeRate,
    cartItems = [],
    totalPrice = 0,
    calculatedData = {}
  } = data;

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

  // Функция для получения информации о компьютере
  const getComputerInfo = (computerId) => {
    if (!computerId) return null;
    
    const computer = computers.find(c => c.id == computerId);
    if (!computer) {
      console.log(`❌ Computer not found for ID: ${computerId}`);
      console.log('Available computers:', computers.map(c => ({ id: c.id, name: c.name })));
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

  // Функция для получения информации о клубе
  const getClubInfo = (clubId) => {
    if (!clubId) return { address: 'Не указан', name: 'Неизвестный клуб' };
    
    const club = clubs.find(c => c.id == clubId);
    if (!club) {
      console.log(`❌ Club not found for ID: ${clubId}`);
      return { address: `Клуб #${clubId}`, name: 'Неизвестный клуб' };
    }

    return club;
  };

  // Функция для получения информации о еде
  const getFoodInfo = (foodId) => {
    const food = foods.find(f => f.id == foodId);
    if (!food) {
      console.log(`❌ Food not found for ID: ${foodId}`);
      return { name: `Продукт #${foodId}`, price: 0 };
    }
    return food;
  };

  // Функция для получения информации о месте
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

  const placeInfo = getPlaceInfo(selectedPlace);
  const actualPlaceRate = placeRate;
  const computerInfo = getComputerInfo(computer_id);
  const clubInfo = getClubInfo(club_id);

  if (loading) {
    return (
      <div className="booking-confirmation">
        <div className="container">
          <div className="loading-state">
            <h2>Загрузка данных бронирования...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingData || !selectedPlace) {
    return (
      <div className="booking-confirmation">
        <div className="container">
          <div className="no-booking-data">
            <h2>Данные бронирования не найдены</h2>
            <p>Пожалуйста, вернитесь и создайте бронирование заново.</p>
            <button 
              className="btn primary"
              onClick={() => window.location.href = '/booking'}
            >
              Вернуться к бронированию
            </button>
            <button 
              className="btn secondary"
              onClick={() => window.location.href = '/'}
              style={{marginLeft: '10px'}}
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      
      return Math.round(hoursDiff * 10) / 10;
    } catch (error) {
      console.error('Error calculating booking hours:', error);
      return 0;
    }
  };

  // Расчет стоимости без скидки
  const calculateBaseCost = () => {
    if (calculatedData && calculatedData.totalCost) {
      return calculatedData.totalCost;
    }
    
    if (!dateFrom || !timeFrom || !dateTo || !timeTo) return 0;
    
    try {
      const startDateTime = new Date(`${dateFrom}T${timeFrom}`);
      const endDateTime = new Date(`${dateTo}T${timeTo}`);
      const hours = (endDateTime - startDateTime) / (1000 * 60 * 60);
      
      const placeCost = Math.round(hours * actualPlaceRate);
      return placeCost + totalPrice;
    } catch (error) {
      console.error('Error calculating booking cost:', error);
      return totalPrice;
    }
  };

  const calculateDiscount = (baseCost) => {
    if (!appliedPromoCode) return { percent: 0, amount: 0 };
    
    const coefficient = tariffData?.coefficient || (appliedPromoCode.coefficient || 0.9);
    
    const discountPercent = Math.round((1 - coefficient) * 100);
    const discountAmount = baseCost * (1 - coefficient);
    
    return {
      percent: discountPercent,
      amount: Math.round(discountAmount)
    };
  };

  const calculateFinalCost = () => {
    const baseCost = calculateBaseCost();
    
    if (!appliedPromoCode) {
      return baseCost;
    }
    
    const discount = calculateDiscount(baseCost);
    return baseCost - discount.amount;
  };

  const bookingHours = getBookingHours();
  const baseCost = calculateBaseCost();
  const finalCost = calculateFinalCost();
  const discount = calculateDiscount(baseCost);
  const placeCost = calculatedData?.placeCost || Math.round(bookingHours * actualPlaceRate);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      alert('Введите промокод');
      return;
    }

    try {
      console.log('🔍 Applying promo code:', promoCode);
      
      let promoData;
      try {
        const promoCodes = await apiService.getPromoCodes();
        promoData = promoCodes.find(p => p.code === promoCode);
        console.log('🔍 Found promo code in API:', promoData);
      } catch (apiError) {
        console.log('⚠️ Cannot load promocodes from API, using default');
      }
      
      if (promoData) {
        setAppliedPromoCode({
          id: promoData.id,
          code: promoData.code,
          discount: promoData.discount_percent || 10,
          discount_type: 'percent',
          coefficient: promoData.coefficient || 0.9
        });
      } else {
        const coefficient = 0.9; 
        const discountPercent = Math.round((1 - coefficient) * 100);
        
        setAppliedPromoCode({
          id: 1,
          code: promoCode,
          discount: discountPercent,
          discount_type: 'percent',
          coefficient: coefficient
        });
      }
      
      alert(`Промокод "${promoCode}" применен! Скидка: ${appliedPromoCode?.discount || 10}%`);
      
    } catch (error) {
      console.error('Promo code error:', error);
      alert('Ошибка при применении промокода');
    }
  };

  const handleEditBooking = () => {
    window.location.href = '/booking';
  };

  const handleBackToHome = () => {
  navigate('/'); 
  };

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      
      console.log('🔄 Creating booking in database...');
      
      const bookingMinutes = getBookingHours() * 60;
      const placeCostValue = Math.round((bookingMinutes / 60) * actualPlaceRate);
      const totalCostValue = finalCost;

      const bookingDataToSend = {
        computer_id: parseInt(computer_id) || 1,
        user_id: 1,
        club_id: parseInt(club_id) || 1,
        tariff_id: 1,
        code_id: appliedPromoCode ? appliedPromoCode.id : 1,
        start_time: `${dateFrom} ${timeFrom}:00`,
        end_time: `${dateTo} ${timeTo}:00`,
        minutes: bookingMinutes,
        price_for_pc: placeCostValue,
        price_for_additions: totalPrice,
        total_price: totalCostValue,
        status: 'pending'
      };

      console.log('📤 Sending booking to API:', bookingDataToSend);
      
      const bookingResponse = await apiService.createBooking(bookingDataToSend);
      console.log('✅ Booking created:', bookingResponse);

      console.log('🔄 Creating payment...');
      
      const paymentData = {
        user_id: 1,
        booking_id: bookingResponse.id,
        price: totalCostValue,
        payment_type: 'card',
        status: 'pending',
        payment_hash: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        payment_date: new Date().toISOString().split('T')[0]
      };

      console.log('📤 Sending payment to API:', paymentData);

      const paymentResponse = await apiService.createPayment(paymentData);
      console.log('✅ Payment created:', paymentResponse);

      if (cartItems.length > 0) {
        console.log('🔄 Adding food items to booking...');
        
        let foodResults = {
          success: 0,
          failed: 0,
          errors: [],
          localItems: []
        };
        
        const foodPromises = cartItems.map(async (item) => {
          try {
            console.log(`📤 Adding food item:`, {
              booking_id: bookingResponse.id,
              food_id: item.id,
              count: item.quantity
            });
            
            const foodResponse = await apiService.addFoodToBooking(bookingResponse.id, {
              food_id: item.id,
              count: item.quantity
            });
            
            console.log(`✅ Added ${item.name} to booking:`, foodResponse);
            
            if (foodResponse.local_only) {
              foodResults.localItems.push({
                name: item.name,
                food_id: item.id,
                count: item.quantity
              });
            }
            
            foodResults.success++;
            return { success: true, item: item.name, data: foodResponse };
            
          } catch (foodError) {
            console.error(`❌ Error adding ${item.name} to booking:`, foodError);
            foodResults.failed++;
            foodResults.errors.push({
              item: item.name,
              error: foodError.message
            });
            
            return { success: false, item: item.name, error: foodError };
          }
        });
        
        await Promise.allSettled(foodPromises);
        
        if (foodResults.localItems.length > 0) {
          saveLocalFoodItems(bookingResponse.id, foodResults.localItems);
        }
        
        saveFoodOrderSummary(bookingResponse.id, cartItems, totalPrice);
        
        let message = `Заказ из кафе: ${foodResults.success} из ${cartItems.length} позиций обработано`;
        
        if (foodResults.localItems.length > 0) {
          message += `\n⚠️ ${foodResults.localItems.length} позиций сохранены локально (ошибка сервера)`;
        }
        
        if (foodResults.errors.length > 0) {
          message += `\n❌ Не удалось добавить: ${foodResults.errors.length} позиций`;
          console.warn('Failed food items:', foodResults.errors);
        }
        
        if (foodResults.failed > 0 || foodResults.localItems.length > 0) {
          alert(message);
        } else {
          console.log(`✅ All ${cartItems.length} food items added successfully`);
        }
      }

      const updatedBookingData = {
        ...bookingData,
        id: bookingResponse.id,
        payment_id: paymentResponse.id,
        status: 'pending_payment'
      };

      localStorage.setItem('lastBooking', JSON.stringify(updatedBookingData));

      alert('Платеж обработан успешно! Бронирование подтверждено.');
      localStorage.removeItem('lastBooking');
      localStorage.removeItem('bookingStarted');
      navigate('/');

    } catch (error) {
      console.error('Payment error:', error);
      alert('Ошибка при обработке платежа. Пожалуйста, попробуйте еще раз.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Функция создания бронирования без оплаты
  const handleSimplePayment = async () => {
    try {
      setProcessingPayment(true);
      
      console.log('🔄 Creating booking without payment...');
      
      const bookingMinutes = getBookingHours() * 60;
      const placeCostValue = Math.round((bookingMinutes / 60) * actualPlaceRate);
      const totalCostValue = finalCost;
      const bookingDataToSend = {
        computer_id: parseInt(computer_id) || 1,
        user_id: 1,
        club_id: parseInt(club_id) || 1,
        tariff_id: 1,
        code_id: appliedPromoCode ? appliedPromoCode.id : 1,
        start_time: `${dateFrom} ${timeFrom}:00`,
        end_time: `${dateTo} ${timeTo}:00`,
        minutes: bookingMinutes,
        price_for_pc: placeCostValue,
        price_for_additions: totalPrice,
        total_price: totalCostValue,
        status: 'confirmed'
      };

      console.log('📤 Sending booking to API:', bookingDataToSend);
      
      const bookingResponse = await apiService.createBooking(bookingDataToSend);
      console.log('✅ Booking created:', bookingResponse);
      if (cartItems.length > 0) {
        console.log('🔄 Adding food items to booking...');
        
        let foodResults = {
          success: 0,
          failed: 0,
          errors: [],
          localItems: []
        };
        
        const foodPromises = cartItems.map(async (item) => {
          try {
            console.log(`📤 Adding food item:`, {
              booking_id: bookingResponse.id,
              food_id: item.id,
              count: item.quantity
            });
            
            const foodResponse = await apiService.addFoodToBooking(bookingResponse.id, {
              food_id: item.id,
              count: item.quantity
            });
            
            console.log(`✅ Added ${item.name} to booking:`, foodResponse);
            
            if (foodResponse.local_only) {
              foodResults.localItems.push({
                name: item.name,
                food_id: item.id,
                count: item.quantity
              });
            }
            
            foodResults.success++;
            return { success: true, item: item.name, data: foodResponse };
            
          } catch (foodError) {
            console.error(`❌ Error adding ${item.name} to booking:`, foodError);
            foodResults.failed++;
            foodResults.errors.push({
              item: item.name,
              error: foodError.message
            });
            
            return { success: false, item: item.name, error: foodError };
          }
        });
        
        await Promise.allSettled(foodPromises);
        
        if (foodResults.localItems.length > 0) {
          saveLocalFoodItems(bookingResponse.id, foodResults.localItems);
        }
        
        saveFoodOrderSummary(bookingResponse.id, cartItems, totalPrice);
        
        let message = `Заказ из кафе: ${foodResults.success} из ${cartItems.length} позиций обработано`;
        
        if (foodResults.localItems.length > 0) {
          message += `\n⚠️ ${foodResults.localItems.length} позиций сохранены локально (ошибка сервера)`;
        }
        
        if (foodResults.errors.length > 0) {
          message += `\n❌ Не удалось добавить: ${foodResults.errors.length} позиций`;
          console.warn('Failed food items:', foodResults.errors);
        }
        
        if (foodResults.failed > 0 || foodResults.localItems.length > 0) {
          alert(message);
        } else {
          console.log(`✅ All ${cartItems.length} food items added successfully`);
        }
      }

      alert('Бронирование успешно создано! Номер брони: ' + bookingResponse.id);
      localStorage.removeItem('lastBooking');
      localStorage.removeItem('bookingStarted');
      navigate('/');

    } catch (error) {
      console.error('Booking creation error:', error);
      alert('Ошибка при создании бронирования. Пожалуйста, попробуйте еще раз.');
    } finally {
      setProcessingPayment(false);
    }
  };
const handleMockPayment = () => {
  const { number, expiry, cvv } = cardData;

  // Простая валидация
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

  // Имитация задержки
  setTimeout(() => {
    setProcessingPayment(false);
    setPaymentSuccess(true);

    // Через 2 секунды — завершить бронь
    setTimeout(() => {
      alert('✅ Бронирование успешно подтверждено!\nНомер брони: CYB-2025-' + Math.floor(1000 + Math.random() * 9000));
      localStorage.removeItem('lastBooking');
      localStorage.removeItem('bookingStarted');
      navigate('/');
    }, 2000);
  }, 1500);
};
  // Отображение информации о примененном промокоде
  const renderPromoCodeInfo = () => {
    if (!appliedPromoCode) return null;

    return (
      <div className="promo-code-applied">
        <span>✅ Применен промокод: {appliedPromoCode.code}</span>
        {appliedPromoCode.discount && (
          <span> (Скидка: {appliedPromoCode.discount}%)</span>
        )}
      </div>
    );
  };
  console.log('🔍 Current state:', {
    bookingData: !!bookingData,
    foodsCount: foods.length,
    computersCount: computers.length,
    clubsCount: clubs.length,
    tariffData: !!tariffData,
    computerInfo: !!computerInfo,
    clubInfo: !!clubInfo
  });

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
                
                {computerInfo && (
                  <>
                    <div className="info-item">
                      <span className="info-label">Компьютер:</span>
                      <span className="info-value">{computerInfo.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Процессор:</span>
                      <span className="info-value">{computerInfo.processor || 'Не указан'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Видеокарта:</span>
                      <span className="info-value">{computerInfo.graphicsCard || 'Не указана'}</span>
                    </div>
                  </>
                )}
                
                <div className="info-item">
                  <span className="info-label">Тариф:</span>
                  <span className="info-value">{actualPlaceRate} ₽/час</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Клуб:</span>
                  <span className="info-value">{clubInfo.address || address}</span>
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

            {/* Промокод */}
            <div className="info-section">
              <h2>Промокод</h2>
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
                  className="btn secondary"
                >
                  Применить
                </button>
              </div>
              {renderPromoCodeInfo()}
            </div>

            {cartItems.length > 0 && (
              <div className="info-section">
                <h2>Заказ из кафе ({cartItems.length} позиций)</h2>
                <div className="cart-items-list">
                  {cartItems.map(item => {
                    const foodInfo = getFoodInfo(item.id);
                    return (
                      <div key={item.id} className="cart-item-confirm">
                        <span className="item-name">{foodInfo.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{foodInfo.price * item.quantity} ₽</span>
                      </div>
                    );
                  })}
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

              <div className="payment-actions">
                {!showPaymentForm ? (
  <button 
    className="btn payment-btn primary"
    onClick={() => setShowPaymentForm(true)}
    disabled={processingPayment}
  >
    Перейти к оплате {finalCost} ₽
  </button>
) : (
  <div className="mock-payment-form">
    <h4>Оплата картой</h4>
    
    {cardError && <div className="payment-error">{cardError}</div>}
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
            className="btn secondary"
            onClick={() => setShowPaymentForm(false)}
          >
            Назад
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={handleMockPayment}
            disabled={processingPayment}
          >
            {processingPayment ? 'Обработка...' : 'Оплатить'}
          </button>
        </div>
      </>
    )}
  </div>
)}
                
                <button 
                  className="btn secondary"
                  onClick={handleSimplePayment}
                  disabled={processingPayment}
                  style={{marginTop: '10px'}}
                >
                  {processingPayment ? 'Создание...' : 'Создать бронь без оплаты (тест)'}
                </button>
                
                <button 
                  className="btn secondary"
                  onClick={handleEditBooking}
                  disabled={processingPayment}
                >
                  Изменить бронь
                </button>
                <button 
                  className="btn secondary"
                  onClick={handleBackToHome}
                  disabled={processingPayment}
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

        {/* Отладочная информация */}
        <div className="debug-info" style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '20px',
          color: 'white',
          fontSize: '12px'
        }}>
          <strong>🔧 Отладочная информация:</strong><br/>
          - Данные из localStorage: {bookingData ? '✅' : '❌'}<br/>
          - Загружено блюд: {foods.length}<br/>
          - Загружено компьютеров: {computers.length}<br/>
          - Загружено клубов: {clubs.length}<br/>
          - Тариф: {tariffData ? '✅' : '❌'}<br/>
          - Инфо о компьютере: {computerInfo ? '✅' : '❌'}<br/>
          - Инфо о клубе: {clubInfo ? '✅' : '❌'}
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;