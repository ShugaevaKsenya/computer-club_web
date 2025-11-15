

// // src/components/CombinedLayoutBooking.js 
// import React, { useState, useEffect, useCallback } from 'react';
// import { useCart } from '../context/CartContext';
// import { apiService } from '../services/Api';
// import PlaceDetails from './PlaceDetails';
// import '../styles/CombinedLayout.css';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext'; 

// const CombinedLayoutBooking = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [tariffs, setTariffs] = useState([]);
//   const { 
//     cartItems, 
//     updateCartItemQuantity, 
//     clearCart, 
//     getTotalPrice, 
//     getTotalItems,
//     getCartSummary,
//     addToCart
//   } = useCart();

//   const [formData, setFormData] = useState({
//     place: '',
//     date: '',
//     timeFrom: '',
//     timeTo: '',
//     address: '',
//     club_id: '',
//     computer_id: '',
//     room: ''
//   });
//   const [rooms, setRooms] = useState([]);
//   const [selectedPlace, setSelectedPlace] = useState(null);
//   const [showPlaceDetails, setShowPlaceDetails] = useState(false);
//   const [selectedPlaceRate, setSelectedPlaceRate] = useState(0);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [timeError, setTimeError] = useState('');
//   const [computers, setComputers] = useState([]);
//   const [positions, setPositions] = useState([]);
//   const [clubs, setClubs] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // Обновленные состояния для занятых слотов
//   const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
//   const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);

//   // Состояния для тарифов
//   const [selectedTariffs, setSelectedTariffs] = useState([]);
//   const [placePriceWithTariff, setPlacePriceWithTariff] = useState(0);
//   const [totalPriceWithTariff, setTotalPriceWithTariff] = useState(0);
//   const [tariffBreakdown, setTariffBreakdown] = useState([]);

//   const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

//   // ==================== ЭФФЕКТЫ ====================
  
//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   useEffect(() => {
//     if (formData.timeFrom && formData.timeTo) {
//       validateTimeRange(formData.timeFrom, formData.timeTo);
//     } else {
//       setTimeError('');
//     }
//   }, [formData.timeFrom, formData.timeTo]);

//   useEffect(() => {
//     const newSummary = getCartSummary();
//     setFormData(prev => {
//       if (prev.cart !== newSummary) {
//         return { ...prev, cart: newSummary };
//       }
//       return prev;
//     });
//   }, [cartItems, getCartSummary]);

//   useEffect(() => {
//     const savedBooking = localStorage.getItem('savedBooking');
//     if (savedBooking) {
//       try {
//         const { formData: savedForm, selectedPlace, selectedPlaceRate, cartItems: savedCart } = JSON.parse(savedBooking);
  
//         if (savedForm) setFormData(savedForm);
//         if (selectedPlace) setSelectedPlace(selectedPlace);
//         if (selectedPlaceRate) setSelectedPlaceRate(selectedPlaceRate);
  
//         if (savedCart && savedCart.length > 0) {
//           clearCart();
//           savedCart.forEach(item => addToCart(item));
//         }
//       } catch (err) {
//         console.error('Ошибка восстановления savedBooking:', err);
//       }
//     }
//   }, [addToCart, clearCart]);

//   // Эффект для расчета тарифа при изменении времени
//   useEffect(() => {
//     if (formData.timeFrom && formData.timeTo && selectedPlaceRate && tariffs.length > 0) {
//       calculateTariffAndPrice();
//     }
//   }, [formData.timeFrom, formData.timeTo, selectedPlaceRate, tariffs]);

//   // Эффект для пересчета общей цены при изменении цены места или корзины
//   useEffect(() => {
//     calculateTotalPrice();
//   }, [placePriceWithTariff, cartItems]);

//   // ==================== ФУНКЦИИ ДЛЯ ТАРИФОВ ====================

//   // Функция для определения тарифа по часу
//   const getTariffByHour = (hour) => {
//     // Дневной тариф: 10:00 - 16:59
//     if (hour >= 8 && hour < 17) {
//       return tariffs.find(t => t.name === 'Дневной') || tariffs[0];
//     }
//     // Вечерний тариф: 17:00 - 23:59
//     else if (hour >= 17 && hour < 24) {
//       return tariffs.find(t => t.name === 'Вечерний') || tariffs[1];
//     }
//     // Ночной тариф: 00:00 - 07:59
//     else {
//       return tariffs.find(t => t.name === 'Ночной') || tariffs[2];
//     }
//   };

//   // Функция для группировки часов по тарифным зонам
//   const groupHoursByTariff = (startHour, endHour) => {
//     const groups = [];
//     let currentTariff = null;
//     let currentStart = startHour;
//     let hoursCount = 0;

//     for (let hour = startHour; hour < endHour; hour++) {
//       const tariff = getTariffByHour(hour);
      
//       if (currentTariff === null) {
//         // Начало новой группы
//         currentTariff = tariff;
//         currentStart = hour;
//         hoursCount = 1;
//       } else if (tariff.id === currentTariff.id) {
//         // Продолжение текущей группы
//         hoursCount++;
//       } else {
//         // Завершение текущей группы и начало новой
//         groups.push({
//           start: currentStart,
//           end: hour,
//           hours: hoursCount,
//           tariff: currentTariff,
//           totalPrice: hoursCount * selectedPlaceRate * parseFloat(currentTariff.coefficient)
//         });
        
//         currentTariff = tariff;
//         currentStart = hour;
//         hoursCount = 1;
//       }
//     }

//     // Добавляем последнюю группу
//     if (currentTariff !== null && hoursCount > 0) {
//       groups.push({
//         start: currentStart,
//         end: endHour,
//         hours: hoursCount,
//         tariff: currentTariff,
//         totalPrice: hoursCount * selectedPlaceRate * parseFloat(currentTariff.coefficient)
//       });
//     }

//     return groups;
//   };

//   // Функция для расчета стоимости с учетом пересечения тарифов
//   const calculateTariffAndPrice = () => {
//     if (!formData.timeFrom || !formData.timeTo || !selectedPlaceRate) return;

//     const startHour = parseInt(formData.timeFrom.split(':')[0]);
//     const endHour = parseInt(formData.timeTo.split(':')[0]);
//     const totalHours = endHour - startHour;

//     // Группируем часы по тарифным зонам
//     const tariffGroups = groupHoursByTariff(startHour, endHour);
    
//     // Собираем информацию по группам
//     let totalPrice = 0;
//     const usedTariffs = new Set();

//     tariffGroups.forEach(group => {
//       totalPrice += group.totalPrice;
//       usedTariffs.add(group.tariff);
//     });

//     setTariffBreakdown(tariffGroups);
//     setSelectedTariffs(Array.from(usedTariffs));
//     setPlacePriceWithTariff(Math.round(totalPrice));
//   };

//   // Функция для расчета общей цены
//   const calculateTotalPrice = () => {
//     const cartTotal = getTotalPrice();
//     const total = placePriceWithTariff + cartTotal;
//     setTotalPriceWithTariff(total);
//   };

//   // Функция для форматирования времени в группе
//   const formatGroupTime = (start, end) => {
//     return `${start.toString().padStart(2, '0')}:00-${end.toString().padStart(2, '0')}:00`;
//   };

//   // Функция для получения информации о тарифах в текстовом виде
//   const getTariffSummary = () => {
//     if (selectedTariffs.length === 0) return '';
    
//     if (selectedTariffs.length === 1) {
//       return selectedTariffs[0].name;
//     } else {
//       return selectedTariffs.map(t => t.name).join(' + ');
//     }
//   };

//   // ==================== ЗАГРУЗКА ДАННЫХ ====================

//   const loadInitialData = async () => {
//     try {
//       setLoading(true);
//       const [computersData, positionsData, clubsData, roomsData, tariffsData] = await Promise.all([
//         apiService.getComputers(),
//         apiService.getComputerPositions(),
//         apiService.getClubs(),
//         apiService.getRooms(),
//         apiService.getTariffs().catch(() => [])
//       ]);

//       setComputers(computersData);
//       setPositions(positionsData);
//       setClubs(clubsData);
//       setRooms(roomsData);
      
//       // Если тарифы не загрузились, используем значения по умолчанию
//       if (tariffsData.length === 0) {
//         setTariffs([
//           { id: 1, name: 'Дневной', coefficient: 1.00 },
//           { id: 2, name: 'Вечерний', coefficient: 1.20 },
//           { id: 3, name: 'Ночной', coefficient: 0.80 }
//         ]);
//       } else {
//         setTariffs(tariffsData);
//       }

//       const savedClubId = localStorage.getItem('selectedClubId');
//       if (!savedClubId) {
//         navigate('/clubs');
//         return;
//       }
//       const previousClubId = localStorage.getItem('cartClubId');
//         if (previousClubId && previousClubId !== savedClubId) {
//           clearCart();
//         }
//         localStorage.setItem('cartClubId', savedClubId);

//       const club = clubsData.find(c => c.id == savedClubId);
//       if (!club) {
//         localStorage.removeItem('selectedClubId');
//         navigate('/clubs');
//         return;
//       }

//       setFormData(prev => ({
//         ...prev,
//         address: club.address,
//         club_id: savedClubId
//       }));
//     } catch (error) {
//       console.error('Error loading initial data:', error);
//       navigate('/clubs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Упрощенная функция для загрузки бронирований на выбранную дату
//   const loadBookingsForSelectedDate = async (computerId, date) => {
//     if (!computerId || !date) return;

//     try {
//       setLoadingTimeSlots(true);
//       const dateStr = date.toISOString().split('T')[0];
//       const bookings = await apiService.getBookingsByComputerAndDate(computerId, dateStr);
      
//       const slots = bookings
//         .filter(booking => booking.status === 'confirmed')
//         .map(booking => ({
//           start: new Date(booking.start_time),
//           end: new Date(booking.end_time),
//           id: booking.id
//         }));
      
//       setBookedTimeSlots(slots);
//     } catch (error) {
//       console.error('Ошибка при загрузке бронирований:', error);
//       setBookedTimeSlots([]);
//     } finally {
//       setLoadingTimeSlots(false);
//     }
//   };

//   // ==================== РАБОТА С МЕСТАМИ И ПОЗИЦИЯМИ ====================

//   const getFilteredPositions = () => {
//     const clubId = formData.club_id;
//     const roomName = formData.room;
//     if (!clubId || !roomName) return [];
//     const room = rooms.find(r => r.name === roomName && r.club_id == clubId);
//     if (!room) return [];
//     return positions.filter(pos => pos.club_id == clubId && pos.room_id == room.id);
//   };
  
//   const getPositionInfo = (positionNumber) => {
//     const filteredPositions = getFilteredPositions();
//     const position = filteredPositions.find(pos => pos.number == positionNumber);
//     if (!position) return null;
//     const computer = computers.find(comp => comp.position_id == position.id);
//     if (!computer) return null;
//     const roomObj = rooms.find(r => r.id == position.room_id);
//     const roomName = roomObj?.name || 'Неизвестная комната';
//     return {
//       position,
//       computer,
//       room: roomName,
//       number: position.number,
//       computerId: computer.id,
//       price: computer.price ? parseFloat(computer.price) : 100
//     };
//   };

//   const getAvailablePositionNumbers = () => {
//     const filteredPositions = getFilteredPositions();
//     const uniqueNumbers = [...new Set(filteredPositions.map(pos => pos.number))];
//     return uniqueNumbers.sort((a, b) => a - b);
//   };

//   const handlePlaceClick = (positionNumber) => {
//     const positionInfo = getPositionInfo(positionNumber);
//     if (positionInfo && positionInfo.computer) {
//       setSelectedPlace(positionNumber);
//       setShowPlaceDetails(true);
//     } else {
//       alert('Это место временно недоступно для бронирования.');
//     }
//   };

//   const handlePlaceSelectFromDetails = (positionNumber, placeRate) => {
//     const positionInfo = getPositionInfo(positionNumber);
//     if (positionInfo && positionInfo.computer) {
//       const newComputerId = positionInfo.computerId.toString();
//       setSelectedPlace(positionNumber);
//       setSelectedPlaceRate(placeRate);
//       setFormData(prev => ({
//         ...prev,
//         place: positionNumber.toString(),
//         computer_id: newComputerId,
//         // ⬇️ Очистка выбранной даты и времени при смене места
//         date: '',
//         timeFrom: '',
//         timeTo: ''
//       }));
      
//       // Сброс тарифов и цен при смене места
//       setSelectedTariffs([]);
//       setPlacePriceWithTariff(0);
//       setTotalPriceWithTariff(0);
//       setTariffBreakdown([]);
      
//       // Сбрасываем занятые слоты при смене места
//       setBookedTimeSlots([]);
      
//       setShowPlaceDetails(false);
//     } else {
//       alert('Ошибка: не найден компьютер для этого места.');
//     }
//   };

//   const handleBackFromDetails = () => {
//     setShowPlaceDetails(false);
//   };

//   const isPlaceAvailable = (positionNumber) => {
//     const positionInfo = getPositionInfo(positionNumber);
//     return positionInfo && positionInfo.computer !== undefined;
//   };

//   const generateRoomLayout = () => {
//     const room = formData.room;
//     if (!room) return [];
//     if (room === 'Room A') {
//       return [1, 2, 3, 4, 5];
//     } else if (room === 'Room B') {
//       return Array.from({ length: 10 }, (_, i) => i + 1);
//     } else if (room === 'Room C') {
//       return Array.from({ length: 20 }, (_, i) => i + 1);
//     } else {
//       return getAvailablePositionNumbers();
//     }
//   };

//   // ==================== РАБОТА С ДАТАМИ И ВРЕМЕНЕМ ====================

//   // Функция для проверки доступности временного слота
//   const checkTimeSlotAvailability = async (computerId, date, timeFrom, timeTo) => {
//     if (!computerId || !date) return false;
    
//     try {
//       const dateStr = date.toISOString().split('T')[0];
//       const bookings = await apiService.getBookingsByComputerAndDate(computerId, dateStr);
      
//       const selectedStart = new Date(`${dateStr}T${timeFrom}`);
//       const selectedEnd = new Date(`${dateStr}T${timeTo}`);
      
//       // Проверяем пересечения с существующими бронированиями
//       const hasConflict = bookings.some(booking => {
//         if (booking.status !== 'confirmed') return false;
        
//         const bookingStart = new Date(booking.start_time);
//         const bookingEnd = new Date(booking.end_time);
        
//         return (
//           selectedStart < bookingEnd && 
//           selectedEnd > bookingStart
//         );
//       });
      
//       return !hasConflict;
//     } catch (error) {
//       console.error('Error checking time slot availability:', error);
//       return false;
//     }
//   };

//   const generateCalendarDays = () => {
//     const year = currentMonth.getFullYear();
//     const month = currentMonth.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const daysInMonth = lastDay.getDate();
//     const startDay = firstDay.getDay();
//     const days = [];
//     for (let i = 0; i < startDay; i++) days.push(null);
//     for (let day = 1; day <= daysInMonth; day++) {
//       days.push(new Date(year, month, day));
//     }
//     return days;
//   };

//   const calendarDays = generateCalendarDays();
//   const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
//   const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

//   const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
//   const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

//   const isToday = (date) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
//     return checkDate.toDateString() === today.toDateString();
//   };

//   const isPastDate = (date) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
//     return checkDate < today;
//   };

//   const validateTimeRange = (timeFrom, timeTo) => {
//     if (!timeFrom || !timeTo) return true;
    
//     const fromHour = parseInt(timeFrom.split(':')[0]);
//     const toHour = parseInt(timeTo.split(':')[0]);
    
//     if (toHour <= fromHour) {
//       setTimeError('Время окончания должно быть позже времени начала');
//       return false;
//     }
    
//     if ((toHour - fromHour) < 1) {
//       setTimeError('Минимальное время бронирования - 1 час');
//       return false;
//     }
    
//     if ((toHour - fromHour) > 24) {
//       setTimeError('Максимальное время бронирования - 24 часа');
//       return false;
//     }
    
//     setTimeError('');
//     return true;
//   };

//   const formatDateDisplay = (dateString) => {
//     if (!dateString) return '';
//     const [year, month, day] = dateString.split('-').map(Number);
//     const date = new Date(year, month - 1, day);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     if (date.toDateString() === today.toDateString()) return 'Сегодня';
//     if (date.toDateString() === tomorrow.toDateString()) return 'Завтра';
//     return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
//   };

//   // ==================== ОБРАБОТЧИКИ ВЫБОРА ДАТЫ И ВРЕМЕНИ ====================

//   const handleDateSelectClick = () => {
//     if (!formData.computer_id) {
//       alert('Сначала выберите место');
//       return;
//     }
//     setShowDatePicker(true);
//   };

//   const handleTimeSelectClick = () => {
//     if (!formData.date) {
//       alert('Сначала выберите дату');
//       return;
//     }
    
//     // Загружаем занятые слоты для выбранной даты
//     loadBookingsForSelectedDate(formData.computer_id, new Date(formData.date));
//     setShowTimePicker(true);
//   };

//   const handleDateSelect = (date) => {
//     if (isPastDate(date)) return;
//     setSelectedDate(date);
//   };

//   const handleDateConfirm = () => {
//     if (selectedDate) {
//       const year = selectedDate.getFullYear();
//       const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
//       const day = selectedDate.getDate().toString().padStart(2, '0');
//       const dateString = `${year}-${month}-${day}`;
      
//       setFormData(prev => ({
//         ...prev,
//         date: dateString,
//         timeFrom: '',
//         timeTo: ''
//       }));
      
//       // Сброс тарифа при смене даты
//       setSelectedTariffs([]);
//       setPlacePriceWithTariff(0);
//       setTariffBreakdown([]);
      
//       // Сбрасываем занятые слоты при смене даты
//       setBookedTimeSlots([]);
      
//       setShowDatePicker(false);
//       setSelectedDate(null);
//     }
//   };

//   const handleTimeSelect = async (startHour, endHour) => {
//     const timeFrom = `${startHour}:00`;
//     const timeTo = `${endHour}:00`;
    
//     // Проверяем доступность времени
//     const isAvailable = await checkTimeSlotAvailability(
//       formData.computer_id,
//       new Date(formData.date),
//       timeFrom,
//       timeTo
//     );
    
//     if (!isAvailable) {
//       alert('Выбранное время недоступно для бронирования. Пожалуйста, выберите другое время.');
//       return;
//     }
    
//     setFormData(prev => ({
//       ...prev,
//       timeFrom,
//       timeTo
//     }));
//     setShowTimePicker(false);
//   };

//   const handleDateCancel = () => {
//     setShowDatePicker(false);
//     setSelectedDate(null);
//   };

//   const handleTimeCancel = () => {
//     setShowTimePicker(false);
//   };

//   // ==================== РАБОТА С БРОНИРОВАНИЕМ И КОРЗИНОЙ ====================

//   const getBookingHours = () => {
//     if (!formData.timeFrom || !formData.timeTo) return 0;
//     const fromHour = parseInt(formData.timeFrom.split(':')[0]);
//     const toHour = parseInt(formData.timeTo.split(':')[0]);
//     return toHour - fromHour;
//   };

//   const getBookingMinutes = () => {
//     return getBookingHours() * 60;
//   };

//   const getDisabledReason = () => {
//     const reasons = [];
//     if (!selectedPlace) reasons.push("Не выбрано место");
//     if (!formData.date) reasons.push("Не выбрана дата");
//     if (!formData.timeFrom) reasons.push("Не выбрано время начала");
//     if (!formData.timeTo) reasons.push("Не выбрано время окончания");
//     if (!formData.computer_id) reasons.push("Не установлен computer_id");
//     if (timeError) reasons.push(timeError);
//     return reasons.join(", ");
//   };

//   const isBookingDisabled = !selectedPlace || !formData.date || !formData.timeFrom ||
//     !formData.timeTo || !formData.computer_id || timeError;

//   const getProductWord = (count) => {
//     const lastDigit = count % 10;
//     const lastTwoDigits = count % 100;
    
//     if (lastDigit === 1 && lastTwoDigits !== 11) {
//       return 'товар';
//     } else if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
//       return 'товара';
//     } else {
//       return 'товаров';
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Проверяем авторизацию пользователя
//     if (!user) {
//       const bookingData = {
//         // Те же самые данные что и в proceedWithBooking
//         formData: { ...formData },
//         selectedPlace,
//         selectedPlaceRate,
//         tariffBreakdown,
//         selectedTariffs,
//         placePriceWithTariff,
//         totalPriceWithTariff,
//         cartItems: [...cartItems],
//         totalPrice: getTotalPrice(),
//         bookingMinutes: getBookingMinutes(),
//         calculatedData: { 
//           placeCost: placePriceWithTariff, 
//           totalCost: totalPriceWithTariff, 
//           bookingHours: getBookingHours() 
//         },
//         timestamp: Date.now()
//       };
      
//       localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      
//       navigate('/login', { 
//         state: { 
//           from: '/booking',
//           message: 'Для завершения бронирования необходимо авторизоваться'
//         } 
//       });
//       return;
//     }
    
//     if (!validateTimeRange(formData.timeFrom, formData.timeTo)) return;
    
//     // Финальная проверка доступности времени
//     const isAvailable = await checkTimeSlotAvailability(
//       formData.computer_id,
//       new Date(formData.date),
//       formData.timeFrom,
//       formData.timeTo
//     );
    
//     if (!isAvailable) {
//       alert('К сожалению, выбранное время стало недоступно. Пожалуйста, выберите другое время.');
//       return;
//     }
    
//     if (!formData.computer_id && selectedPlace) {
//       const positionInfo = getPositionInfo(selectedPlace);
//       if (positionInfo && positionInfo.computer) {
//         const recoveredComputerId = positionInfo.computerId.toString();
//         setFormData(prev => ({ ...prev, computer_id: recoveredComputerId }));
//         setTimeout(() => proceedWithBooking(recoveredComputerId), 100);
//         return;
//       } else {
//         alert('Ошибка: не удалось определить компьютер для выбранного места.');
//         return;
//       }
//     }
//     proceedWithBooking(formData.computer_id);
//   };

//   const proceedWithBooking = (computerId) => {
//     try {
//       const bookingMinutes = getBookingMinutes();
//       const totalCost = totalPriceWithTariff;
      
//       // Собираем полные данные для подтверждения
//       const bookingData = {
//         // Основные данные бронирования
//         id: `temp_${Date.now()}`,
//         formData: { 
//           ...formData, 
//           computer_id: computerId,
//           // Добавляем явно все поля формы для надежности
//           place: formData.place,
//           date: formData.date,
//           timeFrom: formData.timeFrom,
//           timeTo: formData.timeTo,
//           dateFrom: formData.date,
//           dateTo: formData.date,
//           address: formData.address,
//           club_id: formData.club_id,
//           room: formData.room
//         },
        
//         // Информация о месте
//         selectedPlace,
//         selectedPlaceRate,
        
//         // Полная информация о тарифах
//         tariffBreakdown, // детализация по часам/группам
//         selectedTariffs, // примененные тарифы
//         placePriceWithTariff, // стоимость места с учетом тарифов
//         totalPriceWithTariff, // общая стоимость (место + корзина)
        
//         // Информация о корзине
//         cartItems: [...cartItems],
//         totalPrice: getTotalPrice(),
        
//         // Расчетные данные
//         bookingMinutes,
//         calculatedData: { 
//           placeCost: placePriceWithTariff, 
//           totalCost, 
//           bookingHours: getBookingHours() 
//         },
        
//         // Дополнительная информация
//         status: 'draft',
//         created_at: new Date().toISOString(),
        
//         // Для отладки - информация о пользователе
//         userInfo: {
//           userId: user?.id,
//           userName: user?.name
//         }
//       };
      
//       console.log('📦 Sending complete booking data to confirmation:', {
//         hasTariffData: tariffBreakdown.length > 0,
//         tariffGroups: tariffBreakdown.length,
//         selectedTariffs: selectedTariffs.map(t => t.name),
//         placePrice: placePriceWithTariff,
//         totalPrice: totalPriceWithTariff,
//         bookingHours: getBookingHours(),
//         cartItems: cartItems.length
//       });
      
//       // Передаем на страницу подтверждения
//       navigate('/confirmation', { state: bookingData });
      
//     } catch (error) {
//       console.error('Error preparing booking data:', error);
//       alert('Ошибка при подготовке данных бронирования.');
//     }
//   };

//   // ==================== ОБРАБОТЧИКИ НАВИГАЦИИ ====================

//   const handleGoToCafe = () => {
//     const currentBookingState = {
//       formData,
//       selectedPlace,
//       selectedPlaceRate,
//       selectedTariffs,
//       tariffBreakdown,
//       placePriceWithTariff,
//       totalPriceWithTariff
//     };
//     localStorage.setItem('savedBooking', JSON.stringify(currentBookingState));
//     navigate(`/cafe/${formData.club_id}`);
//   };

//   const handleClearCart = () => clearCart();
  
//   const handleBackToHome = () => {
//     localStorage.removeItem('bookingStarted');
//     localStorage.removeItem('selectedClubId');
//     localStorage.removeItem('bookingFormData');
//     localStorage.removeItem('savedBooking');
//     localStorage.removeItem('cartClubId');
//     clearCart();
//     navigate('/');
//   };
  
//   const handleBackToClub = () => {
//     localStorage.removeItem('bookingStarted');
//     localStorage.removeItem('selectedClubId');
//     localStorage.removeItem('bookingFormData');
//     localStorage.removeItem('savedBooking');
//     localStorage.removeItem('cartClubId');
//     clearCart();
//     navigate('/clubs');
//   };

//   // ==================== КОМПОНЕНТ TIME PICKER ====================

//   const TimePicker = ({
//     selectedDate,
//     bookedTimeSlots,
//     onTimeSelect,
//     onClose,
//     loading,
//     tariffs
//   }) => {
//     const [selectedStartHour, setSelectedStartHour] = useState(null);
//     const [selectedEndHour, setSelectedEndHour] = useState(null);
  
//     // Функция для определения тарифа по часу
//     const getTariffByHour = (hour) => {
//       if (!tariffs || tariffs.length === 0) return null;
      
//       // Дневной тариф: 10:00 - 17:59
//       if (hour >= 8 && hour < 17) {
//         return tariffs.find(t => t.name === 'Дневной') || tariffs[0];
//       }
//       // Вечерний тариф: 18:00 - 23:59
//       else if (hour >= 17 && hour < 24) {
//         return tariffs.find(t => t.name === 'Вечерний') || tariffs[1];
//       }
//       // Ночной тариф: 00:00 - 09:59
//       else {
//         return tariffs.find(t => t.name === 'Ночной') || tariffs[2];
//       }
//     };
  
//     // Функция для получения цвета тарифа
//     const getTariffColor = (tariff) => {
//       if (!tariff) return 'rgba(255, 255, 255, 0.1)';
      
//       switch(tariff.name) {
//         case 'Дневной':
//           return 'rgba(108, 117, 125, 0.3)'; // серый
//         case 'Вечерний':
//           return 'rgba(53, 178, 220, 0.34)'; // малиновый
//         case 'Ночной':
//           return 'rgba(13, 110, 253, 0.3)'; // синий
//         default:
//           return 'rgba(255, 255, 255, 0.1)';
//       }
//     };

//     // Функция для получения цвета текста тарифа
//     const getTariffTextColor = (tariff) => {
//       if (!tariff) return 'rgba(255, 255, 255, 0.7)';
      
//       switch(tariff.name) {
//         case 'Дневной':
//           return '#6c757d'; // серый
//         case 'Вечерний':
//           return 'rgba(53, 178, 220, 0.86)'; // малиновый
//         case 'Ночной':
//           return '#0d6efd'; // синий
//         default:
//           return 'rgba(255, 255, 255, 0.7)';
//       }
//     };
  
//     const getSlotType = (hour) => {
//       if (!selectedDate || !bookedTimeSlots || bookedTimeSlots.length === 0) return 'free';
    
//       const hourStart = new Date(selectedDate);
//       hourStart.setHours(parseInt(hour, 10), 0, 0, 0);
//       const hourEnd = new Date(hourStart);
//       hourEnd.setHours(hourStart.getHours() + 1);
    
//       for (const slot of bookedTimeSlots) {
//         const slotStart = new Date(slot.start);
//         const slotEnd = new Date(slot.end);
    
//         const startHour = slotStart.getHours();
//         const endHour = slotEnd.getHours();
    
//         // если этот час — начало брони
//         if (parseInt(hour, 10) === startHour) return 'booked-start';
    
//         // если этот час равен концу брони
//         if (parseInt(hour, 10) === endHour) return 'booked-end';
    
//         // если этот час находится строго между началом и концом брони
//         if (parseInt(hour, 10) > startHour && parseInt(hour, 10) < endHour) {
//           return 'booked-middle';
//         }
//       }
    
//       return 'free';
//     };
  
//     const canSelectTimeRange = (startHour, endHour) => {
//       if (!selectedDate) return false;
    
//       const startTime = new Date(selectedDate);
//       startTime.setHours(parseInt(startHour, 10), 0, 0, 0);
    
//       const endTime = new Date(selectedDate);
//       endTime.setHours(parseInt(endHour, 10), 0, 0, 0);
    
//       return !bookedTimeSlots.some(slot => {
//         const slotStart = new Date(slot.start);
//         const slotEnd = new Date(slot.end);
//         return (startTime < slotEnd && endTime > slotStart);
//       });
//     };
  
//     const handleHourClick = (hour) => {
//       // Если повторно нажали на уже выбранное время — сбрасываем выделение
//       if (hour === selectedStartHour || hour === selectedEndHour) {
//         setSelectedStartHour(null);
//         setSelectedEndHour(null);
//         return;
//       }
  
//       if (selectedStartHour === null) {
//         setSelectedStartHour(hour);
//         setSelectedEndHour(null);
//         return;
//       }
   
//       if (selectedEndHour === null) {
//         if (parseInt(hour, 10) <= parseInt(selectedStartHour, 10)) {
//           alert('Время окончания должно быть позже времени начала');
//           return;
//         }
  
//         if (!canSelectTimeRange(selectedStartHour, hour)) {
//           alert('Выбранный промежуток времени пересекается с существующими бронированиями');
//           return;
//         }
  
//         setSelectedEndHour(hour);
//         return;
//       }
  
//       setSelectedStartHour(hour);
//       setSelectedEndHour(null);
//     };
  
//     const handleConfirm = () => {
//       if (selectedStartHour !== null && selectedEndHour !== null) {
//         const start = `${selectedStartHour.padStart(2, '0')}`;
//         const end = `${selectedEndHour.padStart(2, '0')}`;
//         onTimeSelect(start, end);
//       }
//     };
  
//     const formatTimeDisplay = (hour) => `${hour}`;
  
//     if (loading) {
//       return (
//         <div className="time-picker-overlay">
//           <div className="time-picker">
//             <div className="time-picker-header"><h3>Загрузка доступного времени...</h3></div>
//             <div className="loading-time-slots"><div>Пожалуйста, подождите</div></div>
//           </div>
//         </div>
//       );
//     }
  
//     return (
//       <div className="time-picker-overlay">
//         <div className="time-picker">
//           <div className="time-picker-header">
//             <h3>
//               Выберите время
//               <br />
//               <small>{selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
//             </h3>
//             <button type="button" className="time-picker-close" onClick={onClose}>×</button>
//           </div>
  
//           <div className="time-picker-body">
//             <div className="selected-date-info"><strong>Выбранная дата:</strong> {selectedDate.toLocaleDateString('ru-RU')}</div>
  
//             {/* Легенда тарифов */}
//             {tariffs && tariffs.length > 0 && (
//               <div className="tariff-legend">
//                 <div className="tariff-legend-title">Тарифы по времени:</div>
//                 <div className="tariff-legend-items">
//                   {tariffs.map(tariff => (
//                     <div key={tariff.id} className="tariff-legend-item">
//                       <div 
//                         className="tariff-legend-color" 
//                         style={{ backgroundColor: getTariffColor(tariff) }}
//                       ></div>
//                       <span className="tariff-legend-name">{tariff.name}</span>
//                       <span className="tariff-legend-coefficient">({tariff.coefficient}x)</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
  
//             <div className="time-slots-grid">
//               {hours.map(hour => {
//                 const slotType = getSlotType(hour);
//                 const isSelected = hour === selectedStartHour || hour === selectedEndHour;
//                 const isInRange = selectedStartHour && selectedEndHour &&
//                   parseInt(hour, 10) > parseInt(selectedStartHour, 10) &&
//                   parseInt(hour, 10) < parseInt(selectedEndHour, 10);
                
//                 const tariff = getTariffByHour(parseInt(hour));
//                 const tariffStyle = {
//                   backgroundColor: getTariffColor(tariff),
//                   borderColor: getTariffTextColor(tariff)
//                 };
  
//                 return (
//                   <button
//                     key={hour}
//                     type="button"
//                     className={`time-slot ${slotType} ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''}`}
//                     onClick={() => handleHourClick(hour)}
//                     style={slotType === 'free' ? tariffStyle : {}}
//                   >
//                     <span className="time-slot-hour">{formatTimeDisplay(hour)}</span>
//                     <span className="time-slot-status">
//                       {slotType === 'free' && tariff && (
//                         <span 
//                           className="tariff-indicator"
//                           style={{ color: getTariffTextColor(tariff) }}
//                         >
//                           {tariff.coefficient}x
//                         </span>
//                       )}
//                       {slotType === 'free' && !tariff && 'Свободно'}
//                       {slotType === 'booked-start' && 'Начало брони'}
//                       {slotType === 'booked-middle' && 'Занято'}
//                       {slotType === 'booked-end' && 'Конец брони'}
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
  
//             {selectedStartHour && selectedEndHour && (
//               <div className="selected-time-range">
//                 <strong>Выбранное время:</strong> {formatTimeDisplay(selectedStartHour)} - {formatTimeDisplay(selectedEndHour)}
//                 <br />
//                 <small>Продолжительность: {parseInt(selectedEndHour, 10) - parseInt(selectedStartHour, 10)} часов</small>
//               </div>
//             )}
  
//             <div className="booked-intervals-list">
//               <strong>Уже забронировано:</strong>
//               <ul>
//                 {bookedTimeSlots.length === 0 && <li>Нет броней на эту дату</li>}
//                 {bookedTimeSlots.map(slot => {
//                   const s = new Date(slot.start);
//                   const e = new Date(slot.end);
//                   const format = (d) => d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
//                   return <li key={slot.id || `${s.toISOString()}_${e.toISOString()}`}>{format(s)} — {format(e)}</li>;
//                 })}
//               </ul>
//               <small>Границы броней можно выбирать, если это не создает пересечений</small>
//             </div>
  
//             <div className="time-picker-legend">
//               <div className="legend-item"><div className="legend-color free"></div><span>Свободно</span></div>
//               <div className="legend-item"><div className="legend-color booked-start"></div><span>Начало брони</span></div>
//               <div className="legend-item"><div className="legend-color booked-middle"></div><span>Занято</span></div>
//               <div className="legend-item"><div className="legend-color booked-end"></div><span>Конец брони</span></div>
//               <div className="legend-item"><div className="legend-color selected"></div><span>Выбрано</span></div>
//               <div className="legend-item"><div className="legend-color in-range"></div><span>В диапазоне</span></div>
//             </div>
//           </div>
  
//           <div className="time-picker-footer">
//             <button type="button" className="booking-btn secondary" onClick={onClose}>Отмена</button>
//             <button
//               type="button"
//               className="booking-btn primary"
//               onClick={handleConfirm}
//               disabled={selectedStartHour === null || selectedEndHour === null}
//             >
//               Выбрать время
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };
 
//   // ==================== РЕНДЕРИНГ ====================

//   if (loading) {
//     return (
//       <div className="admin-loading">
//         <div>Загрузка данных...</div>
//       </div>
//     );
//   }

//   const displayPositions = generateRoomLayout().filter(num =>
//     getAvailablePositionNumbers().includes(num)
//   );

//   return (
//     <section id="combined-booking" className="combined-booking-section">
//       <div className="background-container">
//         <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
//         <div className="bg-overlay"></div>
//       </div>

//       <div className="combined-container">
//         {/* Левая часть — схема мест */}
//         <div className="layout-side">
//           <h2 className="section-title">Выберите место</h2>

//           {/* Вкладки комнат */}
//           <div className="room-tabs">
//             {['Room A', 'Room B', 'Room C'].map(roomName => (
//               <button
//                 key={roomName}
//                 type="button"
//                 className={`room-tab ${formData.room === roomName ? 'active' : ''}`}
//                 onClick={() => {
//                   const roomExists = rooms.some(r => 
//                     r.name === roomName && r.club_id == formData.club_id
//                   );
//                   if (roomExists) {
//                     setFormData(prev => ({ ...prev, room: roomName }));
//                     setSelectedPlace(null);
//                   } else {
//                     alert(`Комната ${roomName} недоступна в этом клубе.`);
//                   }
//                 }}
//               >
//                 {roomName}
//               </button>
//             ))}
//           </div>

//           <div className="layout-content-box">
//             <div className="layout-scaler">
//               {displayPositions.length > 0 ? (
//                 displayPositions.map((positionNumber) => {
//                   const isAvailable = isPlaceAvailable(positionNumber);
//                   return (
//                     <div
//                       key={`position-${positionNumber}`}
//                       className={`pc-setup setup-${positionNumber} ${selectedPlace === positionNumber ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
//                       onClick={() => isAvailable && handlePlaceClick(positionNumber)}
//                       style={{ cursor: isAvailable ? 'pointer' : 'not-allowed', opacity: isAvailable ? 1 : 0.5 }}
//                     >
//                       <img src="/images/6356f02b474a41d638cf709af15fe1f7c6dd92c0.png" alt={`Setup ${positionNumber}`} />
//                       <span className="layout-number">
//                         {positionNumber}
//                         {!isAvailable && <span className="unavailable-badge">✗</span>}
//                       </span>
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className="no-positions-message">
//                   {formData.room ? 'Нет доступных мест в этой комнате.' : 'Выберите комнату.'}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Правая часть — форма бронирования */}
//         <div className="booking-side">
//           <h2 className="section-title">Бронь места {selectedPlace || ''}</h2>
//           <form className="booking-form" onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label>Адрес клуба</label>
//               <div className="club-address-display">
//                 {formData.address}
//               </div>
//             </div>
//             <div className="form-group">
//               <label htmlFor="place">Выбранное место</label>
//               <div className='place-row'>
//                 <input
//                   type="text"
//                   id="place"
//                   name="place"
//                   value={formData.place}
//                   readOnly
//                   placeholder="Нажмите на место слева"
//                   className={selectedPlace ? 'selected-place' : ''}
//                 />
//                 {selectedPlace && (
//                   <div className="place-selected-info">
//                     <button type="button" className="view-details-btn" onClick={() => setShowPlaceDetails(true)}>
//                       Посмотреть детали
//                     </button>
//                   </div>
//                 )}
//               </div>
//               {selectedPlace && (
//                 <div className="place-selected-info">
//                   ✓ Место {selectedPlace} выбрано.
//                   <br />
//                 </div>
//               )}
//             </div>
//             <div></div>
//             {/* Кнопка выбора даты */}
//             {selectedPlace && (
//               <div className="form-group">
//                 <label>Дата бронирования</label>
//                 <div className="date-selection">
//                   <button 
//                     type="button" 
//                     className="booking-btn primary"
//                     onClick={handleDateSelectClick}
//                   >
//                     {formData.date ? `Изменить дату (${formatDateDisplay(formData.date)})` : 'Выбрать дату'}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Кнопка выбора времени */}
//             {formData.date && (
//               <div className="form-group">
//                 <label>Время бронирования</label>
//                 <div className="time-selection">
//                   <button 
//                     type="button" 
//                     className="booking-btn primary"
//                     onClick={handleTimeSelectClick}
//                   >
//                     {formData.timeFrom && formData.timeTo 
//                       ? `Изменить время (${formData.timeFrom} - ${formData.timeTo})` 
//                       : 'Выбрать время'}
//                   </button>
//                 </div>
//                 {formData.timeFrom && formData.timeTo && (
//                   <div className="time-range-info">
//                     Выбрано время: {formData.timeFrom} - {formData.timeTo}
//                     <br />
//                     <small>Продолжительность: {getBookingHours()} часов</small>
//                   </div>
//                 )}
//               </div>
//             )}
            
//             {getTotalItems() > 0 && (
//               <div className="cart-info">
//                 <h3>Корзина ({getTotalItems()} {getProductWord(getTotalItems())})</h3>
//                 <div className="cart-items">
//                   {cartItems.map(item => (
//                     <div key={item.id} className="cart-item">
//                       <span>{item.name} x{item.quantity}</span>
//                       <div className="cart-item-controls">
//                         <button
//                           type="button"
//                           onClick={() => updateCartItemQuantity(item.id, -1)}
//                           className="cart-btn"
//                         >
//                           -
//                         </button>
//                         <span>{item.quantity}</span>
//                         <button
//                           type="button"
//                           onClick={() => updateCartItemQuantity(item.id, 1)}
//                           className="cart-btn"
//                         >
//                           +
//                         </button>
//                         <span className="cart-item-price">{item.price * item.quantity} ₽</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="cart-total">Итого: {getTotalPrice()} ₽</div>
//               </div>
//             )}

//             {/* Информация о тарифе и ценах */}
//             {selectedTariffs.length > 0 && formData.timeFrom && formData.timeTo && (
//               <div className="tariff-info-section">
//                 <h3>Информация о бронировании</h3>
//                 <div className="tariff-details">
//                   <div className="tariff-item">
//                     <span>Тариф:</span>
//                     <span className="tariff-name">{getTariffSummary()}</span>
//                   </div>
//                   <div className="tariff-item">
//                     <span>Продолжительность:</span>
//                     <span>{getBookingHours()} часов</span>
//                   </div>
//                   <div className="tariff-item">
//                     <span>Базовая цена за место:</span>
//                     <span>{selectedPlaceRate} ₽/час</span>
//                   </div>
                  
//                   {/* Детализация по тарифным группам */}
//                   {tariffBreakdown.length > 0 && (
//                     <div className="tariff-group-breakdown">
//                       <div className="breakdown-header">Детализация по тарифным зонам:</div>
//                       {tariffBreakdown.map((group, index) => (
//                         <div key={index} className="breakdown-group">
//                           <div className="group-time">{formatGroupTime(group.start, group.end)}</div>
//                           <div className="group-details">
//                             <span className="group-tariff">
//                               {group.tariff.name} ({group.tariff.coefficient}x)
//                             </span>
//                             <span className="group-hours">{group.hours} час</span>
//                             <span className="group-price">{Math.round(group.totalPrice)} ₽</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
                  
//                   <div className="tariff-item">
//                     <span>Стоимость места:</span>
//                     <span className="place-price">{placePriceWithTariff} ₽</span>
//                   </div>
//                   {getTotalItems() > 0 && (
//                     <div className="tariff-item">
//                       <span>Товары из кафе:</span>
//                       <span>{getTotalPrice()} ₽</span>
//                     </div>
//                   )}
//                   <div className="tariff-item total-price">
//                     <span><strong>Общая стоимость:</strong></span>
//                     <span><strong>{totalPriceWithTariff} ₽</strong></span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {timeError && <div className="time-error-message">⚠️ {timeError}</div>}

//             {/* Пикер даты */}
//             {showDatePicker && (
//               <div className="date-picker-overlay">
//                 <div className="date-picker">
//                   <div className="date-picker-header">
//                     <h3>Выберите дату бронирования</h3>
//                     <button type="button" className="date-picker-close" onClick={handleDateCancel}>×</button>
//                   </div>
//                   <div className="date-picker-body">
//                     <div className="calendar-section">
//                       <div className="calendar-header">
//                         <button type="button" className="calendar-nav prev" onClick={prevMonth}>‹</button>
//                         <div className="calendar-month">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</div>
//                         <button type="button" className="calendar-nav next" onClick={nextMonth}>›</button>
//                       </div>
//                       <div className="calendar-grid">
//                         {dayNames.map(day => <div key={day} className="calendar-day-header">{day}</div>)}
//                         {calendarDays.map((date, index) => {
//                           return (
//                             <button
//                               key={index}
//                               type="button"
//                               className={`calendar-day ${date ? (
//                                 isPastDate(date) ? 'past' : 
//                                 selectedDate && date.toDateString() === selectedDate.toDateString() ? 'selected' : 
//                                 isToday(date) ? 'today' : ''
//                               ) : 'empty'}`}
//                               onClick={() => date && handleDateSelect(date)}
//                               disabled={!date || isPastDate(date)}
//                             >
//                               {date ? date.getDate() : ''}
//                               {date && isToday(date) && <div className="today-dot"></div>}
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="date-picker-footer">
//                     <div className="selected-date-preview">
//                       {selectedDate ? `Выбрано: ${formatDateDisplay(`${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`)}` : 'Выберите дату'}
//                     </div>
//                     <div className="date-picker-actions">
//                       <button type="button" className="booking-btn secondary" onClick={handleDateCancel}>Отмена</button>
//                       <button type="button" className="booking-btn primary date" onClick={handleDateConfirm} disabled={!selectedDate}>Выбрать дату</button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Пикер времени */}
//             {showTimePicker && (
//               <TimePicker
//                 selectedDate={new Date(formData.date)}
//                 bookedTimeSlots={bookedTimeSlots}
//                 onTimeSelect={handleTimeSelect}
//                 onClose={handleTimeCancel}
//                 loading={loadingTimeSlots}
//                 tariffs={tariffs} 
//               />
//             )}

//             <div className="booking-actions">
//               <button type="submit" className="booking-btn primary" disabled={isBookingDisabled}>
//                 Перейти к подтверждению
//                 {isBookingDisabled && (
//                   <span style={{ fontSize: '12px', display: 'block', marginTop: '5px', color: 'rgb(36, 214, 160)' }}>
//                     ({getDisabledReason()})
//                   </span>
//                 )}
//               </button>
             
//               <button type="button" className="booking-btn secondary" onClick={handleGoToCafe}>
//                 Перейти в кафе
//               </button>

//               <button type="button" className="booking-btn secondary" onClick={handleBackToClub}>
//                 Выбрать другой клуб
//               </button>
//               <button type="button" className="booking-btn secondary" onClick={handleBackToHome}>
//                 Вернуться на главную
//               </button>
//               {getTotalItems() > 0 && (
//                 <button type="button" className="booking-btn secondary" onClick={handleClearCart}>Очистить корзину</button>
//               )}
//             </div>
//           </form>
//         </div>
//       </div>

//       {showPlaceDetails && selectedPlace && (
//         <PlaceDetails
//           place={selectedPlace}
//           onBack={handleBackFromDetails}
//           onSelect={handlePlaceSelectFromDetails}
//           positionInfo={getPositionInfo(selectedPlace)}
//         />
//       )}
//     </section>
//   );
// };

// export default CombinedLayoutBooking;
// src/components/CombinedLayoutBooking.js 
import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/Api';
import PlaceDetails from './PlaceDetails';
import '../styles/CombinedLayout.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const CombinedLayoutBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tariffs, setTariffs] = useState([]);
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
    date: '',
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeError, setTimeError] = useState('');
  const [computers, setComputers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Обновленные состояния для занятых слотов
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Состояния для тарифов
  const [selectedTariffs, setSelectedTariffs] = useState([]);
  const [placePriceWithTariff, setPlacePriceWithTariff] = useState(0);
  const [totalPriceWithTariff, setTotalPriceWithTariff] = useState(0);
  const [tariffBreakdown, setTariffBreakdown] = useState([]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  // ==================== ЭФФЕКТЫ ====================
  
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.timeFrom && formData.timeTo) {
      validateTimeRange(formData.timeFrom, formData.timeTo);
    } else {
      setTimeError('');
    }
  }, [formData.timeFrom, formData.timeTo]);

  useEffect(() => {
    const newSummary = getCartSummary();
    setFormData(prev => {
      if (prev.cart !== newSummary) {
        return { ...prev, cart: newSummary };
      }
      return prev;
    });
  }, [cartItems, getCartSummary]);

  useEffect(() => {
    const savedBooking = localStorage.getItem('savedBooking');
    if (savedBooking) {
      try {
        const { formData: savedForm, selectedPlace, selectedPlaceRate, cartItems: savedCart } = JSON.parse(savedBooking);
  
        if (savedForm) setFormData(savedForm);
        if (selectedPlace) setSelectedPlace(selectedPlace);
        if (selectedPlaceRate) setSelectedPlaceRate(selectedPlaceRate);
  
        if (savedCart && savedCart.length > 0) {
          clearCart();
          savedCart.forEach(item => addToCart(item));
        }
      } catch (err) {
        console.error('Ошибка восстановления savedBooking:', err);
      }
    }
  }, [addToCart, clearCart]);

  // Эффект для расчета тарифа при изменении времени
  useEffect(() => {
    if (formData.timeFrom && formData.timeTo && selectedPlaceRate && tariffs.length > 0) {
      calculateTariffAndPrice();
    }
  }, [formData.timeFrom, formData.timeTo, selectedPlaceRate, tariffs]);

  // Эффект для пересчета общей цены при изменении цены места или корзины
  useEffect(() => {
    calculateTotalPrice();
  }, [placePriceWithTariff, cartItems]);

  // ==================== ФУНКЦИИ ДЛЯ ТАРИФОВ ====================

  // Функция для определения тарифа по часу
  const getTariffByHour = (hour) => {
    // Дневной тариф: 10:00 - 16:59
    if (hour >= 8 && hour < 17) {
      return tariffs.find(t => t.name === 'Дневной') || tariffs[0];
    }
    // Вечерний тариф: 17:00 - 23:59
    else if (hour >= 17 && hour < 24) {
      return tariffs.find(t => t.name === 'Вечерний') || tariffs[1];
    }
    // Ночной тариф: 00:00 - 07:59
    else {
      return tariffs.find(t => t.name === 'Ночной') || tariffs[2];
    }
  };

  // Функция для группировки часов по тарифным зонам
  const groupHoursByTariff = (startHour, endHour) => {
    const groups = [];
    let currentTariff = null;
    let currentStart = startHour;
    let hoursCount = 0;

    for (let hour = startHour; hour < endHour; hour++) {
      const tariff = getTariffByHour(hour);
      
      if (currentTariff === null) {
        // Начало новой группы
        currentTariff = tariff;
        currentStart = hour;
        hoursCount = 1;
      } else if (tariff.id === currentTariff.id) {
        // Продолжение текущей группы
        hoursCount++;
      } else {
        // Завершение текущей группы и начало новой
        groups.push({
          start: currentStart,
          end: hour,
          hours: hoursCount,
          tariff: currentTariff,
          totalPrice: hoursCount * selectedPlaceRate * parseFloat(currentTariff.coefficient)
        });
        
        currentTariff = tariff;
        currentStart = hour;
        hoursCount = 1;
      }
    }

    // Добавляем последнюю группу
    if (currentTariff !== null && hoursCount > 0) {
      groups.push({
        start: currentStart,
        end: endHour,
        hours: hoursCount,
        tariff: currentTariff,
        totalPrice: hoursCount * selectedPlaceRate * parseFloat(currentTariff.coefficient)
      });
    }

    return groups;
  };

  // Функция для расчета стоимости с учетом пересечения тарифов
  const calculateTariffAndPrice = () => {
    if (!formData.timeFrom || !formData.timeTo || !selectedPlaceRate) return;

    const startHour = parseInt(formData.timeFrom.split(':')[0]);
    const endHour = parseInt(formData.timeTo.split(':')[0]);
    const totalHours = endHour - startHour;

    // Группируем часы по тарифным зонам
    const tariffGroups = groupHoursByTariff(startHour, endHour);
    
    // Собираем информацию по группам
    let totalPrice = 0;
    const usedTariffs = new Set();

    tariffGroups.forEach(group => {
      totalPrice += group.totalPrice;
      usedTariffs.add(group.tariff);
    });

    setTariffBreakdown(tariffGroups);
    setSelectedTariffs(Array.from(usedTariffs));
    setPlacePriceWithTariff(Math.round(totalPrice));
  };

  // Функция для расчета общей цены
  const calculateTotalPrice = () => {
    const cartTotal = getTotalPrice();
    const total = placePriceWithTariff + cartTotal;
    setTotalPriceWithTariff(total);
  };

  // Функция для форматирования времени в группе
  const formatGroupTime = (start, end) => {
    return `${start.toString().padStart(2, '0')}:00-${end.toString().padStart(2, '0')}:00`;
  };

  // Функция для получения информации о тарифах в текстовом виде
  const getTariffSummary = () => {
    if (selectedTariffs.length === 0) return '';
    
    if (selectedTariffs.length === 1) {
      return selectedTariffs[0].name;
    } else {
      return selectedTariffs.map(t => t.name).join(' + ');
    }
  };

  // ==================== ЗАГРУЗКА ДАННЫХ ====================

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [computersData, positionsData, clubsData, roomsData, tariffsData] = await Promise.all([
        apiService.getComputers(),
        apiService.getComputerPositions(),
        apiService.getClubs(),
        apiService.getRooms(),
        apiService.getTariffs().catch(() => [])
      ]);

      setComputers(computersData);
      setPositions(positionsData);
      setClubs(clubsData);
      setRooms(roomsData);
      
      // Если тарифы не загрузились, используем значения по умолчанию
      if (tariffsData.length === 0) {
        setTariffs([
          { id: 1, name: 'Дневной', coefficient: 1.00 },
          { id: 2, name: 'Вечерний', coefficient: 1.20 },
          { id: 3, name: 'Ночной', coefficient: 0.80 }
        ]);
      } else {
        setTariffs(tariffsData);
      }

      const savedClubId = localStorage.getItem('selectedClubId');
      if (!savedClubId) {
        navigate('/clubs');
        return;
      }
      const previousClubId = localStorage.getItem('cartClubId');
        if (previousClubId && previousClubId !== savedClubId) {
          clearCart();
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

  // Упрощенная функция для загрузки бронирований на выбранную дату
  const loadBookingsForSelectedDate = async (computerId, date) => {
    if (!computerId || !date) return;

    try {
      setLoadingTimeSlots(true);
      const dateStr = date.toISOString().split('T')[0];
      const bookings = await apiService.getBookingsByComputerAndDate(computerId, dateStr);
      
      const slots = bookings
        .filter(booking => booking.status === 'confirmed')
        .map(booking => ({
          start: new Date(booking.start_time),
          end: new Date(booking.end_time),
          id: booking.id
        }));
      
      setBookedTimeSlots(slots);
    } catch (error) {
      console.error('Ошибка при загрузке бронирований:', error);
      setBookedTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // ==================== РАБОТА С МЕСТАМИ И ПОЗИЦИЯМИ ====================

  // Получение комнат для текущего клуба
  const getClubRooms = () => {
    const clubId = formData.club_id;
    if (!clubId) return [];
    return rooms.filter(room => room.club_id == clubId);
  };

  // Получение позиций для выбранной комнаты
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
        computer_id: newComputerId,
        // ⬇️ Очистка выбранной даты и времени при смене места
        date: '',
        timeFrom: '',
        timeTo: ''
      }));
      
      // Сброс тарифов и цен при смене места
      setSelectedTariffs([]);
      setPlacePriceWithTariff(0);
      setTotalPriceWithTariff(0);
      setTariffBreakdown([]);
      
      // Сбрасываем занятые слоты при смене места
      setBookedTimeSlots([]);
      
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

  // Генерация сетки 6x6 с позициями из базы данных
  const generateRoomGrid = () => {
    const gridSize = 6;
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
    
    const filteredPositions = getFilteredPositions();
    
    // Заполняем сетку позициями из базы данных
    filteredPositions.forEach(position => {
      const { position_x, position_y, number } = position;
      
      // Проверяем, что координаты в пределах сетки
      if (position_x >= 0 && position_x < gridSize && position_y >= 0 && position_y < gridSize) {
        grid[position_y][position_x] = {
          number,
          available: isPlaceAvailable(number)
        };
      }
    });
    
    return grid;
  };

  // ==================== РАБОТА С ДАТАМИ И ВРЕМЕНЕМ ====================

  // Функция для проверки доступности временного слота
  const checkTimeSlotAvailability = async (computerId, date, timeFrom, timeTo) => {
    if (!computerId || !date) return false;
    
    try {
      const dateStr = date.toISOString().split('T')[0];
      const bookings = await apiService.getBookingsByComputerAndDate(computerId, dateStr);
      
      const selectedStart = new Date(`${dateStr}T${timeFrom}`);
      const selectedEnd = new Date(`${dateStr}T${timeTo}`);
      
      // Проверяем пересечения с существующими бронированиями
      const hasConflict = bookings.some(booking => {
        if (booking.status !== 'confirmed') return false;
        
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);
        
        return (
          selectedStart < bookingEnd && 
          selectedEnd > bookingStart
        );
      });
      
      return !hasConflict;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
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

  const validateTimeRange = (timeFrom, timeTo) => {
    if (!timeFrom || !timeTo) return true;
    
    const fromHour = parseInt(timeFrom.split(':')[0]);
    const toHour = parseInt(timeTo.split(':')[0]);
    
    if (toHour <= fromHour) {
      setTimeError('Время окончания должно быть позже времени начала');
      return false;
    }
    
    if ((toHour - fromHour) < 1) {
      setTimeError('Минимальное время бронирования - 1 час');
      return false;
    }
    
    if ((toHour - fromHour) > 24) {
      setTimeError('Максимальное время бронирования - 24 часа');
      return false;
    }
    
    setTimeError('');
    return true;
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

  // ==================== ОБРАБОТЧИКИ ВЫБОРА ДАТЫ И ВРЕМЕНИ ====================

  const handleDateSelectClick = () => {
    if (!formData.computer_id) {
      alert('Сначала выберите место');
      return;
    }
    setShowDatePicker(true);
  };

  const handleTimeSelectClick = () => {
    if (!formData.date) {
      alert('Сначала выберите дату');
      return;
    }
    
    // Загружаем занятые слоты для выбранной даты
    loadBookingsForSelectedDate(formData.computer_id, new Date(formData.date));
    setShowTimePicker(true);
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
      
      setFormData(prev => ({
        ...prev,
        date: dateString,
        timeFrom: '',
        timeTo: ''
      }));
      
      // Сброс тарифа при смене даты
      setSelectedTariffs([]);
      setPlacePriceWithTariff(0);
      setTariffBreakdown([]);
      
      // Сбрасываем занятые слоты при смене даты
      setBookedTimeSlots([]);
      
      setShowDatePicker(false);
      setSelectedDate(null);
    }
  };

  const handleTimeSelect = async (startHour, endHour) => {
    const timeFrom = `${startHour}:00`;
    const timeTo = `${endHour}:00`;
    
    // Проверяем доступность времени
    const isAvailable = await checkTimeSlotAvailability(
      formData.computer_id,
      new Date(formData.date),
      timeFrom,
      timeTo
    );
    
    if (!isAvailable) {
      alert('Выбранное время недоступно для бронирования. Пожалуйста, выберите другое время.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      timeFrom,
      timeTo
    }));
    setShowTimePicker(false);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
    setSelectedDate(null);
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
  };

  // ==================== РАБОТА С БРОНИРОВАНИЕМ И КОРЗИНОЙ ====================

  const getBookingHours = () => {
    if (!formData.timeFrom || !formData.timeTo) return 0;
    const fromHour = parseInt(formData.timeFrom.split(':')[0]);
    const toHour = parseInt(formData.timeTo.split(':')[0]);
    return toHour - fromHour;
  };

  const getBookingMinutes = () => {
    return getBookingHours() * 60;
  };

  const getDisabledReason = () => {
    const reasons = [];
    if (!selectedPlace) reasons.push("Не выбрано место");
    if (!formData.date) reasons.push("Не выбрана дата");
    if (!formData.timeFrom) reasons.push("Не выбрано время начала");
    if (!formData.timeTo) reasons.push("Не выбрано время окончания");
    if (!formData.computer_id) reasons.push("Не установлен computer_id");
    if (timeError) reasons.push(timeError);
    return reasons.join(", ");
  };

  const isBookingDisabled = !selectedPlace || !formData.date || !formData.timeFrom ||
    !formData.timeTo || !formData.computer_id || timeError;

  const getProductWord = (count) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastDigit === 1 && lastTwoDigits !== 11) {
      return 'товар';
    } else if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
      return 'товара';
    } else {
      return 'товаров';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверяем авторизацию пользователя
    if (!user) {
      const bookingData = {
        // Те же самые данные что и в proceedWithBooking
        formData: { ...formData },
        selectedPlace,
        selectedPlaceRate,
        tariffBreakdown,
        selectedTariffs,
        placePriceWithTariff,
        totalPriceWithTariff,
        cartItems: [...cartItems],
        totalPrice: getTotalPrice(),
        bookingMinutes: getBookingMinutes(),
        calculatedData: { 
          placeCost: placePriceWithTariff, 
          totalCost: totalPriceWithTariff, 
          bookingHours: getBookingHours() 
        },
        timestamp: Date.now()
      };
      
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      
      navigate('/login', { 
        state: { 
          from: '/booking',
          message: 'Для завершения бронирования необходимо авторизоваться'
        } 
      });
      return;
    }
    
    if (!validateTimeRange(formData.timeFrom, formData.timeTo)) return;
    
    // Финальная проверка доступности времени
    const isAvailable = await checkTimeSlotAvailability(
      formData.computer_id,
      new Date(formData.date),
      formData.timeFrom,
      formData.timeTo
    );
    
    if (!isAvailable) {
      alert('К сожалению, выбранное время стало недоступно. Пожалуйста, выберите другое время.');
      return;
    }
    
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
      const totalCost = totalPriceWithTariff;
      
      // Собираем полные данные для подтверждения
      const bookingData = {
        // Основные данные бронирования
        id: `temp_${Date.now()}`,
        formData: { 
          ...formData, 
          computer_id: computerId,
          // Добавляем явно все поля формы для надежности
          place: formData.place,
          date: formData.date,
          timeFrom: formData.timeFrom,
          timeTo: formData.timeTo,
          dateFrom: formData.date,
          dateTo: formData.date,
          address: formData.address,
          club_id: formData.club_id,
          room: formData.room
        },
        
        // Информация о месте
        selectedPlace,
        selectedPlaceRate,
        
        // Полная информация о тарифах
        tariffBreakdown, // детализация по часам/группам
        selectedTariffs, // примененные тарифы
        placePriceWithTariff, // стоимость места с учетом тарифов
        totalPriceWithTariff, // общая стоимость (место + корзина)
        
        // Информация о корзине
        cartItems: [...cartItems],
        totalPrice: getTotalPrice(),
        
        // Расчетные данные
        bookingMinutes,
        calculatedData: { 
          placeCost: placePriceWithTariff, 
          totalCost, 
          bookingHours: getBookingHours() 
        },
        
        // Дополнительная информация
        status: 'draft',
        created_at: new Date().toISOString(),
        
        // Для отладки - информация о пользователе
        userInfo: {
          userId: user?.id,
          userName: user?.name
        }
      };
      
      console.log('📦 Sending complete booking data to confirmation:', {
        hasTariffData: tariffBreakdown.length > 0,
        tariffGroups: tariffBreakdown.length,
        selectedTariffs: selectedTariffs.map(t => t.name),
        placePrice: placePriceWithTariff,
        totalPrice: totalPriceWithTariff,
        bookingHours: getBookingHours(),
        cartItems: cartItems.length
      });
      
      // Передаем на страницу подтверждения
      navigate('/confirmation', { state: bookingData });
      
    } catch (error) {
      console.error('Error preparing booking data:', error);
      alert('Ошибка при подготовке данных бронирования.');
    }
  };

  // ==================== ОБРАБОТЧИКИ НАВИГАЦИИ ====================

  const handleGoToCafe = () => {
    const currentBookingState = {
      formData,
      selectedPlace,
      selectedPlaceRate,
      selectedTariffs,
      tariffBreakdown,
      placePriceWithTariff,
      totalPriceWithTariff
    };
    localStorage.setItem('savedBooking', JSON.stringify(currentBookingState));
    navigate(`/cafe/${formData.club_id}`);
  };

  const handleClearCart = () => clearCart();
  
  const handleBackToHome = () => {
    localStorage.removeItem('bookingStarted');
    localStorage.removeItem('selectedClubId');
    localStorage.removeItem('bookingFormData');
    localStorage.removeItem('savedBooking');
    localStorage.removeItem('cartClubId');
    clearCart();
    navigate('/');
  };
  
  const handleBackToClub = () => {
    localStorage.removeItem('bookingStarted');
    localStorage.removeItem('selectedClubId');
    localStorage.removeItem('bookingFormData');
    localStorage.removeItem('savedBooking');
    localStorage.removeItem('cartClubId');
    clearCart();
    navigate('/clubs');
  };

  // ==================== КОМПОНЕНТ TIME PICKER ====================

  const TimePicker = ({
    selectedDate,
    bookedTimeSlots,
    onTimeSelect,
    onClose,
    loading,
    tariffs
  }) => {
    const [selectedStartHour, setSelectedStartHour] = useState(null);
    const [selectedEndHour, setSelectedEndHour] = useState(null);
  
    // Функция для определения тарифа по часу
    const getTariffByHour = (hour) => {
      if (!tariffs || tariffs.length === 0) return null;
      
      // Дневной тариф: 10:00 - 17:59
      if (hour >= 8 && hour < 17) {
        return tariffs.find(t => t.name === 'Дневной') || tariffs[0];
      }
      // Вечерний тариф: 18:00 - 23:59
      else if (hour >= 17 && hour < 24) {
        return tariffs.find(t => t.name === 'Вечерний') || tariffs[1];
      }
      // Ночной тариф: 00:00 - 09:59
      else {
        return tariffs.find(t => t.name === 'Ночной') || tariffs[2];
      }
    };
  
    // Функция для получения цвета тарифа
    const getTariffColor = (tariff) => {
      if (!tariff) return 'rgba(255, 255, 255, 0.1)';
      
      switch(tariff.name) {
        case 'Дневной':
          return 'rgba(108, 117, 125, 0.3)'; // серый
        case 'Вечерний':
          return 'rgba(53, 178, 220, 0.34)'; // малиновый
        case 'Ночной':
          return 'rgba(13, 110, 253, 0.3)'; // синий
        default:
          return 'rgba(255, 255, 255, 0.1)';
      }
    };

    // Функция для получения цвета текста тарифа
    const getTariffTextColor = (tariff) => {
      if (!tariff) return 'rgba(255, 255, 255, 0.7)';
      
      switch(tariff.name) {
        case 'Дневной':
          return '#6c757d'; // серый
        case 'Вечерний':
          return 'rgba(53, 178, 220, 0.86)'; // малиновый
        case 'Ночной':
          return '#0d6efd'; // синий
        default:
          return 'rgba(255, 255, 255, 0.7)';
      }
    };
  
    const getSlotType = (hour) => {
      if (!selectedDate || !bookedTimeSlots || bookedTimeSlots.length === 0) return 'free';
    
      const hourStart = new Date(selectedDate);
      hourStart.setHours(parseInt(hour, 10), 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourStart.getHours() + 1);
    
      for (const slot of bookedTimeSlots) {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);
    
        const startHour = slotStart.getHours();
        const endHour = slotEnd.getHours();
    
        // если этот час — начало брони
        if (parseInt(hour, 10) === startHour) return 'booked-start';
    
        // если этот час равен концу брони
        if (parseInt(hour, 10) === endHour) return 'booked-end';
    
        // если этот час находится строго между началом и концом брони
        if (parseInt(hour, 10) > startHour && parseInt(hour, 10) < endHour) {
          return 'booked-middle';
        }
      }
    
      return 'free';
    };
  
    const canSelectTimeRange = (startHour, endHour) => {
      if (!selectedDate) return false;
    
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(startHour, 10), 0, 0, 0);
    
      const endTime = new Date(selectedDate);
      endTime.setHours(parseInt(endHour, 10), 0, 0, 0);
    
      return !bookedTimeSlots.some(slot => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);
        return (startTime < slotEnd && endTime > slotStart);
      });
    };
  
    const handleHourClick = (hour) => {
      // Если повторно нажали на уже выбранное время — сбрасываем выделение
      if (hour === selectedStartHour || hour === selectedEndHour) {
        setSelectedStartHour(null);
        setSelectedEndHour(null);
        return;
      }
  
      if (selectedStartHour === null) {
        setSelectedStartHour(hour);
        setSelectedEndHour(null);
        return;
      }
   
      if (selectedEndHour === null) {
        if (parseInt(hour, 10) <= parseInt(selectedStartHour, 10)) {
          alert('Время окончания должно быть позже времени начала');
          return;
        }
  
        if (!canSelectTimeRange(selectedStartHour, hour)) {
          alert('Выбранный промежуток времени пересекается с существующими бронированиями');
          return;
        }
  
        setSelectedEndHour(hour);
        return;
      }
  
      setSelectedStartHour(hour);
      setSelectedEndHour(null);
    };
  
    const handleConfirm = () => {
      if (selectedStartHour !== null && selectedEndHour !== null) {
        const start = `${selectedStartHour.padStart(2, '0')}`;
        const end = `${selectedEndHour.padStart(2, '0')}`;
        onTimeSelect(start, end);
      }
    };
  
    const formatTimeDisplay = (hour) => `${hour}`;
  
    if (loading) {
      return (
        <div className="time-picker-overlay">
          <div className="time-picker">
            <div className="time-picker-header"><h3>Загрузка доступного времени...</h3></div>
            <div className="loading-time-slots"><div>Пожалуйста, подождите</div></div>
          </div>
        </div>
      );
    }
  
    return (
      <div className="time-picker-overlay">
        <div className="time-picker">
          <div className="time-picker-header">
            <h3>
              Выберите время
              <br />
              <small>{selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
            </h3>
            <button type="button" className="time-picker-close" onClick={onClose}>×</button>
          </div>
  
          <div className="time-picker-body">
            <div className="selected-date-info"><strong>Выбранная дата:</strong> {selectedDate.toLocaleDateString('ru-RU')}</div>
  
            {/* Легенда тарифов */}
            {tariffs && tariffs.length > 0 && (
              <div className="tariff-legend">
                <div className="tariff-legend-title">Тарифы по времени:</div>
                <div className="tariff-legend-items">
                  {tariffs.map(tariff => (
                    <div key={tariff.id} className="tariff-legend-item">
                      <div 
                        className="tariff-legend-color" 
                        style={{ backgroundColor: getTariffColor(tariff) }}
                      ></div>
                      <span className="tariff-legend-name">{tariff.name}</span>
                      <span className="tariff-legend-coefficient">({tariff.coefficient}x)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            <div className="time-slots-grid">
              {hours.map(hour => {
                const slotType = getSlotType(hour);
                const isSelected = hour === selectedStartHour || hour === selectedEndHour;
                const isInRange = selectedStartHour && selectedEndHour &&
                  parseInt(hour, 10) > parseInt(selectedStartHour, 10) &&
                  parseInt(hour, 10) < parseInt(selectedEndHour, 10);
                
                const tariff = getTariffByHour(parseInt(hour));
                const tariffStyle = {
                  backgroundColor: getTariffColor(tariff),
                  borderColor: getTariffTextColor(tariff)
                };
  
                return (
                  <button
                    key={hour}
                    type="button"
                    className={`time-slot ${slotType} ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''}`}
                    onClick={() => handleHourClick(hour)}
                    style={slotType === 'free' ? tariffStyle : {}}
                  >
                    <span className="time-slot-hour">{formatTimeDisplay(hour)}</span>
                    <span className="time-slot-status">
                      {slotType === 'free' && tariff && (
                        <span 
                          className="tariff-indicator"
                          style={{ color: getTariffTextColor(tariff) }}
                        >
                          {tariff.coefficient}x
                        </span>
                      )}
                      {slotType === 'free' && !tariff && 'Свободно'}
                      {slotType === 'booked-start' && 'Начало брони'}
                      {slotType === 'booked-middle' && 'Занято'}
                      {slotType === 'booked-end' && 'Конец брони'}
                    </span>
                  </button>
                );
              })}
            </div>
  
            {selectedStartHour && selectedEndHour && (
              <div className="selected-time-range">
                <strong>Выбранное время:</strong> {formatTimeDisplay(selectedStartHour)} - {formatTimeDisplay(selectedEndHour)}
                <br />
                <small>Продолжительность: {parseInt(selectedEndHour, 10) - parseInt(selectedStartHour, 10)} часов</small>
              </div>
            )}
  
            <div className="booked-intervals-list">
              <strong>Уже забронировано:</strong>
              <ul>
                {bookedTimeSlots.length === 0 && <li>Нет броней на эту дату</li>}
                {bookedTimeSlots.map(slot => {
                  const s = new Date(slot.start);
                  const e = new Date(slot.end);
                  const format = (d) => d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                  return <li key={slot.id || `${s.toISOString()}_${e.toISOString()}`}>{format(s)} — {format(e)}</li>;
                })}
              </ul>
              <small>Границы броней можно выбирать, если это не создает пересечений</small>
            </div>
  
            <div className="time-picker-legend">
              <div className="legend-item"><div className="legend-color free"></div><span>Свободно</span></div>
              <div className="legend-item"><div className="legend-color booked-start"></div><span>Начало брони</span></div>
              <div className="legend-item"><div className="legend-color booked-middle"></div><span>Занято</span></div>
              <div className="legend-item"><div className="legend-color booked-end"></div><span>Конец брони</span></div>
              <div className="legend-item"><div className="legend-color selected"></div><span>Выбрано</span></div>
              <div className="legend-item"><div className="legend-color in-range"></div><span>В диапазоне</span></div>
            </div>
          </div>
  
          <div className="time-picker-footer">
            <button type="button" className="booking-btn secondary" onClick={onClose}>Отмена</button>
            <button
              type="button"
              className="booking-btn primary"
              onClick={handleConfirm}
              disabled={selectedStartHour === null || selectedEndHour === null}
            >
              Выбрать время
            </button>
          </div>
        </div>
      </div>
    );
  };
 
  // ==================== РЕНДЕРИНГ ====================

  if (loading) {
    return (
      <div className="admin-loading">
        <div>Загрузка данных...</div>
      </div>
    );
  }

  const clubRooms = getClubRooms();
  const roomGrid = generateRoomGrid();

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

          {/* Вкладки комнат из базы данных */}
          <div className="room-tabs">
            {clubRooms.map(room => (
              <button
                key={room.id}
                type="button"
                className={`room-tab ${formData.room === room.name ? 'active' : ''}`}
                onClick={() => {
                  setFormData(prev => ({ ...prev, room: room.name }));
                  setSelectedPlace(null);
                }}
              >
                {room.name}
              </button>
            ))}
          </div>

          <div className="layout-content-box">
            <div className="layout-scaler">
              {formData.room ? (
                <div className="room-grid-container">
                  <div className="room-grid">
                    {roomGrid.map((row, rowIndex) => (
                      <div key={rowIndex} className="grid-row">
                        {row.map((cell, colIndex) => (
                          <div key={colIndex} className="grid-cell">
                            {cell ? (
                              <div
                                className={`pc-setup ${selectedPlace === cell.number ? 'selected' : ''} ${!cell.available ? 'unavailable' : ''}`}
                                onClick={() => cell.available && handlePlaceClick(cell.number)}
                                style={{ 
                                  cursor: cell.available ? 'pointer' : 'not-allowed',
                                  opacity: cell.available ? 1 : 0.5
                                }}
                                title={cell.available ? `Место ${cell.number}` : 'Место недоступно'}
                              >
                                <img src="/images/6356f02b474a41d638cf709af15fe1f7c6dd92c0.png" alt={`Setup ${cell.number}`} />
                                <span className="layout-number">
                                  {cell.number}
                                  {!cell.available && <span className="unavailable-badge">✗</span>}
                                </span>
                              </div>
                            ) : (
                              <div className="empty-cell"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-room-selected">
                  <p>Выберите комнату для просмотра доступных мест</p>
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
                </div>
              )}
            </div>
            <div></div>
            {/* Кнопка выбора даты */}
            {selectedPlace && (
              <div className="form-group">
                <label>Дата бронирования</label>
                <div className="date-selection">
                  <button 
                    type="button" 
                    className="booking-btn primary"
                    onClick={handleDateSelectClick}
                  >
                    {formData.date ? `Изменить дату (${formatDateDisplay(formData.date)})` : 'Выбрать дату'}
                  </button>
                </div>
              </div>
            )}

            {/* Кнопка выбора времени */}
            {formData.date && (
              <div className="form-group">
                <label>Время бронирования</label>
                <div className="time-selection">
                  <button 
                    type="button" 
                    className="booking-btn primary"
                    onClick={handleTimeSelectClick}
                  >
                    {formData.timeFrom && formData.timeTo 
                      ? `Изменить время (${formData.timeFrom} - ${formData.timeTo})` 
                      : 'Выбрать время'}
                  </button>
                </div>
                {formData.timeFrom && formData.timeTo && (
                  <div className="time-range-info">
                    Выбрано время: {formData.timeFrom} - {formData.timeTo}
                    <br />
                    <small>Продолжительность: {getBookingHours()} часов</small>
                  </div>
                )}
              </div>
            )}
            
            {getTotalItems() > 0 && (
              <div className="cart-info">
                <h3>Корзина ({getTotalItems()} {getProductWord(getTotalItems())})</h3>
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

            {/* Информация о тарифе и ценах */}
            {selectedTariffs.length > 0 && formData.timeFrom && formData.timeTo && (
              <div className="tariff-info-section">
                <h3>Информация о бронировании</h3>
                <div className="tariff-details">
                  <div className="tariff-item">
                    <span>Тариф:</span>
                    <span className="tariff-name">{getTariffSummary()}</span>
                  </div>
                  <div className="tariff-item">
                    <span>Продолжительность:</span>
                    <span>{getBookingHours()} часов</span>
                  </div>
                  <div className="tariff-item">
                    <span>Базовая цена за место:</span>
                    <span>{selectedPlaceRate} ₽/час</span>
                  </div>
                  
                  {/* Детализация по тарифным группам */}
                  {tariffBreakdown.length > 0 && (
                    <div className="tariff-group-breakdown">
                      <div className="breakdown-header">Детализация по тарифным зонам:</div>
                      {tariffBreakdown.map((group, index) => (
                        <div key={index} className="breakdown-group">
                          <div className="group-time">{formatGroupTime(group.start, group.end)}</div>
                          <div className="group-details">
                            <span className="group-tariff">
                              {group.tariff.name} ({group.tariff.coefficient}x)
                            </span>
                            <span className="group-hours">{group.hours} час</span>
                            <span className="group-price">{Math.round(group.totalPrice)} ₽</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="tariff-item">
                    <span>Стоимость места:</span>
                    <span className="place-price">{placePriceWithTariff} ₽</span>
                  </div>
                  {getTotalItems() > 0 && (
                    <div className="tariff-item">
                      <span>Товары из кафе:</span>
                      <span>{getTotalPrice()} ₽</span>
                    </div>
                  )}
                  <div className="tariff-item total-price">
                    <span><strong>Общая стоимость:</strong></span>
                    <span><strong>{totalPriceWithTariff} ₽</strong></span>
                  </div>
                </div>
              </div>
            )}

            {timeError && <div className="time-error-message">⚠️ {timeError}</div>}

            {/* Пикер даты */}
            {showDatePicker && (
              <div className="date-picker-overlay">
                <div className="date-picker">
                  <div className="date-picker-header">
                    <h3>Выберите дату бронирования</h3>
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
                        {calendarDays.map((date, index) => {
                          return (
                            <button
                              key={index}
                              type="button"
                              className={`calendar-day ${date ? (
                                isPastDate(date) ? 'past' : 
                                selectedDate && date.toDateString() === selectedDate.toDateString() ? 'selected' : 
                                isToday(date) ? 'today' : ''
                              ) : 'empty'}`}
                              onClick={() => date && handleDateSelect(date)}
                              disabled={!date || isPastDate(date)}
                            >
                              {date ? date.getDate() : ''}
                              {date && isToday(date) && <div className="today-dot"></div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="date-picker-footer">
                    <div className="selected-date-preview">
                      {selectedDate ? `Выбрано: ${formatDateDisplay(`${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`)}` : 'Выберите дату'}
                    </div>
                    <div className="date-picker-actions">
                      <button type="button" className="booking-btn secondary" onClick={handleDateCancel}>Отмена</button>
                      <button type="button" className="booking-btn primary date" onClick={handleDateConfirm} disabled={!selectedDate}>Выбрать дату</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Пикер времени */}
            {showTimePicker && (
              <TimePicker
                selectedDate={new Date(formData.date)}
                bookedTimeSlots={bookedTimeSlots}
                onTimeSelect={handleTimeSelect}
                onClose={handleTimeCancel}
                loading={loadingTimeSlots}
                tariffs={tariffs} 
              />
            )}

            <div className="booking-actions">
              <button type="submit" className="booking-btn primary" disabled={isBookingDisabled}>
                Перейти к подтверждению
                {isBookingDisabled && (
                  <span style={{ fontSize: '12px', display: 'block', marginTop: '5px', color: 'rgb(36, 214, 160)' }}>
                    ({getDisabledReason()})
                  </span>
                )}
              </button>
             
              <button type="button" className="booking-btn secondary" onClick={handleGoToCafe}>
                Перейти в кафе
              </button>

              <button type="button" className="booking-btn secondary" onClick={handleBackToClub}>
                Выбрать другой клуб
              </button>
              <button type="button" className="booking-btn secondary" onClick={handleBackToHome}>
                Вернуться на главную
              </button>
              {getTotalItems() > 0 && (
                <button type="button" className="booking-btn secondary" onClick={handleClearCart}>Очистить корзину</button>
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