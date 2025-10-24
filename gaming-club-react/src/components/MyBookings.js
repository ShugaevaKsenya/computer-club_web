import React, { useState, useEffect } from 'react';
import { apiService } from '../services/Api';
import { useAuth } from '../context/AuthContext'; 
import '../styles/MyBookings.css';

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
          console.error('❌ Error loading bookings:', err);
          return [];
        }),
        apiService.getUserPayments(userId).catch(err => {
          console.error('❌ Error loading payments:', err);
          return [];
        }),
        apiService.getClubs().catch(err => {
          console.error('❌ Error loading clubs:', err);
          return [];
        }),
        apiService.getComputers().catch(err => {
          console.error('❌ Error loading computers:', err);
          return [];
        }),
        apiService.getFoods().catch(err => {
          console.error('❌ Error loading foods:', err);
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
      console.error('❌ Error loading user data:', err);
      setError('Не удалось загрузить данные о бронированиях');
    } finally {
      setLoading(false);
    }
  };

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

  const getLocalFoodData = (bookingId) => {
    try {
      const localFoodKey = `local_food_${bookingId}`;
      const foodOrderKey = `food_order_${bookingId}`;
      
      const localFoodData = localStorage.getItem(localFoodKey);
      const foodOrderData = localStorage.getItem(foodOrderKey);
      
      let localItems = [];
      
      if (localFoodData) {
        const parsed = JSON.parse(localFoodData);
        if (parsed.items && Array.isArray(parsed.items)) {
          localItems = parsed.items.map(item => ({
            ...item,
            isLocal: true,
            quantity: item.count || item.quantity || 1
          }));
        }
      }
      
      if (foodOrderData) {
        const parsed = JSON.parse(foodOrderData);
        if (parsed.items && Array.isArray(parsed.items)) {
          parsed.items.forEach(orderItem => {
            if (!localItems.find(localItem => localItem.food_id === orderItem.food_id)) {
              localItems.push({
                ...orderItem,
                isLocal: true,
                quantity: orderItem.quantity || 1
              });
            }
          });
        }
      }
      
      return localItems;
      
    } catch (error) {
      console.error(`❌ Error loading local food data for booking ${bookingId}:`, error);
      return [];
    }
  };

  const getBookingFoods = (bookingId) => {
    const apiMenuItems = additionalMenu.filter(item => {
      const itemBookingId = item.booking_id || item.bookingId || item.booking;
      return itemBookingId == bookingId;
    });
    
    const localFoodItems = getLocalFoodData(bookingId);
    
    const allFoodItems = [
      ...apiMenuItems.map(item => {
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
      }),
      ...localFoodItems.map(item => {
        const foodId = item.food_id || item.id;
        const food = foods.find(f => f.id == foodId);
        
        return {
          ...item,
          food: food || { 
            name: item.name || `Продукт #${foodId}`, 
            price: item.price || 0,
            id: foodId
          },
          quantity: item.quantity || item.count || 1,
          source: 'local',
          isLocal: true
        };
      })
    ];
    
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

  const getStatusInfo = (status, paymentStatus) => {
    if (paymentStatus) {
      const paymentStatusMap = {
        'pending': { text: 'Ожидает оплаты', color: '#ffc107', icon: '💰' },
        'completed': { text: 'Оплачено', color: '#28a745', icon: '💳' },
        'failed': { text: 'Ошибка оплаты', color: '#dc3545', icon: '❌' },
        'refunded': { text: 'Возврат', color: '#6c757d', icon: '↩️' }
      };
      
      return paymentStatusMap[paymentStatus] || paymentStatusMap.pending;
    }

    const statusMap = {
      'draft': { text: 'Черновик', color: '#6c757d', icon: '📝' },
      'pending': { text: 'Ожидает подтверждения', color: '#17a2b8', icon: '⏳' },
      'confirmed': { text: 'Подтверждено', color: '#28a745', icon: '✅' },
      'active': { text: 'Активно', color: '#28a745', icon: '🟢' },
      'completed': { text: 'Завершено', color: '#6c757d', icon: '🏁' },
      'cancelled': { text: 'Отменено', color: '#dc3545', icon: '❌' }
    };
    
    return statusMap[status] || { text: status, color: '#6c757d', icon: '❓' };
  };

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
    const allIds = new Set(filteredBookings.map(booking => booking.id));
    setExpandedBookings(allIds);
  };

  const collapseAllBookings = () => {
    setExpandedBookings(new Set());
  };

  const handlePayNow = async (paymentId) => {
    try {
      alert(`Инициирована оплата платежа #${paymentId}`);
    } catch (err) {
      console.error('Error initiating payment:', err);
      alert('Ошибка при инициации оплаты');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Вы уверены, что хотите отменить бронирование?')) {
      try {
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
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это бронирование? Это действие нельзя отменить.')) {
      return;
    }

    try {
      setDeletingBookingId(bookingId);
      
      try {
        await apiService.deleteBooking(bookingId);
      } catch (apiError) {
        console.log(`⚠️ API deletion failed for booking ${bookingId}, using local deletion`);
      }
      
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      setBookings(updatedBookings);
      
      localStorage.removeItem(`local_food_${bookingId}`);
      localStorage.removeItem(`food_order_${bookingId}`);
      
      alert('Бронирование успешно удалено');
      
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert('Ошибка при удалении бронирования');
    } finally {
      setDeletingBookingId(null);
    }
  };

  const handleSyncLocalFood = async (bookingId) => {
    try {
      const localFoodItems = getLocalFoodData(bookingId);
      if (localFoodItems.length === 0) {
        alert('Нет локальных данных для синхронизации');
        return;
      }

      let successCount = 0;
      let failedCount = 0;

      for (const item of localFoodItems) {
        try {
          await apiService.addFoodToBooking(bookingId, {
            food_id: item.food_id || item.id,
            count: item.quantity || item.count
          });
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to sync item ${item.food_id}:`, error);
          failedCount++;
        }
      }

      if (failedCount === 0) {
        localStorage.removeItem(`local_food_${bookingId}`);
        localStorage.removeItem(`food_order_${bookingId}`);
        alert(`✅ Все ${successCount} позиций успешно синхронизированы с сервером!`);
        loadUserData();
      } else {
        alert(`⚠️ Синхронизировано ${successCount} из ${localFoodItems.length} позиций. Неудачные: ${failedCount}`);
      }

    } catch (error) {
      console.error('Error syncing local food data:', error);
      alert('Ошибка при синхронизации данных');
    }
  };

  const handleBackToHome = () => {
  localStorage.removeItem('bookingStarted');
  window.location.href = '/';
};

  const handleRefresh = () => {
    loadUserData();
  };

  const statusFilters = [
    { value: 'all', label: 'Все брони', count: bookings.length },
    { value: 'pending', label: 'Ожидают подтверждения', count: bookings.filter(b => b.status === 'pending').length },
    { value: 'confirmed', label: 'Подтвержденные', count: bookings.filter(b => b.status === 'confirmed').length },
    { value: 'active', label: 'Активные', count: bookings.filter(b => b.status === 'active').length },
    { value: 'completed', label: 'Завершенные', count: bookings.filter(b => b.status === 'completed').length },
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
  const enhancedBookings = filteredBookings.map(booking => getEnhancedBooking(booking));

  return (
    <section id="my-bookings" className="my-bookings-section">
      <div className="background-container">
        <img src="/images/67f504fdfc00ad2f7d384258d27391b08ef7aabd.png" alt="Abstract background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>
      
      <div className="my-bookings-container">
        <div className="my-bookings-header">
          <div>
            <h1>📋 Мои бронирования</h1>
            <p className="bookings-count">
              Показано: {filteredBookings.length} из {bookings.length} броней
            </p>
          </div>
          <div className="header-actions">
            {filteredBookings.length > 0 && (
              <>
                <button onClick={expandAllBookings} className="btn secondary">
                  📖 Развернуть все
                </button>
                <button onClick={collapseAllBookings} className="btn secondary">
                  📕 Свернуть все
                </button>
              </>
            )}
            <button onClick={handleRefresh} className="btn secondary">
              🔄 Обновить
            </button>
            <button onClick={handleBackToHome} className="btn secondary">
              На главную
            </button>
          </div>
        </div>

        {/* Фильтры по статусу */}
        <div className="bookings-filters">
          <div className="filters-header">
            <h3>🔍 Фильтр по статусу:</h3>
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
            ⚠️ {error}
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">
              {filterStatus === 'all' ? '📭' : '🔍'}
            </div>
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
            {enhancedBookings.map((booking) => {
              const statusInfo = getStatusInfo(
                booking.status, 
                booking.payment?.status
              );
              
              const isExpanded = expandedBookings.has(booking.id);
              const isPaymentPending = booking.payment?.status === 'pending';
              const canCancel = ['pending', 'confirmed'].includes(booking.status);
              const canDelete = !['active', 'completed'].includes(booking.status);
              const hasFoods = booking.foods && booking.foods.length > 0;
              const hasLocalFoods = booking.foods && booking.foods.some(f => f.isLocal);
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
                      <div className="booking-club">{booking.clubInfo.address || `Клуб #${booking.club_id}`}</div>
                      {booking.computerInfo && (
                        <div className="booking-computer">{booking.computerInfo.name}</div>
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
                      <div className="booking-status-compact" style={{ backgroundColor: statusInfo.color }}>
                        {statusInfo.icon} {statusInfo.text}
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
                        <h4>📍 Детали брони</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Клуб:</span>
                            <span className="detail-value">{booking.clubInfo.address}</span>
                          </div>
                          {booking.computerInfo && (
                            <>
                              <div className="detail-item">
                                <span className="detail-label">Компьютер:</span>
                                <span className="detail-value">{booking.computerInfo.name} ({booking.computerInfo.position})</span>
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
                            🍽️ Заказ из кафе ({booking.foods.length} позиций)
                            {hasLocalFoods && (
                              <span className="local-food-badge">🏠 Локальные данные</span>
                            )}
                          </h4>
                          <div className="foods-list">
                            {booking.foods.map((item, index) => (
                              <div key={index} className="food-item">
                                <span className="food-name">
                                  {item.food.name}
                                  {item.isLocal && <span className="local-indicator">🏠</span>}
                                </span>
                                <span className="food-quantity">× {item.quantity}</span>
                                <span className="food-price">{formatPrice(item.food.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="detail-section">
                          <h4>🍽️ Заказ из кафе</h4>
                          <p className="no-food-message">Заказ из кафе отсутствует</p>
                        </div>
                      )}

                      {/* Информация о платеже */}
                      {booking.payment && (
                        <div className="detail-section">
                          <h4>💳 Информация о платеже</h4>
                          <div className="detail-grid">
                            <div className="detail-item">
                              <span className="detail-label">Статус оплаты:</span>
                              <span className="detail-value">
                                {booking.payment.status === 'completed' ? '✅ Оплачено' : 
                                 booking.payment.status === 'pending' ? '⏳ Ожидает оплаты' : 
                                 booking.payment.status}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Сумма:</span>
                              <span className="detail-value">{formatPrice(booking.payment.price)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Действия */}
                      <div className="booking-actions-compact">
                        {isPaymentPending && (
                          <button 
                            onClick={() => handlePayNow(booking.payment.id)}
                            className="btn primary"
                          >
                            💳 Оплатить сейчас
                          </button>
                        )}
                        
                        {hasLocalFoods && (
                          <button 
                            onClick={() => handleSyncLocalFood(booking.id)}
                            className="btn secondary"
                          >
                            🔄 Синхронизировать еду
                          </button>
                        )}
                        
                        {canCancel && (
                          <button 
                            onClick={() => handleCancelBooking(booking.id)}
                            className="btn secondary"
                          >
                            ❌ Отменить бронь
                          </button>
                        )}
                        
                        {canDelete && (
                          <button 
                            onClick={() => handleDeleteBooking(booking.id)}
                            disabled={isDeleting}
                            className="btn danger"
                          >
                            {isDeleting ? '🗑️ Удаление...' : '🗑️ Удалить'}
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

        {/* Статистика */}
        {bookings.length > 0 && (
          <div className="bookings-stats">
            <div className="stat-card">
              <span className="stat-number">{bookings.length}</span>
              <span className="stat-label">Всего броней</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {bookings.filter(b => b.status === 'confirmed' || b.status === 'active').length}
              </span>
              <span className="stat-label">Активные</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {enhancedBookings.filter(b => b.foods && b.foods.length > 0).length}
              </span>
              <span className="stat-label">С заказом еды</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {enhancedBookings.filter(b => b.foods && b.foods.some(f => f.isLocal)).length}
              </span>
              <span className="stat-label">С локальной едой</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyBookings;