
// export default BookingConfirmation;
import React, { useState, useEffect } from 'react'; 
import { apiService } from '../services/Api';
import '../styles/BookingConfirmation.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const BookingConfirmation = () => {
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [tariffData, setTariffData] = useState({ coefficient: 1 });
  const [computers, setComputers] = useState([]);
  const [computerSpecs, setComputerSpecs] = useState([]);
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
  
  const { 
    updateCartItemQuantity, 
    clearCart, 
    getTotalPrice, 
    getTotalItems,
    getCartSummary,
    addToCart
  } = useCart();

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
      console.warn('Пользователь не авторизован, редирект на login');
      navigate('/login');
      return;
    }
  
    if (token) {
      apiService.setAuthHeader(`Bearer ${token}`);
      console.log('Auth token set via setAuthHeader:', token);
    }
  }, [isAuthenticated, token, navigate]);
  
  useEffect(() => { 
    if (!isAuthenticated) return;
    
    const loadBookingData = () => {
      try {
        let data = null;
        
        // ВАЖНОЕ ИСПРАВЛЕНИЕ: используем location.state как основной источник
        if (location.state) {
          data = location.state;
          console.log('📋 Booking data loaded from location state:', {
            formData: data.formData,
            hasTariffData: !!data.tariffBreakdown,
            tariffBreakdown: data.tariffBreakdown,
            selectedTariffs: data.selectedTariffs,
            placePriceWithTariff: data.placePriceWithTariff,
            totalPriceWithTariff: data.totalPriceWithTariff,
            cartItems: data.cartItems,
            totalPrice: data.totalPrice
          });
        } else {
          // Резервный вариант из localStorage
          const savedData = localStorage.getItem('savedBooking') || localStorage.getItem('pendingBooking');
          console.log('Loading booking data from localStorage:', savedData);
          
          if (savedData) {
            data = JSON.parse(savedData);
            console.log('Booking data loaded successfully:', {
              formData: data.formData,
              hasTariffData: !!data.tariffBreakdown,
              tariffBreakdown: data.tariffBreakdown
            });
          } else {
            console.warn('No booking data found');
            navigate('/booking');
            return;
          }
        }

        if (data) {
          // ДЕБАГ: Проверяем структуру данных
          console.log('🔍 Debug formData structure:', {
            dateFrom: data.formData?.dateFrom,
            timeFrom: data.formData?.timeFrom,
            dateTo: data.formData?.dateTo,
            date: data.formData?.date,
            fullFormData: data.formData
          });

          // ВАЖНОЕ ИСПРАВЛЕНИЕ: устанавливаем данные напрямую
          setBookingData(data);

          // Сохраняем для резервной копии
          localStorage.setItem('savedBooking', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error loading booking data:', error);
        navigate('/booking');
      } finally {
        setLoading(false);
      }
    };
  
    loadBookingData();
  }, [location.state, isAuthenticated, navigate]);

  useEffect(() => {
    const loadAdditionalData = async () => {
      if (!bookingData) return;
      
      try {
        console.log('Loading additional data from API...');
        
        const [foodsData, computersData, clubsData, specsData] = await Promise.all([
          apiService.getFoods().catch(error => {
            console.error('Error loading foods:', error);
            return [];
          }),
          apiService.getComputers().catch(error => {
            console.error('Error loading computers:', error);
            return [];
          }),
          apiService.getClubs().catch(error => {
            console.error('Error loading clubs:', error);
            return [];
          }),
          apiService.getComputerSpecs().catch(error => {
            console.error('Error loading computer specs:', error);
            return [];
          })
        ]);
        
        console.log('API Data loaded:', {
          foods: foodsData.length,
          computers: computersData.length,
          clubs: clubsData.length,
          specs: specsData.length
        });
        
        setFoods(foodsData);
        setComputers(computersData);
        setClubs(clubsData);
        setComputerSpecs(specsData);
        
        try {
          let tariff;
          try {
            tariff = await apiService.getTariff(1);
          } catch (e) {
            console.log('Trying alternative tariff endpoint...');
            tariff = await apiService.request('/tariffs/1').catch(() => null);
          }
          
          if (tariff) {
            console.log('Tariff data loaded:', tariff);
            setTariffData(tariff);
          } else {
            throw new Error('Tariff not available');
          }
        } catch (tariffError) {
          console.error('Error loading tariff, using fallback:', tariffError);
          setTariffData({ coefficient: 1 });
        }
        
      } catch (error) {
        console.error('Error loading additional data:', error);
      }
    };

    loadAdditionalData();
  }, [bookingData]);

  // Компонент для отображения информации о тарифах
  const TariffInformation = ({ tariffBreakdown, selectedTariffs, placePriceWithTariff, basePlaceRate, bookingHours }) => {
    if (!tariffBreakdown || tariffBreakdown.length === 0) return null;

    return (
      <div className='booking-confirm'>
        <div className="tariff-info-section">
          <div className="card-header">
            <h2>Детализация по тарифам</h2>
          </div>
          
          <div className="tariff-summary">
            <div className="tariff-summary-item">
              <span>Базовая ставка:</span>
              <span>{basePlaceRate} ₽/час</span>
            </div>
            <div className="tariff-summary-item">
              <span>Продолжительность:</span>
              <span>{bookingHours} часов</span>
            </div>
            <div className="tariff-summary-item total">
              <span>Стоимость места с учетом тарифов:</span>
              <span className="highlight">{placePriceWithTariff} ₽</span>
            </div>
          </div>

          {selectedTariffs && selectedTariffs.length > 0 && (
            <div className="applied-tariffs">
              <h4>Примененные тарифы:</h4>
              <div className="tariff-tags">
                {selectedTariffs.map((tariff, index) => (
                  <span key={index} className="tariff-tag">
                    {tariff.name} ({tariff.coefficient}x)
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="tariff-breakdown">
            <h4>Детализация по времени:</h4>
            {tariffBreakdown.map((group, index) => (
              <div key={index} className="tariff-group">
                <div className="group-time">
                  {group.start.toString().padStart(2, '0')}:00 - {group.end.toString().padStart(2, '0')}:00
                </div>
                <div className="group-details">
                  <span className="tariff-name">{group.tariff.name}</span>
                  <span className="tariff-coefficient">({group.tariff.coefficient}x)</span>
                  <span className="group-hours">{group.hours} час</span>
                  <span className="group-price">{Math.round(group.totalPrice)} ₽</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Вспомогательные функции для получения данных с проверками
  const getComputerInfo = (computerId) => {
    if (!computerId || !computers.length || !computerSpecs.length) return null;
    
    const computer = computers.find(c => c.id == computerId);
    if (!computer) {
      console.log(`Computer not found for ID: ${computerId}`);
      return null;
    }

    const specs = computerSpecs.find(s => s.id == computer.spec_id);
    if (!specs) {
      console.log(`Computer specs not found for spec_id: ${computer.spec_id}`);
      return null;
    }

    return {
      id: computer.id,
      name: computer.name || `Компьютер ${computer.id}`,
      price: computer.price,
      processor: specs.processor,
      graphicsCard: specs.gpu,
      ram: specs.ram,
      monitor: specs.monitor,
      headphones: specs.headphones,
      keyboard: specs.keyboard,
      mouse: specs.mouse
    };
  };

  const getClubInfo = (clubId) => {
    if (!clubId || !clubs.length) return { address: 'Не указан', name: 'Неизвестный клуб' };
    
    const club = clubs.find(c => c.id == clubId);
    if (!club) {
      console.log(`Club not found for ID: ${clubId}`);
      return { address: `Клуб #${clubId}`, name: 'Неизвестный клуб' };
    }

    return club;
  };

  const getFoodInfo = (foodId) => {
    if (!foods.length) return { name: `Продукт #${foodId}`, price: 0 };
    
    const food = foods.find(f => f.id == foodId);
    if (!food) {
      console.log(`Food not found for ID: ${foodId}`);
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

  // ВАЖНОЕ ИСПРАВЛЕНИЕ: правильное извлечение данных из bookingData
  const extractBookingData = () => {
    if (!bookingData) return {};
    
    const formData = bookingData.formData || {};
    const cartItems = bookingData.cartItems || [];
    const totalPrice = bookingData.totalPrice || 0;
    
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: используем totalPriceWithTariff из данных бронирования
    const totalPriceWithTariff = bookingData.totalPriceWithTariff || 0;
    const placePriceWithTariff = bookingData.placePriceWithTariff || 0;
    const tariffBreakdown = bookingData.tariffBreakdown || [];
    const selectedTariffs = bookingData.selectedTariffs || [];
    const selectedPlaceRate = bookingData.selectedPlaceRate || 0;
    const calculatedData = bookingData.calculatedData || {};
    
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: правильное извлечение дат и времени
    const dateFrom = formData.dateFrom || formData.date || '';
    const timeFrom = formData.timeFrom || '';
    const dateTo = formData.dateTo || formData.date || '';
    const timeTo = formData.timeTo || '';
    const place = formData.place || '';
    const address = formData.address || '';
    const computer_id = formData.computer_id || '';
    const club_id = formData.club_id || '';
    const room = formData.room || '';

    console.log('📊 Extracted booking data:', {
      dateFrom, timeFrom, dateTo, timeTo,
      totalPriceWithTariff,
      placePriceWithTariff,
      foodTotal: totalPrice,
      cartItemsCount: cartItems.length
    });

    return {
      formData: {
        dateFrom, timeFrom, dateTo, timeTo, place, address, computer_id, club_id, room
      },
      cartItems,
      totalPrice,
      totalPriceWithTariff,
      placePriceWithTariff,
      tariffBreakdown,
      selectedTariffs,
      selectedPlaceRate,
      calculatedData,
      selectedPlace: bookingData.selectedPlace
    };
  };

  const {
    formData = {},
    cartItems = [],
    totalPrice = 0,
    totalPriceWithTariff = 0,
    placePriceWithTariff = 0,
    tariffBreakdown = [],
    selectedTariffs = [],
    selectedPlaceRate = 0,
    calculatedData = {},
    selectedPlace = null
  } = extractBookingData();

  const {
    dateFrom = '',
    timeFrom = '',
    dateTo = '',
    timeTo = '',
    place = '',
    address = '',
    computer_id = '',
    club_id = '',
    room = ''
  } = formData;

  // расчет продолжительности бронирования
  const getBookingHours = () => {
    if (!dateFrom || !timeFrom || !dateTo || !timeTo) {
      console.log(' Missing date/time data:', { dateFrom, timeFrom, dateTo, timeTo });
      return 0;
    }
    
    try {
      const startDateTime = new Date(`${dateFrom}T${timeFrom}`);
      const endDateTime = new Date(`${dateTo}T${timeTo}`);

      // Проверяем валидность дат
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        console.error('Invalid dates');
        return 0;
      }
      
      const timeDiff = endDateTime.getTime() - startDateTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      console.log('Hours calculation:', {
        timeDiff,
        hoursDiff,
        rounded: Math.round(hoursDiff * 10) / 10
      });
      
      return Math.max(0, Math.round(hoursDiff * 10) / 10);
    } catch (error) {
      console.error('Error calculating booking hours:', error);
      return 0;
    }
  };

  // ВАЖНОЕ ИСПРАВЛЕНИЕ: правильный расчет стоимости
  const calculateBaseCost = () => {
    // Если есть totalPriceWithTariff из данных бронирования, используем его
    if (totalPriceWithTariff > 0) {
      console.log('💰 Using totalPriceWithTariff from booking data:', totalPriceWithTariff);
      return totalPriceWithTariff;
    }
    
    // Иначе рассчитываем вручную
    const foodTotal = totalPrice;
    const placeCost = placePriceWithTariff > 0 ? placePriceWithTariff : (calculatedData?.placeCost || Math.round(getBookingHours() * selectedPlaceRate));
    
    const calculatedTotal = placeCost + foodTotal;
    console.log('💰 Calculated total manually:', { placeCost, foodTotal, calculatedTotal });
    
    return calculatedTotal;
  };

  const calculateDiscount = (baseCost) => {
    if (!appliedPromoCode) return { percent: 0, amount: 0 };
    
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

  const bookingHours = React.useMemo(() => getBookingHours(), [dateFrom, timeFrom, dateTo, timeTo]);
  const baseCost = React.useMemo(() => calculateBaseCost(), [totalPriceWithTariff, placePriceWithTariff, totalPrice, selectedPlaceRate, bookingHours]);
  const discount = React.useMemo(() => calculateDiscount(baseCost), [baseCost, appliedPromoCode]);
  const finalCost = React.useMemo(() => calculateFinalCost(), [baseCost, discount]);

  // Используем данные о тарифах если они есть, иначе рассчитываем стандартно
  const placeCost = placePriceWithTariff > 0 ? placePriceWithTariff : (calculatedData?.placeCost || Math.round(bookingHours * selectedPlaceRate));
  const foodTotal = totalPrice;

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
      console.log('Applying promo code:', promoCode);
      
      let promoData;
      try {
        const promoCodes = await apiService.getPromoCodes();
        promoData = promoCodes.find(p => p.code === promoCode);
        console.log('Found promo code in API:', promoData);
      } catch (apiError) {
        console.log('Cannot load promocodes from API, using default');
      }
      
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
          id: Date.now(),
          code: promoCode,
          discount: discountPercent,
          discount_type: 'percent',
          coefficient: coefficient
        };
      }
      
      setAppliedPromoCode(appliedPromo);
      alert(`Промокод "${promoCode}" применен! Скидка: ${appliedPromo.discount}%`);
      
    } catch (error) {
      console.error('Promo code error:', error);
      alert('Ошибка при применении промокода');
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
    localStorage.removeItem('cartClubId');
    clearCart();
    navigate('/');
  };

  const handlePaymentAndBooking = async () => {
    const { number, expiry, cvv } = cardData;
  
    // 1. Проверка карты
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
  
    try {
      // 2. Проверяем успешность оплаты (30% шанс неудачи)
      const isPaymentSuccessful = Math.random() > 0.3;
      
      let payment = null;
      let bookingStatus = 'confirmed';
      
      if (isPaymentSuccessful) {
        // 3. Создаём Payment только при успешной оплате
        const paymentData = {
          user_id: user.id,
          payment_type: 'card',
          status: 'completed',
          price: finalCost,
          payment_date: new Date().toISOString(),
          payment_hash: 'mock_hash_' + Date.now()
        };
  
        payment = await apiService.createPayment(paymentData);
  
        if (!payment || !payment.id) {
          throw new Error('Ошибка создания оплаты');
        }
      } else {
        // Если оплата не прошла, статус бронирования будет pending
        bookingStatus = 'pending';
        console.log('Оплата не прошла (30% шанс), бронирование создается со статусом pending');
      }
  
      // 4. Создаём Booking с соответствующим статусом
      const bookingPayload = {
        computer_id: computer_id,
        user_id: user.id,
        tariff_id: 1,
        club_id: club_id,
        code_id: appliedPromoCode?.id || null,
        start_time: `${dateFrom}T${timeFrom}`,
        end_time: `${dateTo}T${timeTo}`,
        minutes: Math.round(bookingHours * 60),
        price_for_pc: placeCost,
        price_for_additions: foodTotal,
        total_price: finalCost,
        status: bookingStatus,
        payment_id: payment?.id || null
      };
  
      const booking = await apiService.createBooking(bookingPayload);
  
      if (!booking || !booking.id) {
        throw new Error('Ошибка создания бронирования');
      }
  
      // 5. Добавляем еду из корзины в additional_menu
      for (const item of cartItems) {
        await apiService.addFoodToBooking(booking.id, { food_id: item.id, count: item.quantity });
      }
  
      // 6. Очистка
      localStorage.removeItem('savedBooking');
      localStorage.removeItem('lastBooking');
      localStorage.removeItem('bookingStarted');
      clearCart();
  
      // 7. Показываем соответствующий alert
      if (isPaymentSuccessful) {
        alert(`Бронирование успешно подтверждено и оплачено!\nНомер брони: ${booking.id}\nСтатус: ${bookingStatus}`);
        setPaymentSuccess(true);
      } else {
        alert(`Бронирование создано, но оплата не прошла!\nНомер брони: ${booking.id}\nСтатус: ${bookingStatus}\n\nПожалуйста, оплатите бронирование в личном кабинете.`);
      }
  
      // // 8. Перенаправление через небольшой таймаут, чтобы пользователь увидел сообщение
      // setTimeout(() => {
      //   navigate('/');
      // }, 3000);
  
    } catch (error) {
      console.error('Ошибка при создании бронирования или оплаты:', error);
      alert(`Ошибка при создании бронирования: ${error.message || error}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Убираем секунды из времени 
  const formatTimeDisplay = (timeString) => {
    if (!timeString) return '';
    try {
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        weekday: 'short'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Функция для определения банка по номеру карты
  const detectBank = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    const binRanges = {
      'sberbank': ['4276', '4279', '4364', '5469', '2202', '5336', '6763'],
      'tinkoff': ['5213', '4377', '5536', '5189', '2200'],
      'vtb': ['4189', '4190', '4272', '4627', '2200 14'],
      'alfa': ['4584', '4154', '4779', '5486', '2200 20'],
      'gazprom': ['5211', '5486', '6775', '2200 06'],
      'raiffeisen': ['4627', '5100', '5304', '2200 20']
    };

    for (const [bank, bins] of Object.entries(binRanges)) {
      if (bins.some(bin => cleanNumber.startsWith(bin))) {
        return bank;
      }
    }
    
    return 'unknown';
  };

  const getBankName = (bankCode) => {
    const bankNames = {
      'sberbank': 'Сбербанк',
      'tinkoff': 'Тинькофф', 
      'vtb': 'ВТБ',
      'alfa': 'Альфа-Банк',
      'gazprom': 'Газпромбанк',
      'raiffeisen': 'Райффайзен',
      'unknown': 'Банк не определен'
    };
    return bankNames[bankCode] || 'Неизвестный банк';
  };

  const handleCardNumberChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    const detectedBank = detectBank(v);
    
    setCardData(prev => ({ 
      ...prev, 
      number: v,
      bank: detectedBank
    }));
    setCardError('');
  };

  const renderPromoCodeInfo = () => {
    if (!appliedPromoCode) return null;

    return (
      <div className="promo-code-applied">
        <span className="promo-success"> Применен промокод: {appliedPromoCode.code}</span>
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
            <h2>Данные бронирования не найдены</h2>
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
          <h1>Подтверждение бронирования</h1>
          <p className="confirmation-subtitle">Проверьте данные перед оплатой</p>
        </div>

        <div className="confirmation-content">
          <div className="main-content">
            <div className="booking-info-card">
              <div className="card-header">
                <h2>Информация о брони</h2>
                <div className="booking-badge">Место №{place}</div>
              </div>
              
              <div className="info-grid">
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Тип места:</span>
                    <span className="info-value highlight">{placeInfo.type}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Базовая ставка:</span>
                    <span className="info-value">{selectedPlaceRate} ₽/час</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Клуб:</span>
                    <span className="info-value">{clubInfo.address || address}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Комната:</span>
                    <span className="info-value">{room}</span>
                  </div>
                </div>

                {/* <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Продолжительность:</span>
                    <span className="info-value highlight">{bookingHours > 0 ? `${bookingHours} часов` : 'Не указано'}</span>
                  </div>
                </div> */}

                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Начало:</span>
                    <span className="info-value">
                      {formatDateDisplay(dateFrom)} <strong>{formatTimeDisplay(timeFrom)}</strong>
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Окончание:</span>
                    <span className="info-value">
                      {formatDateDisplay(dateTo)} <strong>{formatTimeDisplay(timeTo)}</strong>
                    </span>
                  </div>
                </div>

                {computerInfo && (
                  <div className="computer-specs">
                    <h3>Характеристики компьютера</h3>
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
                      <div className="spec-item">
                        <span className="spec-label">Монитор:</span>
                        <span className="spec-value">{computerInfo.monitor || 'Не указан'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Наушники:</span>
                        <span className="spec-value">{computerInfo.headphones || 'Не указаны'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Клавиатура:</span>
                        <span className="spec-value">{computerInfo.keyboard || 'Не указана'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Мышь:</span>
                        <span className="spec-value">{computerInfo.mouse || 'Не указана'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Секция с информацией о тарифах */}
            <TariffInformation 
              tariffBreakdown={tariffBreakdown}
              selectedTariffs={selectedTariffs}
              placePriceWithTariff={placePriceWithTariff}
              basePlaceRate={selectedPlaceRate}
              bookingHours={bookingHours}
            />

            <div className="promo-section">
              <div className="card-header">
                <h2>Промокод</h2>
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
                  <h2>Заказ из кафе</h2>
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
                <h3>Стоимость бронирования</h3>
              </div>
              
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span>
                    {tariffBreakdown.length > 0 ? 'Аренда места (с учетом тарифов):' : `Аренда места (${bookingHours} часов × ${selectedPlaceRate} ₽/час):`}
                  </span>
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
                  >Перейти к оплате {finalCost} ₽</button>
                ) : (
                  <div className="mock-payment-form">
                    <div className="payment-header">
                      <h4>Оплата картой</h4>
                    </div>
                    
                    {cardError && <div className="payment-error"> {cardError}</div>}
                    
                    {paymentSuccess && (
                      <div className="payment-success">
                        Оплата прошла успешно! Бронирование подтверждено.
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
                            onChange={handleCardNumberChange}
                            maxLength={19}
                            className="card-input"
                          />
                          {cardData.number.replace(/\s/g, '').length >= 6 && (
                            <div className="bank-detection">
                              <div className={`bank-icon ${cardData.bank}`}></div>
                              <div className="bank-info">
                                <span className="bank-name">{getBankName(cardData.bank)}</span>
                                <span className="bank-status">Банк определен автоматически</span>
                              </div>
                            </div>
                          )}
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

                        <div className="payment-actions-row">
                          <button
                            type="button"
                            className="confirmation-btn primary"
                            onClick={handlePaymentAndBooking}
                            disabled={processingPayment}
                          >
                            {processingPayment ? 'Обработка...' : ' Оплатить'}
                          </button>
                          <button
                            type="button"
                            className="confirmation-btn secondary"
                            onClick={() => setShowPaymentForm(false)}
                          >Назад</button>
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
                  >Изменить бронь</button>
                  <button 
                    className="confirmation-btn outline"
                    onClick={handleBackToHome}
                    disabled={processingPayment}
                  >На главную</button>
                </div>
              </div>

              <div className="payment-security">
                <div className="security-info">
                  <span>Безопасная оплата через CloudPayments</span>
                </div>
                <p className="security-note">
                  После оплаты вы получите подтверждение бронирования на email
                </p>
              </div>
            </div>

            <div className="support-card">
              <div className="support-info">
                <h4>Нужна помощь?</h4>
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