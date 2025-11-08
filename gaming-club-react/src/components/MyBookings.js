// import React, { useState, useEffect } from 'react';
// import { apiService } from '../services/Api';
// import { useAuth } from '../context/AuthContext'; 
// import '../styles/MyBookings.css';
// import { useNavigate, useLocation } from 'react-router-dom';
// const MyBookings = () => {
//   const { user } = useAuth(); 
//   const [bookings, setBookings] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [clubs, setClubs] = useState([]);
//   const [computers, setComputers] = useState([]);
//   const [foods, setFoods] = useState([]);
//   const [additionalMenu, setAdditionalMenu] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [deletingBookingId, setDeletingBookingId] = useState(null);
//   const [expandedBookings, setExpandedBookings] = useState(new Set());
//   const navigate = useNavigate();
//   const location = useLocation();


//   useEffect(() => {
//     if (user) {
//       loadUserData();
//     }
//   }, [user]);

//   const loadUserData = async () => {
//     try {
//       setLoading(true);
      
//       const userId = user.id;
//       const [userBookings, userPayments, clubsData, computersData, foodsData] = await Promise.all([
//         apiService.getUserBookings(userId).catch(err => {
//           console.error(' Error loading bookings:', err);
//           return [];
//         }),
//         apiService.getUserPayments(userId).catch(err => {
//           console.error('Error loading payments:', err);
//           return [];
//         }),
//         apiService.getClubs().catch(err => {
//           console.error(' Error loading clubs:', err);
//           return [];
//         }),
//         apiService.getComputers().catch(err => {
//           console.error(' Error loading computers:', err);
//           return [];
//         }),
//         apiService.getFoods().catch(err => {
//           console.error(' Error loading foods:', err);
//           return [];
//         })
//       ]);
      
//       let additionalMenuData = [];
//       try {
//         const allMenu = await apiService.getAdditionalMenu().catch(() => []);
//         const bookingIds = userBookings.map(b => b.id);
//         additionalMenuData = allMenu.filter(item => 
//           bookingIds.includes(item.booking_id)
//         );
//       } catch (menuError) {
//         console.log('⚠️ Cannot load additional menu');
//       }
      
//       setBookings(userBookings);
//       setPayments(userPayments);
//       setClubs(clubsData);
//       setComputers(computersData);
//       setFoods(foodsData);
//       setAdditionalMenu(additionalMenuData);
      
//     } catch (err) {
//       console.error('Error loading user data:', err);
//       setError('Не удалось загрузить данные о бронированиях');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getClubInfo = (clubId) => {
//     const club = clubs.find(c => c.id === clubId);
//     return club || { address: 'Не указан', name: 'Неизвестный клуб' };
//   };

//   const getComputerInfo = (computerId) => {
//     if (!computerId) return null;
    
//     const computer = computers.find(c => c.id == computerId);
//     if (!computer) {
//       return null;
//     }

//     return {
//       id: computer.id,
//       name: computer.name || `Компьютер ${computer.id}`,
//       position: computer.position_id ? `Место ${computer.position_id}` : 'Не указано'
//     };
//   };

//   const getLocalFoodData = (bookingId) => {
//     try {
//       const localFoodKey = `local_food_${bookingId}`;
//       const foodOrderKey = `food_order_${bookingId}`;
      
//       const localFoodData = localStorage.getItem(localFoodKey);
//       const foodOrderData = localStorage.getItem(foodOrderKey);
      
//       let localItems = [];
      
//       if (localFoodData) {
//         const parsed = JSON.parse(localFoodData);
//         if (parsed.items && Array.isArray(parsed.items)) {
//           localItems = parsed.items.map(item => ({
//             ...item,
//             isLocal: true,
//             quantity: item.count || item.quantity || 1
//           }));
//         }
//       }
      
//       if (foodOrderData) {
//         const parsed = JSON.parse(foodOrderData);
//         if (parsed.items && Array.isArray(parsed.items)) {
//           parsed.items.forEach(orderItem => {
//             if (!localItems.find(localItem => localItem.food_id === orderItem.food_id)) {
//               localItems.push({
//                 ...orderItem,
//                 isLocal: true,
//                 quantity: orderItem.quantity || 1
//               });
//             }
//           });
//         }
//       }
      
//       return localItems;
      
//     } catch (error) {
//       console.error(` Error loading local food data for booking ${bookingId}:`, error);
//       return [];
//     }
//   };

//   const getBookingFoods = (bookingId) => {
//     const apiMenuItems = additionalMenu.filter(item => {
//       const itemBookingId = item.booking_id || item.bookingId || item.booking;
//       return itemBookingId == bookingId;
//     });
    
//     const localFoodItems = getLocalFoodData(bookingId);
    
//     const allFoodItems = [
//       ...apiMenuItems.map(item => {
//         const foodId = item.food_id || item.foodId || item.food;
//         const food = foods.find(f => f.id == foodId);
        
//         return {
//           ...item,
//           food: food || { 
//             name: `Продукт #${foodId}`, 
//             price: item.price || 0,
//             id: foodId
//           },
//           quantity: item.count || item.quantity || 1,
//           source: 'api'
//         };
//       }),
//       ...localFoodItems.map(item => {
//         const foodId = item.food_id || item.id;
//         const food = foods.find(f => f.id == foodId);
        
//         return {
//           ...item,
//           food: food || { 
//             name: item.name || `Продукт #${foodId}`, 
//             price: item.price || 0,
//             id: foodId
//           },
//           quantity: item.quantity || item.count || 1,
//           source: 'local',
//           isLocal: true
//         };
//       })
//     ];
    
//     return allFoodItems;
//   };

//   const getEnhancedBooking = (booking) => {
//     const payment = payments.find(p => p.booking_id === booking.id);
//     const clubInfo = getClubInfo(booking.club_id);
//     const computerInfo = getComputerInfo(booking.computer_id);
//     const bookingFoods = getBookingFoods(booking.id);

//     return {
//       ...booking,
//       payment: payment || null,
//       clubInfo,
//       computerInfo,
//       foods: bookingFoods
//     };
//   };

//   const getStatusInfo = (status, paymentStatus) => {
//     if (paymentStatus) {
//       const paymentStatusMap = {
//         'pending': { 
//           text: 'Ожидает оплаты', 
//           color: '#ffc107',
//           bgColor: 'rgba(255, 193, 7, 0.15)',
//           borderColor: 'rgba(255, 193, 7, 0.4)'
//         },
//         'completed': { 
//           text: 'Оплачено', 
//           color: '#20c997',
//           bgColor: 'rgba(32, 201, 151, 0.15)',
//           borderColor: 'rgba(32, 201, 151, 0.4)'
//         },
//         'failed': { 
//           text: 'Ошибка оплаты', 
//           color: '#ff6b6b',
//           bgColor: 'rgba(255, 107, 107, 0.15)',
//           borderColor: 'rgba(255, 107, 107, 0.4)'
//         },
//         'refunded': { 
//           text: 'Возврат', 
//           color: '#6c757d',
//           bgColor: 'rgba(108, 117, 125, 0.15)',
//           borderColor: 'rgba(108, 117, 125, 0.4)'
//         }
//       };
      
//       return paymentStatusMap[paymentStatus] || paymentStatusMap.pending;
//     }
  
//     const statusMap = {
//       'confirmed': { 
//         text: 'Подтверждено', 
//         color: '#20c997',
//         bgColor: 'rgba(32, 201, 151, 0.15)',
//         borderColor: 'rgba(32, 201, 151, 0.4)'
//       },
    
//       'pending': { 
//         text: 'Ожидает подтверждения', 
//         color: '#17a2b8',
//         bgColor: 'rgba(23, 162, 184, 0.15)',
//         borderColor: 'rgba(23, 162, 184, 0.4)'
//       },
      
//       'cancelled': { 
//         text: 'Отменено', 
//         color: '#ff6b6b',
//         bgColor: 'rgba(255, 107, 107, 0.15)',
//         borderColor: 'rgba(255, 107, 107, 0.4)'
//       }
//     };
    
//     return statusMap[status] || { 
//       text: status, 
//       color: '#6c757d',
//       bgColor: 'rgba(108, 117, 125, 0.15)',
//       borderColor: 'rgba(108, 117, 125, 0.4)'
//     };
//   };

//   const formatDateTime = (dateTimeString) => {
//     if (!dateTimeString) return 'Не указано';
    
//     try {
//       const date = new Date(dateTimeString);
//       return date.toLocaleString('ru-RU', {
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (e) {
//       return dateTimeString;
//     }
//   };

//   const formatDateShort = (dateTimeString) => {
//     if (!dateTimeString) return '';
    
//     try {
//       const date = new Date(dateTimeString);
//       return date.toLocaleDateString('ru-RU', {
//         day: 'numeric',
//         month: 'short'
//       });
//     } catch (e) {
//       return '';
//     }
//   };

//   const formatTime = (dateTimeString) => {
//     if (!dateTimeString) return '';
    
//     try {
//       const date = new Date(dateTimeString);
//       return date.toLocaleTimeString('ru-RU', {
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (e) {
//       return '';
//     }
//   };

//   const formatPrice = (price) => {
//     if (!price) return '0 ₽';
//     const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
//     return new Intl.NumberFormat('ru-RU').format(numericPrice) + ' ₽';
//   };

//   const formatTimeDuration = (minutes) => {
//     if (!minutes) return 'Не указано';
//     const numericMinutes = typeof minutes === 'string' ? parseInt(minutes) : minutes;
//     const hours = Math.floor(numericMinutes / 60);
//     const mins = numericMinutes % 60;
    
//     if (hours === 0) return `${mins} мин`;
//     if (mins === 0) return `${hours} ч`;
//     return `${hours} ч ${mins} мин`;
//   };

//   const getFilteredBookings = () => {
//     if (filterStatus === 'all') {
//       return bookings;
//     }
//     return bookings.filter(booking => booking.status === filterStatus);
//   };

//   const toggleBookingExpansion = (bookingId) => {
//     const newExpanded = new Set(expandedBookings);
//     if (newExpanded.has(bookingId)) {
//       newExpanded.delete(bookingId);
//     } else {
//       newExpanded.add(bookingId);
//     }
//     setExpandedBookings(newExpanded);
//   };

//   const expandAllBookings = () => {
//     const allIds = new Set(filteredBookings.map(booking => booking.id));
//     setExpandedBookings(allIds);
//   };

//   const collapseAllBookings = () => {
//     setExpandedBookings(new Set());
//   };

//   const handlePayNow = async (paymentId) => {
//     try {
//       alert(`Инициирована оплата платежа #${paymentId}`);
//     } catch (err) {
//       console.error('Error initiating payment:', err);
//       alert('Ошибка при инициации оплаты');
//     }
//   };

 

//   const handleCancelBooking = async (bookingId) => {
//     if (window.confirm('Вы уверены, что хотите отменить бронирование?')) {
//       try {
//         setDeletingBookingId(bookingId);
        
//         // Используем общий метод обновления брони
//         await apiService.updateBooking(bookingId, { 
//           status: 'cancelled' 
//         });
        
//         // Обновляем локальное состояние
//         const updatedBookings = bookings.map(booking => 
//           booking.id === bookingId 
//             ? { ...booking, status: 'cancelled' }
//             : booking
//         );
        
//         setBookings(updatedBookings);
//         alert('Бронирование успешно отменено');
        
//       } catch (err) {
//         console.error('Error cancelling booking:', err);
//         alert('Ошибка при отмене бронирования');
//       } finally {
//         setDeletingBookingId(null);
//       }
//     }
//   };

//   const handleSyncLocalFood = async (bookingId) => {
//     try {
//       const localFoodItems = getLocalFoodData(bookingId);
//       if (localFoodItems.length === 0) {
//         alert('Нет локальных данных для синхронизации');
//         return;
//       }

//       let successCount = 0;
//       let failedCount = 0;

//       for (const item of localFoodItems) {
//         try {
//           await apiService.addFoodToBooking(bookingId, {
//             food_id: item.food_id || item.id,
//             count: item.quantity || item.count
//           });
//           successCount++;
//         } catch (error) {
//           console.error(` Failed to sync item ${item.food_id}:`, error);
//           failedCount++;
//         }
//       }

//       if (failedCount === 0) {
//         localStorage.removeItem(`local_food_${bookingId}`);
//         localStorage.removeItem(`food_order_${bookingId}`);
//         alert(` Все ${successCount} позиций успешно синхронизированы с сервером!`);
//         loadUserData();
//       } else {
//         alert(` Синхронизировано ${successCount} из ${localFoodItems.length} позиций. Неудачные: ${failedCount}`);
//       }

//     } catch (error) {
//       console.error('Error syncing local food data:', error);
//       alert('Ошибка при синхронизации данных');
//     }
//   };

//   const handleBackToHome = () => {
 
//     navigate('/');
// };

//   const handleRefresh = () => {
//     loadUserData();
//   };

//   const statusFilters = [
//     { value: 'all', label: 'Все брони', count: bookings.length },
//     { value: 'confirmed', label: 'Подтвержденные', count: bookings.filter(b => b.status === 'confirmed').length },
//     { value: 'pending', label: 'Ожидают подтверждения', count: bookings.filter(b => b.status === 'pending').length },
//     { value: 'cancelled', label: 'Отмененные', count: bookings.filter(b => b.status === 'cancelled').length }
//   ];

//   if (loading) {
//     return (
//       <div className="admin-loading">

//         <div>Загрузка данных...</div>
//       </div>
//     );
//   }

//   const filteredBookings = getFilteredBookings();
//   const enhancedBookings = filteredBookings.map(booking => getEnhancedBooking(booking));

//   return (
//     <section id="my-bookings" className="my-bookings-section">
//       <div className="background-container">
//         <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
//         <div className="bg-overlay"></div>
//       </div>
      
//       <div className="my-bookings-container">
//         <div className="my-bookings-header">
//           <div>
//             <h1>Мои бронирования</h1>
//             <p className="bookings-count">
//               Показано: {filteredBookings.length} из {bookings.length} броней
//             </p>
//           </div>
//           <div className="header-actions">
//             {filteredBookings.length > 0 && (
//               <>
//                 <button onClick={expandAllBookings} className="btn secondary">
//                   Развернуть все
//                 </button>
//                 <button onClick={collapseAllBookings} className="btn secondary">
//                   Свернуть все
//                 </button>
//               </>
//             )}
//             <button onClick={handleRefresh} className="btn secondary">
//                Обновить
//             </button>
//             <button onClick={handleBackToHome} className="btn secondary">
//               На главную
//             </button>
//           </div>
//         </div>

//         {/* Фильтры по статусу */}
//         <div className="bookings-filters">
//           <div className="filters-header">
//             <h3>Фильтр по статусу:</h3>
//           </div>
//           <div className="filters-grid">
//             {statusFilters.map(filter => (
//               <button
//                 key={filter.value}
//                 className={`filter-btn ${filterStatus === filter.value ? 'active' : ''}`}
//                 onClick={() => setFilterStatus(filter.value)}
//               >
//                 <span className="filter-label">{filter.label}</span>
//                 <span className="filter-count">{filter.count}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {error && (
//           <div className="error-message">
//             {error}
//           </div>
//         )}

//         {filteredBookings.length === 0 ? (
//           <div className="no-bookings">
            
//             <h2>
//               {filterStatus === 'all' 
//                 ? 'У вас нет активных бронирований' 
//                 : `Нет бронирований со статусом "${statusFilters.find(f => f.value === filterStatus)?.label}"`}
//             </h2>
//             <p>
//               {filterStatus === 'all' 
//                 ? 'Забронируйте место в компьютерном клубе, чтобы увидеть его здесь' 
//                 : 'Попробуйте выбрать другой фильтр или создайте новое бронирование'}
//             </p>
//             {filterStatus === 'all' && (
//               <button 
//                 onClick={() => window.location.href = '/booking'} 
//                 className="btn primary"
//               >
//                 Забронировать место
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="bookings-list compact">
//             {enhancedBookings.map((booking) => {
//               const statusInfo = getStatusInfo(
//                 booking.status, 
//                 booking.payment?.status
//               );
              
//               const isExpanded = expandedBookings.has(booking.id);
//               const isPaymentPending = booking.payment?.status === 'pending';
//               const canCancel = ['pending', 'confirmed'].includes(booking.status);
//               const canDelete = !['active', 'completed'].includes(booking.status);
//               const hasFoods = booking.foods && booking.foods.length > 0;
//               const hasLocalFoods = booking.foods && booking.foods.some(f => f.isLocal);
//               const isDeleting = deletingBookingId === booking.id;

//               return (
//                 <div key={booking.id} className={`booking-item ${isExpanded ? 'expanded' : ''}`}>
//                   {/* Компактный заголовок */}
//                   <div 
//                     className="booking-header-compact"
//                     onClick={() => toggleBookingExpansion(booking.id)}
//                   >
//                     <div className="booking-main-info">
//                       <div className="booking-id">Бронь #{booking.id}</div>
//                       <div className="booking-club">{booking.clubInfo.address || `Клуб #${booking.club_id}`}</div>
//                       {booking.computerInfo && (
//                         <div className="booking-computer">{booking.computerInfo.name}</div>
//                       )}
//                     </div>
                    
//                     <div className="booking-time-info">
//                       <div className="booking-date">
//                         {formatDateShort(booking.start_time)} • {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
//                       </div>
//                       <div className="booking-duration">{formatTimeDuration(booking.minutes)}</div>
//                     </div>
                    
//                     <div className="booking-price-info">
//                       <div className="booking-total-price">{formatPrice(booking.total_price)}</div>
//                       {/* <div className="booking-status-compact" style={{ backgroundColor: statusInfo.color }}>
//                         {statusInfo.icon} {statusInfo.text}
//                       </div> */}
//                       <div 
//                             className="booking-status-compact" 
//                             style={{ 
//                               backgroundColor: statusInfo.bgColor,
//                               border: `1px solid ${statusInfo.borderColor}`,
//                               color: statusInfo.color
//                             }}
//                           >
//                             {statusInfo.text}
//                           </div>
//                                               </div>
                    
//                     <div className="booking-expand-icon">
//                       {isExpanded ? '▼' : '►'}
//                     </div>
//                   </div>

//                   {/* Детальная информация (показывается при развертывании) */}
//                   {isExpanded && (
//                     <div className="booking-details-expanded">
//                       {/* Основная информация */}
//                       <div className="detail-section">
//                         <h4>Детали брони</h4>
//                         <div className="detail-grid">
//                           <div className="detail-item">
//                             <span className="detail-label">Клуб:</span>
//                             <span className="detail-value">{booking.clubInfo.address}</span>
//                           </div>
//                           {booking.computerInfo && (
//                             <>
//                               <div className="detail-item">
//                                 <span className="detail-label">Компьютер:</span>
//                                 <span className="detail-value">{booking.computerInfo.name} ({booking.computerInfo.position})</span>
//                               </div>
//                             </>
//                           )}
//                           <div className="detail-item">
//                             <span className="detail-label">Начало:</span>
//                             <span className="detail-value">{formatDateTime(booking.start_time)}</span>
//                           </div>
//                           <div className="detail-item">
//                             <span className="detail-label">Окончание:</span>
//                             <span className="detail-value">{formatDateTime(booking.end_time)}</span>
//                           </div>
//                           <div className="detail-item">
//                             <span className="detail-label">Длительность:</span>
//                             <span className="detail-value">{formatTimeDuration(booking.minutes)}</span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Заказ из кафе */}
//                       {hasFoods ? (
//                         <div className="detail-section">
//                           <h4>
//                             Заказ из кафе ({booking.foods.length} позиций)
//                           </h4>
//                           <div className="foods-list">
//                             {booking.foods.map((item, index) => (
//                               <div key={index} className="food-item">
//                                 <span className="food-name">
//                                   {item.food.name}
                          
//                                 </span>
//                                 <span className="food-quantity">× {item.quantity}</span>
//                                 <span className="food-price">{formatPrice(item.food.price * item.quantity)}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="detail-section">
//                           <h4>Заказ из кафе</h4>
//                           <p className="no-food-message">Заказ из кафе отсутствует</p>
//                         </div>
//                       )}

//                       {/* Информация о платеже */}
//                       {booking.payment && (
//                         <div className="detail-section">
//                           <h4>Информация о платеже</h4>
//                           <div className="detail-grid">
//                             <div className="detail-item">
//                               <span className="detail-label">Статус оплаты:</span>
//                               <span className="detail-value">
//                                 {booking.payment.status === 'completed' ? 'Оплачено' : 
//                                  booking.payment.status === 'pending' ? 'Ожидает оплаты' : 
//                                  booking.payment.status}
//                               </span>
//                             </div>
//                             <div className="detail-item">
//                               <span className="detail-label">Сумма:</span>
//                               <span className="detail-value">{formatPrice(booking.payment.price)}</span>
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                       {/* Действия */}
//                       <div className="booking-actions-compact">
//                         {isPaymentPending && (
//                           <button 
//                             onClick={() => handlePayNow(booking.payment.id)}
//                             className="btn primary"
//                           >
//                             Оплатить сейчас
//                           </button>
//                         )}
                 
                        
//                         {canCancel && (
//                           <button 
//                             onClick={() => handleCancelBooking(booking.id)}
//                             className="btn secondary"
//                           >
//                             Отменить бронь
//                           </button>
//                         )}
                        
                        
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}

        
//       </div>
//     </section>
//   );
// };

// export default MyBookings;
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/Api';
import { useAuth } from '../context/AuthContext'; 
import '../styles/MyBookings.css';
import { useNavigate, useLocation } from 'react-router-dom';

const MyBookings = () => {
  const { user } = useAuth(); 
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [computers, setComputers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [additionalMenu, setAdditionalMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const [expandedBookings, setExpandedBookings] = useState(new Set());
  
  // Новые состояния для оплаты
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cardError, setCardError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    bank: 'unknown'
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const userId = user.id;
      const [userBookings, userPayments, clubsData, computersData, foodsData] = await Promise.all([
        apiService.getUserBookings(userId).catch(err => {
          console.error(' Error loading bookings:', err);
          return [];
        }),
        apiService.getUserPayments(userId).catch(err => {
          console.error('Error loading payments:', err);
          return [];
        }),
        apiService.getClubs().catch(err => {
          console.error(' Error loading clubs:', err);
          return [];
        }),
        apiService.getComputers().catch(err => {
          console.error(' Error loading computers:', err);
          return [];
        }),
        apiService.getFoods().catch(err => {
          console.error(' Error loading foods:', err);
          return [];
        })
      ]);
      
      let additionalMenuData = [];
      try {
        const allMenu = await apiService.getAdditionalMenu().catch(() => []);
        const bookingIds = userBookings.map(b => b.id);
        additionalMenuData = allMenu.filter(item => 
          bookingIds.includes(item.booking_id)
        );
      } catch (menuError) {
        console.log('⚠️ Cannot load additional menu');
      }
      
      setBookings(userBookings);
      setPayments(userPayments);
      setClubs(clubsData);
      setComputers(computersData);
      setFoods(foodsData);
      setAdditionalMenu(additionalMenuData);
      
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Не удалось загрузить данные о бронированиях');
    } finally {
      setLoading(false);
    }
  };

  // Функции для получения информации о бронировании
  const getClubInfo = (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    return club || { address: 'Не указан', name: 'Неизвестный клуб' };
  };

  const getComputerInfo = (computerId) => {
    if (!computerId) return null;
    
    const computer = computers.find(c => c.id == computerId);
    if (!computer) {
      return null;
    }

    return {
      id: computer.id,
      name: computer.name || `Компьютер ${computer.id}`,
      position: computer.position_id ? `Место ${computer.position_id}` : 'Не указано'
    };
  };

  const getBookingFoods = (bookingId) => {
    const apiMenuItems = additionalMenu.filter(item => {
      const itemBookingId = item.booking_id || item.bookingId || item.booking;
      return itemBookingId == bookingId;
    });
    
    const allFoodItems = apiMenuItems.map(item => {
      const foodId = item.food_id || item.foodId || item.food;
      const food = foods.find(f => f.id == foodId);
      
      return {
        ...item,
        food: food || { 
          name: `Продукт #${foodId}`, 
          price: item.price || 0,
          id: foodId
        },
        quantity: item.count || item.quantity || 1,
        source: 'api'
      };
    });
    
    return allFoodItems;
  };

  const getEnhancedBooking = (booking) => {
    const payment = payments.find(p => p.booking_id === booking.id);
    const clubInfo = getClubInfo(booking.club_id);
    const computerInfo = getComputerInfo(booking.computer_id);
    const bookingFoods = getBookingFoods(booking.id);

    return {
      ...booking,
      payment: payment || null,
      clubInfo,
      computerInfo,
      foods: bookingFoods
    };
  };

  // Функции для форматирования
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Не указано';
    
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateTimeString;
    }
  };

  const formatDateShort = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      });
    } catch (e) {
      return '';
    }
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 ₽';
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('ru-RU').format(numericPrice) + ' ₽';
  };

  const formatTimeDuration = (minutes) => {
    if (!minutes) return 'Не указано';
    const numericMinutes = typeof minutes === 'string' ? parseInt(minutes) : minutes;
    const hours = Math.floor(numericMinutes / 60);
    const mins = numericMinutes % 60;
    
    if (hours === 0) return `${mins} мин`;
    if (mins === 0) return `${hours} ч`;
    return `${hours} ч ${mins} мин`;
  };

  const getStatusInfo = (status, paymentStatus) => {
    if (paymentStatus) {
      const paymentStatusMap = {
        'pending': { 
          text: 'Ожидает оплаты', 
          color: '#ffc107',
          bgColor: 'rgba(255, 193, 7, 0.15)',
          borderColor: 'rgba(255, 193, 7, 0.4)'
        },
        'completed': { 
          text: 'Оплачено', 
          color: '#20c997',
          bgColor: 'rgba(32, 201, 151, 0.15)',
          borderColor: 'rgba(32, 201, 151, 0.4)'
        },
        'failed': { 
          text: 'Ошибка оплаты', 
          color: '#ff6b6b',
          bgColor: 'rgba(255, 107, 107, 0.15)',
          borderColor: 'rgba(255, 107, 107, 0.4)'
        },
        'refunded': { 
          text: 'Возврат', 
          color: '#6c757d',
          bgColor: 'rgba(108, 117, 125, 0.15)',
          borderColor: 'rgba(108, 117, 125, 0.4)'
        }
      };
      
      return paymentStatusMap[paymentStatus] || paymentStatusMap.pending;
    }
  
    const statusMap = {
      'confirmed': { 
        text: 'Подтверждено', 
        color: '#20c997',
        bgColor: 'rgba(32, 201, 151, 0.15)',
        borderColor: 'rgba(32, 201, 151, 0.4)'
      },
      'pending': { 
        text: 'Ожидает подтверждения', 
        color: '#17a2b8',
        bgColor: 'rgba(23, 162, 184, 0.15)',
        borderColor: 'rgba(23, 162, 184, 0.4)'
      },
      'cancelled': { 
        text: 'Отменено', 
        color: '#ff6b6b',
        bgColor: 'rgba(255, 107, 107, 0.15)',
        borderColor: 'rgba(255, 107, 107, 0.4)'
      }
    };
    
    return statusMap[status] || { 
      text: status, 
      color: '#6c757d',
      bgColor: 'rgba(108, 117, 125, 0.15)',
      borderColor: 'rgba(108, 117, 125, 0.4)'
    };
  };

  // Функции для фильтрации и управления бронированиями
  const getFilteredBookings = () => {
    if (filterStatus === 'all') {
      return bookings;
    }
    return bookings.filter(booking => booking.status === filterStatus);
  };

  const toggleBookingExpansion = (bookingId) => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };

  const expandAllBookings = () => {
    const allIds = new Set(getFilteredBookings().map(booking => booking.id));
    setExpandedBookings(allIds);
  };

  const collapseAllBookings = () => {
    setExpandedBookings(new Set());
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Вы уверены, что хотите отменить бронирование?')) {
      try {
        setDeletingBookingId(bookingId);
        
        await apiService.updateBooking(bookingId, { 
          status: 'cancelled' 
        });
        
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        );
        
        setBookings(updatedBookings);
        alert('Бронирование успешно отменено');
        
      } catch (err) {
        console.error('Error cancelling booking:', err);
        alert('Ошибка при отмене бронирования');
      } finally {
        setDeletingBookingId(null);
      }
    }
  };

  // ФУНКЦИИ ДЛЯ ОПЛАТЫ PENDING БРОНИРОВАНИЙ

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

  // Функция для получения названия банка по коду
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

  // Основная функция оплаты для существующей брони
  const handlePaymentForPendingBooking = async () => {
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
      // 2. Создаём запись об оплате
      const paymentData = {
        user_id: user.id,
        booking_id: selectedBookingForPayment.id, // связываем с существующей броней
        payment_type: 'card',
        status: 'completed',
        price: selectedBookingForPayment.total_price,
        payment_date: new Date().toISOString(),
        payment_hash: 'mock_hash_' + Date.now()
      };

      const payment = await apiService.createPayment(paymentData);

      if (!payment || !payment.id) {
        throw new Error('Ошибка создания оплаты');
      }

      // 3. Обновляем статус бронирования на completed
      const updatedBooking = await apiService.updateBooking(selectedBookingForPayment.id, {
        status: 'confirmed',
        payment_id: payment.id
      });

      if (!updatedBooking) {
        throw new Error('Ошибка обновления бронирования');
      }

      // 4. Обновляем локальное состояние
      const updatedBookings = bookings.map(booking => 
        booking.id === selectedBookingForPayment.id 
          ? { ...booking, status: 'confirmed', payment_id: payment.id }
          : booking
      );
      
      setBookings(updatedBookings);
      
      // 5. Обновляем payments
      const updatedPayments = [...payments, payment];
      setPayments(updatedPayments);

      setPaymentSuccess(true);
      
      alert(`Оплата прошла успешно! Бронирование #${selectedBookingForPayment.id} подтверждено.`);

      // 6. Закрываем форму оплаты через небольшой таймаут
      setTimeout(() => {
        setShowPaymentForm(false);
        setSelectedBookingForPayment(null);
        setPaymentSuccess(false);
        setCardData({ number: '', expiry: '', cvv: '', bank: 'unknown' });
        document.body.classList.remove('payment-modal-open');
      }, 1000);

    } catch (error) {
      console.error('Ошибка при оплате бронирования:', error);
      alert(`Ошибка при оплате: ${error.message || error}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Функция для открытия формы оплаты
  const handleOpenPaymentForm = (booking) => {
    setSelectedBookingForPayment(booking);
    setShowPaymentForm(true);
    setCardData({ number: '', expiry: '', cvv: '', bank: 'unknown' });
    setCardError('');
    setPaymentSuccess(false);
    document.body.classList.add('payment-modal-open');
  };

  // Функция для закрытия формы оплаты
  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedBookingForPayment(null);
    setCardData({ number: '', expiry: '', cvv: '', bank: 'unknown' });
    setCardError('');
    setPaymentSuccess(false);
    document.body.classList.remove('payment-modal-open');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    loadUserData();
  };

  const statusFilters = [
    { value: 'all', label: 'Все брони', count: bookings.length },
    { value: 'confirmed', label: 'Подтвержденные', count: bookings.filter(b => b.status === 'confirmed').length },
    { value: 'pending', label: 'Ожидают подтверждения', count: bookings.filter(b => b.status === 'pending').length },
    { value: 'cancelled', label: 'Отмененные', count: bookings.filter(b => b.status === 'cancelled').length }
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div>Загрузка данных...</div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <section id="my-bookings" className="my-bookings-section">
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>
      
      <div className="my-bookings-container">
        <div className="my-bookings-header">
          <div>
            <h1>Мои бронирования</h1>
            <p className="bookings-count">
              Показано: {filteredBookings.length} из {bookings.length} броней
            </p>
          </div>
          <div className="header-actions">
            {filteredBookings.length > 0 && (
              <>
                <button onClick={expandAllBookings} className="btn secondary">
                  Развернуть все
                </button>
                <button onClick={collapseAllBookings} className="btn secondary">
                  Свернуть все
                </button>
              </>
            )}
            <button onClick={handleRefresh} className="btn secondary">
               Обновить
            </button>
            <button onClick={handleBackToHome} className="btn secondary">
              На главную
            </button>
          </div>
        </div>

        {/* Фильтры по статусу */}
        <div className="bookings-filters">
          <div className="filters-header">
            <h3>Фильтр по статусу:</h3>
          </div>
          <div className="filters-grid">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                className={`filter-btn ${filterStatus === filter.value ? 'active' : ''}`}
                onClick={() => setFilterStatus(filter.value)}
              >
                <span className="filter-label">{filter.label}</span>
                <span className="filter-count">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <h2>
              {filterStatus === 'all' 
                ? 'У вас нет активных бронирований' 
                : `Нет бронирований со статусом "${statusFilters.find(f => f.value === filterStatus)?.label}"`}
            </h2>
            <p>
              {filterStatus === 'all' 
                ? 'Забронируйте место в компьютерном клубе, чтобы увидеть его здесь' 
                : 'Попробуйте выбрать другой фильтр или создайте новое бронирование'}
            </p>
            {filterStatus === 'all' && (
              <button 
                onClick={() => window.location.href = '/booking'} 
                className="btn primary"
              >
                Забронировать место
              </button>
            )}
          </div>
        ) : (
          <div className="bookings-list compact">
            {filteredBookings.map((booking) => {
              const enhancedBooking = getEnhancedBooking(booking);
              const statusInfo = getStatusInfo(
                enhancedBooking.status, 
                enhancedBooking.payment?.status
              );
              
              const isExpanded = expandedBookings.has(booking.id);
              const isPaymentPending = enhancedBooking.payment?.status === 'pending';
              const canCancel = ['pending', 'confirmed'].includes(enhancedBooking.status);
              const hasFoods = enhancedBooking.foods && enhancedBooking.foods.length > 0;
              const isDeleting = deletingBookingId === booking.id;

              return (
                <div key={booking.id} className={`booking-item ${isExpanded ? 'expanded' : ''}`}>
                  {/* Компактный заголовок */}
                  <div 
                    className="booking-header-compact"
                    onClick={() => toggleBookingExpansion(booking.id)}
                  >
                    <div className="booking-main-info">
                      <div className="booking-id">Бронь #{booking.id}</div>
                      <div className="booking-club">{enhancedBooking.clubInfo.address || `Клуб #${booking.club_id}`}</div>
                      {enhancedBooking.computerInfo && (
                        <div className="booking-computer">{enhancedBooking.computerInfo.name}</div>
                      )}
                    </div>
                    
                    <div className="booking-time-info">
                      <div className="booking-date">
                        {formatDateShort(booking.start_time)} • {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </div>
                      <div className="booking-duration">{formatTimeDuration(booking.minutes)}</div>
                    </div>
                    
                    <div className="booking-price-info">
                      <div className="booking-total-price">{formatPrice(booking.total_price)}</div>
                      <div 
                        className="booking-status-compact" 
                        style={{ 
                          backgroundColor: statusInfo.bgColor,
                          border: `1px solid ${statusInfo.borderColor}`,
                          color: statusInfo.color
                        }}
                      >
                        {statusInfo.text}
                      </div>
                    </div>
                    
                    <div className="booking-expand-icon">
                      {isExpanded ? '▼' : '►'}
                    </div>
                  </div>

                  {/* Детальная информация (показывается при развертывании) */}
                  {isExpanded && (
                    <div className="booking-details-expanded">
                      {/* Основная информация */}
                      <div className="detail-section">
                        <h4>Детали брони</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Клуб:</span>
                            <span className="detail-value">{enhancedBooking.clubInfo.address}</span>
                          </div>
                          {enhancedBooking.computerInfo && (
                            <>
                              <div className="detail-item">
                                <span className="detail-label">Компьютер:</span>
                                <span className="detail-value">{enhancedBooking.computerInfo.name} ({enhancedBooking.computerInfo.position})</span>
                              </div>
                            </>
                          )}
                          <div className="detail-item">
                            <span className="detail-label">Начало:</span>
                            <span className="detail-value">{formatDateTime(booking.start_time)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Окончание:</span>
                            <span className="detail-value">{formatDateTime(booking.end_time)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Длительность:</span>
                            <span className="detail-value">{formatTimeDuration(booking.minutes)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Заказ из кафе */}
                      {hasFoods ? (
                        <div className="detail-section">
                          <h4>
                            Заказ из кафе ({enhancedBooking.foods.length} позиций)
                          </h4>
                          <div className="foods-list">
                            {enhancedBooking.foods.map((item, index) => (
                              <div key={index} className="food-item">
                                <span className="food-name">
                                  {item.food.name}
                                </span>
                                <span className="food-quantity">× {item.quantity}</span>
                                <span className="food-price">{formatPrice(item.food.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="detail-section">
                          <h4>Заказ из кафе</h4>
                          <p className="no-food-message">Заказ из кафе отсутствует</p>
                        </div>
                      )}

                      {/* Информация о платеже */}
                      {enhancedBooking.payment && (
                        <div className="detail-section">
                          <h4>Информация о платеже</h4>
                          <div className="detail-grid">
                            <div className="detail-item">
                              <span className="detail-label">Статус оплаты:</span>
                              <span className="detail-value">
                                {enhancedBooking.payment.status === 'completed' ? 'Оплачено' : 
                                 enhancedBooking.payment.status === 'pending' ? 'Ожидает оплаты' : 
                                 enhancedBooking.payment.status}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Сумма:</span>
                              <span className="detail-value">{formatPrice(enhancedBooking.payment.price)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Действия */}
                      <div className="booking-actions-compact">
                        {/* Кнопка оплаты для pending брони */}
                        {enhancedBooking.status === 'pending' && !enhancedBooking.payment && (
                          <button 
                            onClick={() => handleOpenPaymentForm(booking)}
                            className="btn primary"
                          >
                            Оплатить сейчас
                          </button>
                        )}
                        
                        {isPaymentPending && (
                          <button 
                            onClick={() => handleOpenPaymentForm(booking)}
                            className="btn primary"
                          >
                            Оплатить сейчас
                          </button>
                        )}
                        
                        {canCancel && (
                          <button 
                            onClick={() => handleCancelBooking(booking.id)}
                            className="btn secondary"
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Отмена...' : 'Отменить бронь'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Форма оплаты для pending бронирований */}
        {showPaymentForm && selectedBookingForPayment && (
          <div className="payment-modal-overlay">
            <div className="payment-modal">
              <div className="payment-modal-header">
                <h3>Оплата бронирования #{selectedBookingForPayment.id}</h3>
                <button 
                  className="close-btn"
                  onClick={handleClosePaymentForm}
                  disabled={processingPayment}
                >
                  ×
                </button>
              </div>
              
              <div className="payment-modal-content">
                <div className="booking-summary">
                  <h4>Детали бронирования:</h4>
                  <div className="summary-details">
                    <div className="summary-item">
                      <span>Клуб:</span>
                      <span>{getClubInfo(selectedBookingForPayment.club_id).address}</span>
                    </div>
                    <div className="summary-item">
                      <span>Время:</span>
                      <span>{formatDateTime(selectedBookingForPayment.start_time)} - {formatTime(selectedBookingForPayment.end_time)}</span>
                    </div>
                    <div className="summary-item">
                      <span>Длительность:</span>
                      <span>{formatTimeDuration(selectedBookingForPayment.minutes)}</span>
                    </div>
                    <div className="summary-item total">
                      <span>Сумма к оплате:</span>
                      <span className="total-amount">{formatPrice(selectedBookingForPayment.total_price)}</span>
                    </div>
                  </div>
                </div>

                <div className="mock-payment-form">
                  <div className="payment-header">
                    <h4>Оплата картой</h4>
                  </div>
                  
                  {cardError && <div className="payment-error">{cardError}</div>}
                  
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
                          onClick={handlePaymentForPendingBooking}
                          disabled={processingPayment}
                        >
                          {processingPayment ? 'Обработка...' : `Оплатить ${formatPrice(selectedBookingForPayment.total_price)}`}
                        </button>
                        <button
                          type="button"
                          className="confirmation-btn secondary"
                          onClick={handleClosePaymentForm}
                          disabled={processingPayment}
                        >
                          Отмена
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyBookings;