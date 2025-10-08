import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import PlaceDetails from './PlaceDetails'; // Импортируем компонент с информацией о месте
import '../styles/CombinedLayout.css';
import BookingConfirmation from './BookingConfirmation';

const CombinedLayoutBooking = () => {
  const { 
    cartItems, 
    updateCartItemQuantity, 
    clearCart, 
    getTotalPrice, 
    getTotalItems,
    getCartSummary 
  } = useCart();
  
  const [formData, setFormData] = useState({
    place: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    address: '',
    cart: ''
  });

 const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const [selectedPlaceRate, setSelectedPlaceRate] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeError, setTimeError] = useState('');


  // Часы и минуты для выбора времени
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Генерация дней месяца для календаря
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startDay = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Названия месяцев
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Названия дней недели
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  // Переход к предыдущему месяцу
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Переход к следующему месяцу
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Проверка, является ли дата сегодняшней
  const isToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return checkDate.toDateString() === today.toDateString();
  };

  // Проверка, является ли дата прошедшей
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return checkDate < today;
  };

  // Валидация временного промежутка
  const validateTimeRange = (dateFrom, timeFrom, dateTo, timeTo) => {
    if (!dateFrom || !timeFrom || !dateTo || !timeTo) return true;

    const startDateTime = new Date(`${dateFrom}T${timeFrom}`);
    const endDateTime = new Date(`${dateTo}T${timeTo}`);

    // Проверка что конечное время не раньше начального
    if (endDateTime <= startDateTime) {
      setTimeError('Время окончания должно быть позже времени начала');
      return false;
    }

    // Проверка что бронь не меньше 30 минут
    const diffInMinutes = (endDateTime - startDateTime) / (1000 * 60);
    if (diffInMinutes < 30) {
      setTimeError('Минимальное время бронирования - 30 минут');
      return false;
    }

    // Проверка что бронь не больше 24 часов
    if (diffInMinutes > 24 * 60) {
      setTimeError('Максимальное время бронирования - 24 часа');
      return false;
    }

    setTimeError('');
    return true;
  };

  // Проверка доступности времени при изменении
  useEffect(() => {
    if (formData.dateFrom && formData.timeFrom && formData.dateTo && formData.timeTo) {
      validateTimeRange(formData.dateFrom, formData.timeFrom, formData.dateTo, formData.timeTo);
    } else {
      setTimeError('');
    }
  }, [formData.dateFrom, formData.timeFrom, formData.dateTo, formData.timeTo]);

  // Автоматически обновляем поле корзины при изменении cartItems
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      cart: getCartSummary()
    }));
  }, [cartItems, getCartSummary]);

  // Функция для установки адреса
  const setAddressFromStorage = () => {
    const savedAddress = localStorage.getItem('selectedClubAddress');
    if (savedAddress) {
      setFormData(prev => ({
        ...prev,
        address: savedAddress
      }));
    }
  };

  // Загружаем адрес при монтировании компонента
  useEffect(() => {
    setAddressFromStorage();
  }, []);

  // Слушаем событие выбора адреса
  useEffect(() => {
    const handleAddressSelected = () => {
      setAddressFromStorage();
    };

    window.addEventListener('clubAddressSelected', handleAddressSelected);
    
    return () => {
      window.removeEventListener('clubAddressSelected', handleAddressSelected);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'address') {
      localStorage.removeItem('selectedClubAddress');
    }
  };

  // Обработчик клика по месту - открываем детали
  const handlePlaceClick = (placeNumber) => {
    setSelectedPlace(placeNumber);
    setShowPlaceDetails(true);
  };

  // Обработчик выбора места из деталей
  const handlePlaceSelectFromDetails = (placeNumber, placeRate) => { // ОБНОВИТЕ ЭТУ ФУНКЦИЮ
    setSelectedPlace(placeNumber);
    setSelectedPlaceRate(placeRate); // СОХРАНЯЕМ СТОИМОСТЬ МЕСТА
    setFormData(prev => ({
      ...prev,
      place: placeNumber.toString()
    }));
    setShowPlaceDetails(false);
  };


  // Обработчик возврата из деталей
  const handleBackFromDetails = () => {
    setShowPlaceDetails(false);
  };

  // Обработчик клика по полю даты
  const handleDateFieldClick = (field) => {
    setCurrentField(field);
    setShowDatePicker(true);
    
    // Если уже есть значение, устанавливаем его
    if (field === 'from' && formData.dateFrom) {
      const [year, month, day] = formData.dateFrom.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    } else if (field === 'to' && formData.dateTo) {
      const [year, month, day] = formData.dateTo.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    } else {
      setSelectedDate(new Date());
    }
  };

  // Обработчик клика по полю времени
  const handleTimeFieldClick = (field) => {
    setCurrentField(field);
    setShowTimePicker(true);
    
    const currentTime = field === 'from' ? formData.timeFrom : formData.timeTo;
    if (currentTime && currentTime.includes(':')) {
      const [hour, minute] = currentTime.split(':');
      setSelectedHour(hour);
      setSelectedMinute(minute);
    } else {
      setSelectedHour('12');
      setSelectedMinute('00');
    }
  };

  // Выбор даты в календаре
  const handleDateSelect = (date) => {
    if (isPastDate(date)) return;
    setSelectedDate(date);
  };

  // Подтверждение выбора даты
  const handleDateConfirm = () => {
    if (selectedDate) {
      // Правильное преобразование даты в строку
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      if (currentField === 'from') {
        setFormData(prev => ({
          ...prev,
          dateFrom: dateString
        }));
        
        // Если дата окончания раньше новой даты начала, сбрасываем её
        if (formData.dateTo && new Date(formData.dateTo) < new Date(dateString)) {
          setFormData(prev => ({
            ...prev,
            dateTo: dateString,
            timeTo: ''
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          dateTo: dateString
        }));
        
        // Если дата начала позже новой даты окончания, сбрасываем время окончания
        if (formData.dateFrom && new Date(formData.dateFrom) > new Date(dateString)) {
          setFormData(prev => ({
            ...prev,
            timeTo: ''
          }));
        }
      }
      
      setShowDatePicker(false);
      setCurrentField(null);
    }
  };

  // Подтверждение выбора времени
  const handleTimeConfirm = () => {
    if (selectedHour && selectedMinute) {
      const timeString = `${selectedHour}:${selectedMinute}`;
      
      if (currentField === 'from') {
        setFormData(prev => ({
          ...prev,
          timeFrom: timeString
        }));
        
        // Если время окончания раньше нового времени начала, сбрасываем его
        if (formData.timeTo && formData.dateFrom === formData.dateTo) {
          const newStartTime = new Date(`2000-01-01T${timeString}`);
          const currentEndTime = new Date(`2000-01-01T${formData.timeTo}`);
          if (currentEndTime <= newStartTime) {
            setFormData(prev => ({
              ...prev,
              timeTo: ''
            }));
          }
        }
      } else {
        setFormData(prev => ({
          ...prev,
          timeTo: timeString
        }));
      }
      
      setShowTimePicker(false);
      setCurrentField(null);
    }
  };

  // Отмена выбора даты
  const handleDateCancel = () => {
    setShowDatePicker(false);
    setCurrentField(null);
    setSelectedDate(null);
  };

  // Отмена выбора времени
  const handleTimeCancel = () => {
    setShowTimePicker(false);
    setCurrentField(null);
    setSelectedHour('12');
    setSelectedMinute('00');
  };

  // Форматирование даты для отображения
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    
    // Парсим дату правильно
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

  // Закрытие пикеров при клике вне их
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDatePicker && !e.target.closest('.date-picker')) {
        handleDateCancel();
      }
      if (showTimePicker && !e.target.closest('.time-picker')) {
        handleTimeCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker, showTimePicker]);
   const handleSubmit = (e) => {
  e.preventDefault();
  
  // Финальная проверка перед отправкой
  if (!validateTimeRange(formData.dateFrom, formData.timeFrom, formData.dateTo, formData.timeTo)) {
    return;
  }

  // Получаем информацию о месте для получения стоимости
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
  const placeRate = selectedPlaceRate || placeInfo.rate; // Используем сохраненную стоимость или из данных места

  const bookingData = {
    formData,
    selectedPlace,
    placeRate: placeRate, // Явно передаем стоимость места
    cartItems,
    totalPrice: getTotalPrice()
  };

  console.log('=== SUBMIT DEBUG ===');
  console.log('selectedPlace:', selectedPlace);
  console.log('selectedPlaceRate:', selectedPlaceRate);
  console.log('placeInfo.rate:', placeInfo.rate);
  console.log('final placeRate:', placeRate);
  console.log('=== END SUBMIT DEBUG ===');

  // Сохраняем данные для страницы подтверждения
  localStorage.setItem('lastBooking', JSON.stringify(bookingData));
  
  // Показываем страницу подтверждения
  setShowConfirmation(true);
};


  const handleClearCart = () => {
    clearCart();
  };

  const handleBackToBooking = () => {
    console.log('Returning to booking form');
    setShowConfirmation(false);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  // Проверка доступности кнопки бронирования
  const isBookingDisabled = !selectedPlace || 
    !formData.dateFrom || !formData.timeFrom || 
    !formData.dateTo || !formData.timeTo ||
    !formData.address ||
    timeError;

  console.log('isBookingDisabled:', isBookingDisabled);
  console.log('showConfirmation current value:', showConfirmation);
    
  if (showConfirmation) {
    console.log('Rendering BookingConfirmation component');
    return (
      <BookingConfirmation 
        onBack={handleBackToBooking}
        bookingData={{
          formData,
          selectedPlace,
          cartItems,
          totalPrice: getTotalPrice()
        }}
      />
    );
  }

  console.log('Rendering main booking form');

  return (
    <section id="combined-booking" className="combined-booking-section">
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>
      
      <div className="combined-container">
        {/* Левая часть - схема мест */}
        <div className="layout-side">
          <h2 className="section-title">Выберите место</h2>
          <div className="layout-content-box">
            <div className="layout-scaler">
              <div className="decorative-vectors">
                <img src="/images/30_51.svg" alt="decorative shape" className="decorative-shape shape-1" />
              </div>
              
              {/* Кликабельные места */}
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div 
                  key={`pc-${num}`} 
                  className={`pc-setup setup-${num} ${selectedPlace === num ? 'selected' : ''}`}
                  onClick={() => handlePlaceClick(num)}
                >
                  <img src="/images/6356f02b474a41d638cf709af15fe1f7c6dd92c0.png" alt={`PC setup ${num}`} />
                  <span className="layout-number">{num}</span>
                </div>
              ))}
              
              {[8, 9, 12, 13].map((num) => (
                <div 
                  key={`console-${num}`} 
                  className={`console-setup setup-${num} ${selectedPlace === num ? 'selected' : ''}`}
                  onClick={() => handlePlaceClick(num)}
                >
                  <img src="/images/1b9fb18a794f8543e1b7ff770153e91c8879c831.png" alt={`Console setup ${num}`} />
                  <span className="layout-number">{num}</span>
                </div>
              ))}
              
              {[10, 11, 14].map((num) => (
                <div 
                  key={`headphones-${num}`} 
                  className={`headphones-setup setup-${num} ${selectedPlace === num ? 'selected' : ''}`}
                  onClick={() => handlePlaceClick(num)}
                >
                  <img src="/images/2fc05fccb4c07d9e1bb638c4487609fd22b2f1ec.png" alt={`Headphones ${num}`} />
                  <span className="layout-number">{num}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Правая часть - форма бронирования */}
        <div className="booking-side">
          <h2 className="section-title">Бронь места {selectedPlace || ''}</h2>
          
          {/* Информация о корзине */}
          {getTotalItems() > 0 && (
            <div className="cart-info">
              <h3>Корзина ({getTotalItems()} товаров)</h3>
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <span>{item.name} x{item.quantity}</span>
                    <div className="cart-item-controls">
                      <button 
                        onClick={() => updateCartItemQuantity(item.id, -1)}
                        className="cart-btn"
                      >-</button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateCartItemQuantity(item.id, 1)}
                        className="cart-btn"
                      >+</button>
                      <span className="cart-item-price">{item.price * item.quantity} ₽</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                Итого: {getTotalPrice()} ₽
              </div>
            </div>
          )}

          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="place">Выбранное место</label>
              <input 
                type="text" 
                id="place" 
                name="place"
                value={formData.place}
                onChange={handleChange}
                placeholder="Нажмите на место слева"
                readOnly
                className={selectedPlace ? 'selected-place' : ''}
              />
              {selectedPlace && (
                <div className="place-selected-info">
                  ✓ Место {selectedPlace} выбрано. 
                  <button 
                    type="button" 
                    className="view-details-btn"
                    onClick={() => setShowPlaceDetails(true)}
                  >
                    Посмотреть детали
                  </button>
                </div>
              )}
            </div>

            <div className="datetime-fields">
              <div className="form-group">
                <label>Дата и время начала</label>
                <div className="datetime-inputs-row">
                  <div className="date-input-wrapper">
                    <input 
                      type="text"
                      value={formData.dateFrom ? formatDateDisplay(formData.dateFrom) : 'Выберите дату'}
                      placeholder="Дата начала"
                      readOnly
                      onClick={() => handleDateFieldClick('from')}
                      className="date-input"
                    />
                  </div>
                  <div className="time-input-wrapper">
                    <input 
                      type="text"
                      value={formData.timeFrom || 'Выберите время'}
                      placeholder="Время начала"
                      readOnly
                      onClick={() => handleTimeFieldClick('from')}
                      className="time-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Дата и время окончания</label>
                <div className="datetime-inputs-row">
                  <div className="date-input-wrapper">
                    <input 
                      type="text"
                      value={formData.dateTo ? formatDateDisplay(formData.dateTo) : 'Выберите дату'}
                      placeholder="Дата окончания"
                      readOnly
                      onClick={() => handleDateFieldClick('to')}
                      className="date-input"
                    />
                  </div>
                  <div className="time-input-wrapper">
                    <input 
                      type="text"
                      value={formData.timeTo || 'Выберите время'}
                      placeholder="Время окончания"
                      readOnly
                      onClick={() => handleTimeFieldClick('to')}
                      className="time-input"
                    />
                  </div>
                </div>
              </div>

              {/* Отображение ошибки временного промежутка */}
              {timeError && (
                <div className="time-error-message">
                  ⚠️ {timeError}
                </div>
              )}

              {/* Информация о выбранном промежутке */}
              {formData.dateFrom && formData.timeFrom && formData.dateTo && formData.timeTo && !timeError && (
                <div className="time-range-info">
                  ✅ Выбран промежуток: {formatDateDisplay(formData.dateFrom)} {formData.timeFrom} - {formatDateDisplay(formData.dateTo)} {formData.timeTo}
                </div>
              )}
            </div>
            
            {/* Пicker даты */}
            {showDatePicker && (
              <div className="date-picker-overlay">
                <div className="date-picker">
                  <div className="date-picker-header">
                    <h3>
                      {currentField === 'from' ? 'Выберите дату начала' : 'Выберите дату окончания'}
                    </h3>
                    <button 
                      type="button" 
                      className="date-picker-close"
                      onClick={handleDateCancel}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="date-picker-body">
                    <div className="calendar-section">
                      <div className="calendar-header">
                        <button 
                          type="button" 
                          className="calendar-nav prev"
                          onClick={prevMonth}
                        >
                          ‹
                        </button>
                        <div className="calendar-month">
                          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </div>
                        <button 
                          type="button" 
                          className="calendar-nav next"
                          onClick={nextMonth}
                        >
                          ›
                        </button>
                      </div>
                      
                      <div className="calendar-grid">
                        {/* Дни недели */}
                        {dayNames.map(day => (
                          <div key={day} className="calendar-day-header">
                            {day}
                          </div>
                        ))}
                        
                        {/* Дни месяца */}
                        {calendarDays.map((date, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`calendar-day ${
                              date ? (
                                isPastDate(date) ? 'past' :
                                selectedDate && date.toDateString() === selectedDate.toDateString() ? 'selected' :
                                isToday(date) ? 'today' : ''
                              ) : 'empty'
                            }`}
                            onClick={() => date && handleDateSelect(date)}
                            disabled={!date || isPastDate(date)}
                          >
                            {date ? date.getDate() : ''}
                            {date && isToday(date) && <div className="today-dot"></div>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="date-picker-footer">
                    <div className="selected-date-preview">
                      {selectedDate ? (
                        `Выбрано: ${formatDateDisplay(
                          `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`
                        )}`
                      ) : (
                        'Выберите дату'
                      )}
                    </div>
                    <div className="date-picker-actions">
                      <button 
                        type="button" 
                        className="btn secondary"
                        onClick={handleDateCancel}
                      >
                        Отмена
                      </button>
                      <button 
                        type="button" 
                        className="btn primary"
                        onClick={handleDateConfirm}
                        disabled={!selectedDate}
                      >
                        Выбрать дату
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Пicker времени */}
            {showTimePicker && (
              <div className="time-picker-overlay">
                <div className="time-picker">
                  <div className="time-picker-header">
                    <h3>
                      {currentField === 'from' ? 'Выберите время начала' : 'Выберите время окончания'}
                    </h3>
                    <button 
                      type="button" 
                      className="time-picker-close"
                      onClick={handleTimeCancel}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="time-picker-body">
                    <div className="time-selectors">
                      <div className="time-selector">
                        <label>Часы</label>
                        <select 
                          value={selectedHour}
                          onChange={(e) => setSelectedHour(e.target.value)}
                          className="time-select"
                        >
                          {hours.map(hour => (
                            <option key={hour} value={hour}>{hour}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="time-selector">
                        <label>Минуты</label>
                        <select 
                          value={selectedMinute}
                          onChange={(e) => setSelectedMinute(e.target.value)}
                          className="time-select"
                        >
                          {minutes.map(minute => (
                            <option key={minute} value={minute}>{minute}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="time-picker-footer">
                    <div className="selected-time-preview">
                      {selectedHour && selectedMinute ? (
                        `Выбрано: ${selectedHour}:${selectedMinute}`
                      ) : (
                        'Выберите время'
                      )}
                    </div>
                    <div className="time-picker-actions">
                      <button 
                        type="button" 
                        className="btn secondary"
                        onClick={handleTimeCancel}
                      >
                        Отмена
                      </button>
                      <button 
                        type="button" 
                        className="btn primary"
                        onClick={handleTimeConfirm}
                        disabled={!selectedHour || !selectedMinute}
                      >
                        Выбрать время
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="address">Адрес клуба</label>
              <select 
                id="address" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              >
                <option value="">Выберите клуб</option>
                <option value="ул. Рахова, 53">ул. Рахова, 53</option>
                <option value="ул. Астраханская, 15/8">ул. Астраханская, 15/8</option>
                <option value="ул. Московская, 11">ул. Московская, 11</option>
              </select>
              {formData.address && (
                <div className="auto-address-indicator">
                  ✓ Адрес автоматически выбран из карточки клуба
                </div>
              )}
            </div>
            
            <div className="booking-actions">
              <button 
                type="submit" 
                className="btn primary"
                disabled={isBookingDisabled}
              >
                Забронировать место {selectedPlace || ''}
              </button>
              <button 
          type="button" 
          className="btn secondary"
          onClick={handleBackToHome}
        >
          На главную
        </button>
              <a href="#cafe" className="btn secondary">Добавить из кафе</a>
              {getTotalItems() > 0 && (
                <button 
                  type="button" 
                  className="btn secondary" 
                  onClick={handleClearCart}
                >
                  Очистить корзину
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Модальное окно с деталями места */}
      {showPlaceDetails && selectedPlace && (
        <PlaceDetails 
          place={selectedPlace}
          onBack={handleBackFromDetails}
          onSelect={handlePlaceSelectFromDetails}
        />
      )}
    </section>
  );
};

export default CombinedLayoutBooking;