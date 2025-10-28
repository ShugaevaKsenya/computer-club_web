// src/components/CombinedLayoutBooking.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/Api';
import PlaceDetails from './PlaceDetails';
import '../styles/CombinedLayout.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
const CombinedLayoutBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const { 
    cartItems, 
    updateCartItemQuantity, 
    clearCart, 
    getTotalPrice, 
    getTotalItems,
    getCartSummary,
    addToCart
 
    
  } = useCart();




  const [formData, setFormData] = useState({
    place: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    address: '',
    club_id: '',
    computer_id: '',
    room: ''
  });
  const [rooms, setRooms] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const [selectedPlaceRate, setSelectedPlaceRate] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeError, setTimeError] = useState('');
  const [computers, setComputers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Загрузка данных
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [computersData, positionsData, clubsData, roomsData] = await Promise.all([
        apiService.getComputers(),
        apiService.getComputerPositions(),
        apiService.getClubs(),
        apiService.getRooms()
      ]);

      setComputers(computersData);
      setPositions(positionsData);
      setClubs(clubsData);
      setRooms(roomsData);

      const savedClubId = localStorage.getItem('selectedClubId');
      if (!savedClubId) {
        navigate('/clubs');
        return;
      }
      const previousClubId = localStorage.getItem('cartClubId');
        if (previousClubId && previousClubId !== savedClubId) {
          clearCart(); // очищаем еду из прошлого клуба
        }
        localStorage.setItem('cartClubId', savedClubId);

      const club = clubsData.find(c => c.id == savedClubId);
      if (!club) {
        localStorage.removeItem('selectedClubId');
        navigate('/clubs');
        return;
      }

      setFormData(prev => ({
        ...prev,
        address: club.address,
        club_id: savedClubId
      }));
    } catch (error) {
      console.error('Error loading initial data:', error);
      navigate('/clubs');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPositions = () => {
    const clubId = formData.club_id;
    const roomName = formData.room;
    if (!clubId || !roomName) return [];
    const room = rooms.find(r => r.name === roomName && r.club_id == clubId);
    if (!room) return [];
    return positions.filter(pos => pos.club_id == clubId && pos.room_id == room.id);
  };

  const getPositionInfo = (positionNumber) => {
    const filteredPositions = getFilteredPositions();
    const position = filteredPositions.find(pos => pos.number == positionNumber);
    if (!position) return null;
    const computer = computers.find(comp => comp.position_id == position.id);
    if (!computer) return null;
    const roomObj = rooms.find(r => r.id == position.room_id);
    const roomName = roomObj?.name || 'Неизвестная комната';
    return {
      position,
      computer,
      room: roomName,
      number: position.number,
      computerId: computer.id,
      price: computer.price ? parseFloat(computer.price) : 100
    };
  };

  const getAvailablePositionNumbers = () => {
    const filteredPositions = getFilteredPositions();
    const uniqueNumbers = [...new Set(filteredPositions.map(pos => pos.number))];
    return uniqueNumbers.sort((a, b) => a - b);
  };

  const handlePlaceClick = (positionNumber) => {
    const positionInfo = getPositionInfo(positionNumber);
    if (positionInfo && positionInfo.computer) {
      setSelectedPlace(positionNumber);
      setShowPlaceDetails(true);
    } else {
      alert('Это место временно недоступно для бронирования.');
    }
  };

  const handlePlaceSelectFromDetails = (positionNumber, placeRate) => {
    const positionInfo = getPositionInfo(positionNumber);
    if (positionInfo && positionInfo.computer) {
      const newComputerId = positionInfo.computerId.toString();
      setSelectedPlace(positionNumber);
      setSelectedPlaceRate(placeRate);
      setFormData(prev => ({
        ...prev,
        place: positionNumber.toString(),
        computer_id: newComputerId
      }));
      setShowPlaceDetails(false);
    } else {
      alert('Ошибка: не найден компьютер для этого места.');
    }
  };

  const handleBackFromDetails = () => {
    setShowPlaceDetails(false);
  };

  const isPlaceAvailable = (positionNumber) => {
    const positionInfo = getPositionInfo(positionNumber);
    return positionInfo && positionInfo.computer !== undefined;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const isToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return checkDate.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return checkDate < today;
  };

  const validateTimeRange = (dateFrom, timeFrom, dateTo, timeTo) => {
    if (!dateFrom || !timeFrom || !dateTo || !timeTo) return true;
    const startDateTime = new Date(`${dateFrom}T${timeFrom}`);
    const endDateTime = new Date(`${dateTo}T${timeTo}`);
    if (endDateTime <= startDateTime) {
      setTimeError('Время окончания должно быть позже времени начала');
      return false;
    }
    const diffInMinutes = (endDateTime - startDateTime) / (1000 * 60);
    if (diffInMinutes < 30) {
      setTimeError('Минимальное время бронирования - 30 минут');
      return false;
    }
    if (diffInMinutes > 24 * 60) {
      setTimeError('Максимальное время бронирования - 24 часа');
      return false;
    }
    setTimeError('');
    return true;
  };
  const handleGoToCafe = () => {
    const currentBookingState = {
      formData,
      selectedPlace,
      selectedPlaceRate
    };
    localStorage.setItem('savedBooking', JSON.stringify(currentBookingState));
    navigate(`/cafe/${formData.club_id}`);
  };

  useEffect(() => {
    if (formData.dateFrom && formData.timeFrom && formData.dateTo && formData.timeTo) {
      validateTimeRange(formData.dateFrom, formData.timeFrom, formData.dateTo, formData.timeTo);
    } else {
      setTimeError('');
    }
  }, [formData.dateFrom, formData.timeFrom, formData.dateTo, formData.timeTo]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, cart: getCartSummary() }));
  }, [cartItems, getCartSummary]);

 
  const generateRoomLayout = () => {
    const room = formData.room;
    if (!room) return [];
    if (room === 'Room A') {
      return [1, 2, 3, 4, 5];
    } else if (room === 'Room B') {
      return Array.from({ length: 10 }, (_, i) => i + 1);
    } else if (room === 'Room C') {
      return Array.from({ length: 20 }, (_, i) => i + 1);
    } else {
      return getAvailablePositionNumbers();
    }
  };

  const displayPositions = generateRoomLayout().filter(num =>
    getAvailablePositionNumbers().includes(num)
  );

  const getBookingHours = () => {
    if (!formData.dateFrom || !formData.timeFrom || !formData.dateTo || !formData.timeTo) return 0;
    const startDateTime = new Date(`${formData.dateFrom}T${formData.timeFrom}`);
    const endDateTime = new Date(`${formData.dateTo}T${formData.timeTo}`);
    return Math.round(((endDateTime - startDateTime) / (1000 * 60 * 60)) * 10) / 10;
  };

  const getBookingMinutes = () => {
    if (!formData.dateFrom || !formData.timeFrom || !formData.dateTo || !formData.timeTo) return 0;
    const startDateTime = new Date(`${formData.dateFrom}T${formData.timeFrom}`);
    const endDateTime = new Date(`${formData.dateTo}T${formData.timeTo}`);
    return Math.round((endDateTime - startDateTime) / (1000 * 60));
  };

  const debugBookingStatus = () => {
    console.log('=== DEBUG BOOKING STATUS ===');
    console.log('selectedPlace:', selectedPlace);
    console.log('formData:', formData);
    console.log('timeError:', timeError);
    console.log('============================');
  };

  const getDisabledReason = () => {
    const reasons = [];
    if (!selectedPlace) reasons.push("Не выбрано место");
    if (!formData.dateFrom) reasons.push("Не выбрана дата начала");
    if (!formData.timeFrom) reasons.push("Не выбрано время начала");
    if (!formData.dateTo) reasons.push("Не выбрана дата окончания");
    if (!formData.timeTo) reasons.push("Не выбрано время окончания");
    if (!formData.computer_id) reasons.push("Не установлен computer_id");
    if (timeError) reasons.push(timeError);
    return reasons.join(", ");
  };

  const isBookingDisabled = !selectedPlace || !formData.dateFrom || !formData.timeFrom ||
    !formData.dateTo || !formData.timeTo || !formData.computer_id || timeError;

  useEffect(() => {
    debugBookingStatus();
  }, [selectedPlace, formData, timeError]);


  useEffect(() => {
    const savedBooking = localStorage.getItem('savedBooking');
    if (savedBooking) {
      try {
        const { formData: savedForm, selectedPlace, selectedPlaceRate, cartItems: savedCart } = JSON.parse(savedBooking);
  
        if (savedForm) setFormData(savedForm);
        if (selectedPlace) setSelectedPlace(selectedPlace);
        if (selectedPlaceRate) setSelectedPlaceRate(selectedPlaceRate);
  
        if (savedCart && savedCart.length > 0) {
          clearCart(); // очищаем текущую корзину
          savedCart.forEach(item => addToCart(item)); // добавляем сохранённые элементы
        }
      } catch (err) {
        console.error('Ошибка восстановления savedBooking:', err);
      }
    }
  }, [addToCart, clearCart]);
  

  

  const handleSubmit = async (e) => {
    e.preventDefault();
     // Проверяем авторизацию пользователя
     if (!user) {
      // Сохраняем данные бронирования в localStorage перед редиректом
      const bookingData = {
        formData,
        selectedPlace,
        selectedPlaceRate,
        cartItems: [...cartItems],
        timestamp: Date.now()
      };
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      
      // Редирект на страницу авторизации с возвратом на эту страницу
      navigate('/login', { 
        state: { 
          from: '/booking',
          message: 'Для завершения бронирования необходимо авторизоваться'
        } 
      });
      return;
    }
    
    if (!validateTimeRange(formData.dateFrom, formData.timeFrom, formData.dateTo, formData.timeTo)) return;
    if (!formData.computer_id && selectedPlace) {
      const positionInfo = getPositionInfo(selectedPlace);
      if (positionInfo && positionInfo.computer) {
        const recoveredComputerId = positionInfo.computerId.toString();
        setFormData(prev => ({ ...prev, computer_id: recoveredComputerId }));
        setTimeout(() => proceedWithBooking(recoveredComputerId), 100);
        return;
      } else {
        alert('Ошибка: не удалось определить компьютер для выбранного места.');
        return;
      }
    }
    proceedWithBooking(formData.computer_id);
  };

  const proceedWithBooking = (computerId) => {
    try {
      const bookingMinutes = getBookingMinutes();
      const placeCost = Math.round((bookingMinutes / 60) * selectedPlaceRate);
      const totalCost = placeCost + getTotalPrice();
      const bookingData = {
        id: `temp_${Date.now()}`,
        formData: { ...formData, computer_id: computerId },
        selectedPlace,
        placeRate: selectedPlaceRate,
        cartItems: [...cartItems],
        totalPrice: getTotalPrice(),
        bookingMinutes,
        calculatedData: { placeCost, totalCost, bookingHours: getBookingHours() },
        status: 'draft',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('lastBooking', JSON.stringify(bookingData));
      window.location.href = '/confirmation';
    } catch (error) {
      console.error('Error preparing booking data:', error);
      alert('Ошибка при подготовке данных бронирования.');
    }
  };

  const handleClearCart = () => clearCart();
  const handleBackToHome = () => {
    localStorage.removeItem('bookingStarted');
    localStorage.removeItem('selectedClubId');
    localStorage.removeItem('bookingFormData');
    localStorage.removeItem('savedBooking');
    localStorage.removeItem('cartClubId'); // сбрасываем привязку корзины к клубу
    clearCart(); //  очищаем корзину полностью
    navigate('/');
  };
  const handleBackToClub = () => {
    localStorage.removeItem('bookingStarted');
    localStorage.removeItem('selectedClubId');
    localStorage.removeItem('bookingFormData');
    localStorage.removeItem('savedBooking');
    localStorage.removeItem('cartClubId'); // сбрасываем привязку корзины к клубу
    clearCart(); // очищаем корзину полностью
    navigate('/clubs');
  };

  // ✅ ВСЕ ОБРАБОТЧИКИ — ВНУТРИ КОМПОНЕНТА
  const handleDateFieldClick = (field) => {
    setCurrentField(field);
    setShowDatePicker(true);
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

  const handleDateSelect = (date) => {
    if (isPastDate(date)) return;
    setSelectedDate(date);
  };

  const handleDateConfirm = () => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setFormData(prev => {
        const newFormData = { ...prev, [currentField === 'from' ? 'dateFrom' : 'dateTo']: dateString };
        if (currentField === 'from' && prev.dateTo && new Date(prev.dateTo) < new Date(dateString)) {
          newFormData.dateTo = dateString;
          newFormData.timeTo = '';
        } else if (currentField === 'to' && prev.dateFrom && new Date(prev.dateFrom) > new Date(dateString)) {
          newFormData.timeTo = '';
        }
        return newFormData;
      });
      setShowDatePicker(false);
      setCurrentField(null);
    }
  };

  const handleTimeConfirm = () => {
    if (selectedHour && selectedMinute) {
      const timeString = `${selectedHour}:${selectedMinute}`;
      setFormData(prev => {
        const newFormData = { ...prev, [currentField === 'from' ? 'timeFrom' : 'timeTo']: timeString };
        if (currentField === 'from' && prev.timeTo && prev.dateFrom === prev.dateTo) {
          const newStartTime = new Date(`2000-01-01T${timeString}`);
          const currentEndTime = new Date(`2000-01-01T${prev.timeTo}`);
          if (currentEndTime <= newStartTime) {
            newFormData.timeTo = '';
          }
        }
        return newFormData;
      });
      setShowTimePicker(false);
      setCurrentField(null);
    }
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
    setCurrentField(null);
    setSelectedDate(null);
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
    setCurrentField(null);
    setSelectedHour('12');
    setSelectedMinute('00');
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === tomorrow.toDateString()) return 'Завтра';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
  };

  if (loading) {
    return (
      <div className="admin-loading">

        <div>Загрузка данных...</div>
      </div>
    );
  }
 

  return (
    <section id="combined-booking" className="combined-booking-section">
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>

      <div className="combined-container">
        {/* Левая часть — схема мест */}
        <div className="layout-side">
          <h2 className="section-title">Выберите место</h2>

          {/* Вкладки комнат */}
          <div className="room-tabs">
            {['Room A', 'Room B', 'Room C'].map(roomName => (
              <button
                key={roomName}
                type="button"
                className={`room-tab ${formData.room === roomName ? 'active' : ''}`}
                onClick={() => {
                  const roomExists = rooms.some(r => 
                    r.name === roomName && r.club_id == formData.club_id
                  );
                  if (roomExists) {
                    setFormData(prev => ({ ...prev, room: roomName }));
                    setSelectedPlace(null);
                  } else {
                    alert(`Комната ${roomName} недоступна в этом клубе.`);
                  }
                }}
              >
                {roomName}
              </button>
            ))}
          </div>

          <div className="layout-content-box">
            <div className="layout-scaler">
              {displayPositions.length > 0 ? (
                displayPositions.map((positionNumber) => {
                  const isAvailable = isPlaceAvailable(positionNumber);
                  return (
                    <div
                      key={`position-${positionNumber}`}
                      className={`pc-setup setup-${positionNumber} ${selectedPlace === positionNumber ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                      onClick={() => isAvailable && handlePlaceClick(positionNumber)}
                      style={{ cursor: isAvailable ? 'pointer' : 'not-allowed', opacity: isAvailable ? 1 : 0.5 }}
                    >
                      <img src="/images/6356f02b474a41d638cf709af15fe1f7c6dd92c0.png" alt={`Setup ${positionNumber}`} />
                      <span className="layout-number">
                        {positionNumber}
                        {!isAvailable && <span className="unavailable-badge">✗</span>}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="no-positions-message">
                  {formData.room ? 'Нет доступных мест в этой комнате.' : 'Выберите комнату.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Правая часть — форма бронирования */}
        <div className="booking-side">
          <h2 className="section-title">Бронь места {selectedPlace || ''}</h2>
          <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-group">
              <label>Адрес клуба</label>
              <div className="club-address-display">
                {formData.address}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="place">Выбранное место</label>
              <div className='place-row'>
              <input
                type="text"
                id="place"
                name="place"
                value={formData.place}
                readOnly
                placeholder="Нажмите на место слева"
                className={selectedPlace ? 'selected-place' : ''}
              />
              {selectedPlace && (
                <div className="place-selected-info">
                  <button type="button" className="view-details-btn" onClick={() => setShowPlaceDetails(true)}>
                    Посмотреть детали
                  </button>
                </div>
              )}
              </div>
              {selectedPlace && (
                <div className="place-selected-info">
                  ✓ Место {selectedPlace} выбрано.
                  <br />
                  <small style={{ color: 'blue', fontWeight: 'bold' }}>
                    Computer ID: {formData.computer_id || 'не установлен'}
                    {!formData.computer_id && <span style={{ color: 'red' }}> - ТРЕБУЕТСЯ ВЫБРАТЬ МЕСТО!</span>}
                  </small>
                  
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
                      readOnly
                      onClick={() => handleDateFieldClick('from')}
                      className="date-input"
                    />
                  </div>
                  <div className="time-input-wrapper">
                    <input
                      type="text"
                      value={formData.timeFrom || 'Выберите время'}
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
                      readOnly
                      onClick={() => handleDateFieldClick('to')}
                      className="date-input"
                    />
                  </div>
                  <div className="time-input-wrapper">
                    <input
                      type="text"
                      value={formData.timeTo || 'Выберите время'}
                      readOnly
                      onClick={() => handleTimeFieldClick('to')}
                      className="time-input"
                    />
                  </div>
                </div>
              </div>

              {timeError && <div className="time-error-message">⚠️ {timeError}</div>}
              {formData.dateFrom && formData.timeFrom && formData.dateTo && formData.timeTo && !timeError && (
                <div className="time-range-info">
                  Дата и время выбраны: {formatDateDisplay(formData.dateFrom)} {formData.timeFrom} - {formatDateDisplay(formData.dateTo)} {formData.timeTo}
                </div>
              )}
            </div>

            {/* Пикеры даты и времени */}
            {showDatePicker && (
              <div className="date-picker-overlay">
                <div className="date-picker">
                  <div className="date-picker-header">
                    <h3>{currentField === 'from' ? 'Выберите дату начала' : 'Выберите дату окончания'}</h3>
                    <button type="button" className="date-picker-close" onClick={handleDateCancel}>×</button>
                  </div>
                  <div className="date-picker-body">
                    <div className="calendar-section">
                      <div className="calendar-header">
                        <button type="button" className="calendar-nav prev" onClick={prevMonth}>‹</button>
                        <div className="calendar-month">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</div>
                        <button type="button" className="calendar-nav next" onClick={nextMonth}>›</button>
                      </div>
                      <div className="calendar-grid">
                        {dayNames.map(day => <div key={day} className="calendar-day-header">{day}</div>)}
                        {calendarDays.map((date, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`calendar-day ${date ? (isPastDate(date) ? 'past' : selectedDate && date.toDateString() === selectedDate.toDateString() ? 'selected' : isToday(date) ? 'today' : '') : 'empty'}`}
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
                      {selectedDate ? `Выбрано: ${formatDateDisplay(`${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`)}` : 'Выберите дату'}
                    </div>
                    <div className="date-picker-actions">
                      <button type="button" className="btn secondary" onClick={handleDateCancel}>Отмена</button>
                      <button type="button" className="btn primary" onClick={handleDateConfirm} disabled={!selectedDate}>Выбрать дату</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showTimePicker && (
              <div className="time-picker-overlay">
                <div className="time-picker">
                  <div className="time-picker-header">
                    <h3>{currentField === 'from' ? 'Выберите время начала' : 'Выберите время окончания'}</h3>
                    <button type="button" className="time-picker-close" onClick={handleTimeCancel}>×</button>
                  </div>
                  <div className="time-picker-body">
                    <div className="time-selectors">
                      <div className="time-selector">
                        <label>Часы</label>
                        <select value={selectedHour} onChange={(e) => setSelectedHour(e.target.value)} className="time-select">
                          {hours.map(hour => <option key={hour} value={hour}>{hour}</option>)}
                        </select>
                      </div>
                      <div className="time-selector">
                        <label>Минуты</label>
                        <select value={selectedMinute} onChange={(e) => setSelectedMinute(e.target.value)} className="time-select">
                          {minutes.map(minute => <option key={minute} value={minute}>{minute}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="time-picker-footer">
                    <div className="selected-time-preview">
                      {selectedHour && selectedMinute ? `Выбрано: ${selectedHour}:${selectedMinute}` : 'Выберите время'}
                    </div>
                    <div className="time-picker-actions">
                      <button type="button" className="btn secondary" onClick={handleTimeCancel}>Отмена</button>
                      <button type="button" className="btn primary" onClick={handleTimeConfirm} disabled={!selectedHour || !selectedMinute}>Выбрать время</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            
            {getTotalItems() > 0 && (
            <div className="cart-info">
              <h3>Корзина ({getTotalItems()} товаров)</h3>
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <span>{item.name} x{item.quantity}</span>
                    <div className="cart-item-controls">
                    <button
                      type="button"
                      onClick={() => updateCartItemQuantity(item.id, -1)}
                      className="cart-btn"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartItemQuantity(item.id, 1)}
                      className="cart-btn"
                    >
                      +
                    </button>

                     
                      <span className="cart-item-price">{item.price * item.quantity} ₽</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total">Итого: {getTotalPrice()} ₽</div>
            </div>
          )}


            <div className="booking-actions">
              <button type="submit" className="btn primary" disabled={isBookingDisabled}>
                Перейти к подтверждению
                {isBookingDisabled && (
                  <span style={{ fontSize: '12px', display: 'block', marginTop: '5px', color: 'rgb(36, 214, 160)' }}>
                    ({getDisabledReason()})
                  </span>
                )}
              </button>
             
             
                <button type="button" className="booking-btn cafe-btn-secondary" onClick={handleGoToCafe}>
                  Перейти в кафе
                </button>
              

              <button type="button" className="btn secondary" onClick={handleBackToClub}>
                Выбрать другой клуб
              </button>
              <button type="button" className="btn secondary" onClick={handleBackToHome}>
                Вернуться на главную
              </button>
              {getTotalItems() > 0 && (
                <button type="button" className="btn secondary" onClick={handleClearCart}>Очистить корзину</button>
              )}
            </div>
          </form>
        </div>
      </div>

      {showPlaceDetails && selectedPlace && (
        <PlaceDetails
          place={selectedPlace}
          onBack={handleBackFromDetails}
          onSelect={handlePlaceSelectFromDetails}
          positionInfo={getPositionInfo(selectedPlace)}
        />
      )}
    </section>
  );
};

export default CombinedLayoutBooking;