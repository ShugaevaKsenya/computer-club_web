
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/Api';
import '../styles/AdminPanel.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('foods');
  const [foods, setFoods] = useState([]);
  const [computers, setComputers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [positions, setPositions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Фильтры
  const [foodFilter, setFoodFilter] = useState('all');
  const [clubFilter, setClubFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);

  const [foodForm, setFoodForm] = useState({
    name: '',
    type: 'food',
    price: '',
    count: '',
    path_to_img: '/images/default-food.jpg'
  });

  const [computerForm, setComputerForm] = useState({
    price: '',
    spec_id: '',
    club_id: '',
    room_id: '',
    position_id: ''
  });

  const [specForm, setSpecForm] = useState({
    ram: '',
    processor: '',
    gpu: '',
    monitor: '',
    headphones: '',
    mouse: '',
    keyboard: ''
  });

  const [positionForm, setPositionForm] = useState({
    number: '',
    coefficient: '1.0',
    club_id: '',
    room_id: ''
  });

  const [roomForm, setRoomForm] = useState({
    name: '',
    club_id: ''
  });

  const [clubForm, setClubForm] = useState({
    address: '',
    phone: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [foodsData, computersData, clubsData, specsData, positionsData, roomsData] = await Promise.all([
        apiService.getFoods().catch(e => { console.warn('Foods load failed:', e); return []; }),
        apiService.getComputers().catch(e => { console.warn('Computers load failed:', e); return []; }),
        apiService.getClubs().catch(e => { console.warn('Clubs load failed:', e); return []; }),
        apiService.getComputerSpecs().catch(e => { console.warn('Specs load failed:', e); return []; }),
        apiService.getComputerPositions().catch(e => { console.warn('Positions load failed:', e); return []; }),
        apiService.getRooms().catch(e => { console.warn('Rooms load failed:', e); return []; })
      ]);

      setFoods(foodsData);
      setComputers(computersData);
      setClubs(clubsData);
      setSpecs(specsData);
      setPositions(positionsData);
      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(`Ошибка загрузки данных: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (type, item) => {
    setEditingId(item.id);
    setEditingType(type);

    switch (type) {
      case 'food':
        setFoodForm({
          name: item.name || '',
          type: item.type || 'food',
          price: item.price || '',
          count: item.count || '',
          path_to_img: item.path_to_img || '/images/default-food.jpg'
        });
        break;
      case 'computer':
        const pos = positions.find(p => p.id == item.position_id);
        setComputerForm({
          price: item.price || '',
          spec_id: item.spec_id || '',
          position_id: item.position_id || '',
          club_id: pos?.club_id || '',
          room_id: pos?.room_id || ''
        });
        break;
      case 'spec':
        setSpecForm({
          ram: item.ram || '',
          processor: item.processor || '',
          gpu: item.gpu || '',
          monitor: item.monitor || '',
          headphones: item.headphones || '',
          mouse: item.mouse || '',
          keyboard: item.keyboard || ''
        });
        break;
      case 'position':
        setPositionForm({
          number: item.number || '',
          coefficient: item.coefficient || '1.0',
          club_id: item.club_id || '',
          room_id: item.room_id || ''
        });
        break;
      case 'room':
        setRoomForm({
          name: item.name || '',
          club_id: item.club_id || ''
        });
        break;
      case 'club':
        setClubForm({
          address: item.address || '',
          phone: item.phone || ''
        });
        break;
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
    resetForms();
  };

  const resetForms = () => {
    setFoodForm({ name: '', type: 'food', price: '', count: '', path_to_img: '/images/default-food.jpg' });
    setComputerForm({ price: '', spec_id: '', position_id: '', club_id: '', room_id: '' });
    setSpecForm({ ram: '', processor: '', gpu: '', monitor: '', headphones: '', mouse: '', keyboard: '' });
    setPositionForm({ number: '', coefficient: '1.0', club_id: '', room_id: '' });
    setRoomForm({ name: '', club_id: '' });
    setClubForm({ address: '', phone: '' });
  };

  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    setFormErrors(prev => ({ ...prev, food: null }));

    if (!foodForm.name.trim()) {
      setFormErrors(prev => ({ ...prev, food: 'Название товара обязательно' }));
      return;
    }
    if (!foodForm.price || parseFloat(foodForm.price) <= 0) {
      setFormErrors(prev => ({ ...prev, food: 'Цена должна быть больше 0' }));
      return;
    }
    if (!foodForm.count || parseInt(foodForm.count) < 0) {
      setFormErrors(prev => ({ ...prev, food: 'Количество не может быть отрицательным' }));
      return;
    }

    try {
      const foodData = {
        name: foodForm.name.trim(),
        type: foodForm.type,
        price: parseFloat(foodForm.price),
        count: parseInt(foodForm.count),
        path_to_img: foodForm.path_to_img.trim() || '/images/default-food.jpg'
      };

      let response;
      if (editingType === 'food' && editingId) {
        response = await apiService.request(`/foods/${editingId}`, { method: 'PUT', body: foodData });
        setFoods(prev => prev.map(food => food.id === editingId ? response : food));
        alert('Товар успешно обновлен!');
      } else {
        response = await apiService.request('/foods', { method: 'POST', body: foodData });
        setFoods(prev => [...prev, response]);
        alert('Товар успешно добавлен!');
      }
      cancelEdit();
    } catch (error) {
      console.error('Error saving food:', error);
      setFormErrors(prev => ({ ...prev, food: `Ошибка при сохранении товара: ${error.message}` }));
    }
  };

  const handleSpecSubmit = async (e) => {
    e.preventDefault();
    setFormErrors(prev => ({ ...prev, spec: null }));

    try {
      const specData = {
        ram: specForm.ram,
        processor: specForm.processor,
        gpu: specForm.gpu,
        monitor: specForm.monitor,
        headphones: specForm.headphones,
        mouse: specForm.mouse,
        keyboard: specForm.keyboard
      };

      let response;
      if (editingType === 'spec' && editingId) {
        response = await apiService.request(`/computer-specs/${editingId}`, { method: 'PUT', body: specData });
        setSpecs(prev => prev.map(spec => spec.id === editingId ? response : spec));
        alert('Характеристики успешно обновлены!');
      } else {
        response = await apiService.request('/computer-specs', { method: 'POST', body: specData });
        setSpecs(prev => [...prev, response]);
        alert('Характеристики успешно добавлены!');
      }
      cancelEdit();
    } catch (error) {
      console.error('Error saving spec:', error);
      setFormErrors(prev => ({ ...prev, spec: `Ошибка при сохранении характеристик: ${error.message}` }));
    }
  };

  const handlePositionSubmit = async (e) => {
    e.preventDefault();
    setFormErrors(prev => ({ ...prev, position: null }));

    if (!positionForm.number || parseInt(positionForm.number) <= 0) {
      setFormErrors(prev => ({ ...prev, position: 'Номер места должен быть больше 0' }));
      return;
    }
    if (!positionForm.coefficient || parseFloat(positionForm.coefficient) <= 0) {
      setFormErrors(prev => ({ ...prev, position: 'Коэффициент должен быть больше 0' }));
      return;
    }
    if (!positionForm.club_id) {
      setFormErrors(prev => ({ ...prev, position: 'Выберите клуб' }));
      return;
    }
    if (!positionForm.room_id) {
      setFormErrors(prev => ({ ...prev, position: 'Выберите комнату' }));
      return;
    }

    try {
      const positionData = {
        number: parseInt(positionForm.number),
        coefficient: parseFloat(positionForm.coefficient),
        club_id: parseInt(positionForm.club_id),
        room_id: parseInt(positionForm.room_id)
      };

      let response;
      if (editingType === 'position' && editingId) {
        response = await apiService.request(`/computer-positions/${editingId}`, { method: 'PUT', body: positionData });
        setPositions(prev => prev.map(position => position.id === editingId ? response : position));
        alert('Позиция успешно обновлена!');
      } else {
        response = await apiService.request('/computer-positions', { method: 'POST', body: positionData });
        setPositions(prev => [...prev, response]);
        alert('Позиция успешно добавлена!');
      }
      cancelEdit();
    } catch (error) {
      console.error('Error saving position:', error);
      setFormErrors(prev => ({ ...prev, position: `Ошибка при сохранении позиции: ${error.message}` }));
    }
  };

  const handleComputerSubmit = async (e) => {
    e.preventDefault();
    setFormErrors(prev => ({ ...prev, computer: null }));

    const priceValue = parseFloat(computerForm.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setFormErrors(prev => ({ ...prev, computer: 'Цена должна быть числом больше 0' }));
      return;
    }
    if (!computerForm.club_id) {
      setFormErrors(prev => ({ ...prev, computer: 'Выберите клуб' }));
      return;
    }
    if (!computerForm.room_id) {
      setFormErrors(prev => ({ ...prev, computer: 'Выберите комнату' }));
      return;
    }
    if (!computerForm.position_id) {
      setFormErrors(prev => ({ ...prev, computer: 'Выберите позицию' }));
      return;
    }
    if (!computerForm.spec_id) {
      setFormErrors(prev => ({ ...prev, computer: 'Выберите характеристики' }));
      return;
    }

    try {
      const computerData = {
        price: priceValue,
        spec_id: parseInt(computerForm.spec_id),
        position_id: parseInt(computerForm.position_id)
      };

      let response;
      if (editingType === 'computer' && editingId) {
        response = await apiService.request(`/computers/${editingId}`, { method: 'PUT', body: computerData });
        setComputers(prev => prev.map(computer => computer.id === editingId ? response : computer));
        alert('Компьютер успешно обновлен!');
      } else {
        response = await apiService.request('/computers', { method: 'POST', body: computerData });
        setComputers(prev => [...prev, response]);
        alert('Компьютер успешно добавлен!');
      }
      cancelEdit();
    } catch (error) {
      console.error('Error saving computer:', error);
      setFormErrors(prev => ({ ...prev, computer: `Ошибка при сохранении компьютера: ${error.message}` }));
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.name.trim()) {
      alert('Название комнаты обязательно');
      return;
    }
    if (!roomForm.club_id) {
      alert('Выберите клуб');
      return;
    }

    try {
      const roomData = {
        name: roomForm.name.trim(),
        club_id: parseInt(roomForm.club_id)
      };

      let response;
      if (editingType === 'room' && editingId) {
        response = await apiService.request(`/rooms/${editingId}`, { method: 'PUT', body: roomData });
        setRooms(prev => prev.map(r => r.id === editingId ? response : r));
        alert('Комната обновлена!');
      } else {
        response = await apiService.request('/rooms', { method: 'POST', body: roomData });
        setRooms(prev => [...prev, response]);
        alert('Комната добавлена!');
      }
      cancelEdit();
    } catch (error) {
      console.error('Error saving room:', error);
      alert(`Ошибка: ${error.message}`);
    }
  };

  const handleClubSubmit = async (e) => {
    e.preventDefault();
    setFormErrors(prev => ({ ...prev, club: null }));

    if (!clubForm.address.trim()) {
      setFormErrors(prev => ({ ...prev, club: 'Адрес обязателен' }));
      return;
    }
    if (!clubForm.phone.trim()) {
      setFormErrors(prev => ({ ...prev, club: 'Телефон обязателен' }));
      return;
    }

    try {
      const clubData = {
        address: clubForm.address.trim(),
        phone: clubForm.phone.trim()
      };

      let response;
      if (editingType === 'club' && editingId) {
        response = await apiService.request(`/clubs/${editingId}`, { method: 'PUT', body: clubData });
        setClubs(prev => prev.map(club => club.id === editingId ? response : club));
        alert('Клуб успешно обновлен!');
      } else {
        response = await apiService.request('/clubs', { method: 'POST', body: clubData });
        setClubs(prev => [...prev, response]);
        alert('Клуб успешно добавлен!');
      }
      cancelEdit();
    } catch (error) {
      console.error('Error saving club:', error);
      setFormErrors(prev => ({ ...prev, club: `Ошибка при сохранении клуба: ${error.message}` }));
    }
  };

  // Обработчики фильтров
  const handleFoodFilterChange = (e) => setFoodFilter(e.target.value);
  const handleClubFilterChange = (e) => setClubFilter(e.target.value);
  const handleRoomFilterChange = (e) => setRoomFilter(e.target.value);

  // Удаление
  const handleDeleteFood = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await apiService.request(`/foods/${id}`, { method: 'DELETE' });
        setFoods(prev => prev.filter(food => food.id !== id));
        alert('Товар удален!');
      } catch (error) {
        console.error('Error deleting food:', error);
        alert(`Ошибка при удалении товара: ${error.message}`);
      }
    }
  };

  const handleDeleteComputer = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот компьютер?')) {
      try {
        await apiService.request(`/computers/${id}`, { method: 'DELETE' });
        setComputers(prev => prev.filter(computer => computer.id !== id));
        alert('Компьютер удален!');
      } catch (error) {
        console.error('Error deleting computer:', error);
        alert(`Ошибка при удалении компьютера: ${error.message}`);
      }
    }
  };

  const handleDeleteSpec = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эти характеристики?')) {
      try {
        await apiService.request(`/computer-specs/${id}`, { method: 'DELETE' });
        setSpecs(prev => prev.filter(spec => spec.id !== id));
        alert('Характеристики удалены!');
      } catch (error) {
        console.error('Error deleting spec:', error);
        alert(`Ошибка при удалении характеристик: ${error.message}`);
      }
    }
  };

  const handleDeletePosition = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту позицию?')) {
      try {
        await apiService.request(`/computer-positions/${id}`, { method: 'DELETE' });
        setPositions(prev => prev.filter(position => position.id !== id));
        alert('Позиция удалена!');
      } catch (error) {
        console.error('Error deleting position:', error);
        alert(`Ошибка при удалении позиции: ${error.message}`);
      }
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Удалить комнату?')) {
      try {
        await apiService.request(`/rooms/${id}`, { method: 'DELETE' });
        setRooms(prev => prev.filter(r => r.id !== id));
        alert('Комната удалена!');
      } catch (error) {
        console.error('Error deleting room:', error);
        alert(`Ошибка: ${error.message}`);
      }
    }
  };

  const handleDeleteClub = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот клуб?')) {
      try {
        await apiService.request(`/clubs/${id}`, { method: 'DELETE' });
        setClubs(prev => prev.filter(club => club.id !== id));
        alert('Клуб удален!');
      } catch (error) {
        console.error('Error deleting club:', error);
        alert(`Ошибка при удалении клуба: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    setFormErrors({});
    cancelEdit();
  }, [activeTab]);

  const getFormTitle = (type) => {
    if (editingType === type && editingId) {
      return `Редактировать ${getEntityName(type)}`;
    }
    return `Добавить новый ${getEntityName(type)}`;
  };

  const getEntityName = (type) => {
    const names = {
      food: 'товар',
      computer: 'компьютер',
      spec: 'характеристики',
      position: 'позицию',
      club: 'клуб',
      room: 'комнату'
    };
    return names[type] || 'элемент';
  };

  // Фильтрация данных
  const filteredFoods = foodFilter === 'all'
    ? foods
    : foods.filter(f => f.type === foodFilter);

  const filteredPositions = clubFilter === 'all'
    ? positions
    : positions.filter(p => p.club_id == clubFilter);

  const filteredComputers = clubFilter === 'all' && roomFilter === 'all'
    ? computers
    : computers.filter(comp => {
        const pos = positions.find(p => p.id == comp.position_id);
        const matchesClub = clubFilter === 'all' || (pos && pos.club_id == clubFilter);
        const matchesRoom = roomFilter === 'all' || (pos && pos.room_id == roomFilter);
        return matchesClub && matchesRoom;
      });

  if (loading) {
    return (
      <div className="admin-loading">

        <div>Загрузка данных...</div>
      </div>
    );
  }
  return (
    <div className="admin-panel-container">
      <div className="admin-panel">
        <div className="admin-header">
          <h1>Панель администратора</h1>
          <div className='buttons'>
            <button onClick={handleLogout} className="btn logout-btn">
              Выйти
            </button>
            <div className="header-actions">
              <button onClick={loadData} className="btn refresh-btn">Обновить данные</button>
              {error && (
                <div className="error-banner">
                  {error}
                  <button onClick={() => setError(null)} className="close-btn">×</button>
                </div>
              )}
            </div>
          </div>
        </div>
  
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'foods' ? 'active' : ''}`}
            onClick={() => setActiveTab('foods')}
          >
            Управление едой ({foods.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'computers' ? 'active' : ''}`}
            onClick={() => setActiveTab('computers')}
          >
            Управление компьютерами ({computers.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Характеристики ({specs.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'positions' ? 'active' : ''}`}
            onClick={() => setActiveTab('positions')}
          >
            Позиции ({positions.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            Комнаты ({rooms.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'clubs' ? 'active' : ''}`}
            onClick={() => setActiveTab('clubs')}
          >
            Клубы ({clubs.length})
          </button>
        </div>
  
        <div className="admin-content">
          {activeTab === 'foods' && (
            <div className="tab-content">
              <div className="filters-section">
                <label>
                  Тип еды:
                  <select value={foodFilter} onChange={handleFoodFilterChange}>
                    <option value="all">Все</option>
                    <option value="food">Еда</option>
                    <option value="drink">Напитки</option>
                    <option value="snack">Закуски</option>
                  </select>
                </label>
              </div>
              <div className="form-section">
                <h3>{getFormTitle('food')}</h3>
                {formErrors.food && <div className="form-error">{formErrors.food}</div>}
                <form onSubmit={handleFoodSubmit} className="admin-form">
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Название товара *"
                      value={foodForm.name}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <select
                      value={foodForm.type}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="food">Еда</option>
                      <option value="drink">Напиток</option>
                      <option value="snack">Закуска</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Цена *"
                      value={foodForm.price}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Количество *"
                      value={foodForm.count}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, count: e.target.value }))}
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Путь к изображению (опционально)"
                    value={foodForm.path_to_img}
                    onChange={(e) => setFoodForm(prev => ({ ...prev, path_to_img: e.target.value }))}
                  />
                  <div className="form-actions">
                    <button type="submit" className="btn primary">
                      {editingType === 'food' ? 'Обновить' : 'Добавить'} товар
                    </button>
                    {editingType === 'food' && (
                      <button type="button" onClick={cancelEdit} className="btn secondary">
                        Отмена
                      </button>
                    )}
                  </div>
                </form>
              </div>
  
              <div className="list-section">
                <h3>Список товаров ({filteredFoods.length})</h3>
                <div className="items-grid">
                  {filteredFoods.map(food => (
                    <div key={food.id} className="item-card">
                      <div className="item-info">
                        <h4>{food.name}</h4>
                        <div className="info-row">
                          <div className="info-field">
                            <span className="field-label">Тип</span>
                            <span className="field-value">{food.type}</span>
                          </div>
                          <div className="info-field">
                            <span className="field-label">Цена</span>
                            <span className="field-value">{food.price} ₽</span>
                          </div>
                          <div className="info-field">
                            <span className="field-label">В наличии</span>
                            <span className="field-value">{food.count} шт.</span>
                          </div>
                          {food.path_to_img && food.path_to_img !== '/images/default-food.jpg' && (
                            <div className="info-field">
                              <span className="field-label">Изображение</span>
                              <span className="field-value">{food.path_to_img}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => startEdit('food', food)} className="btn edit-btn">
                          Редактировать
                        </button>
                        <button onClick={() => handleDeleteFood(food.id)} className="btn danger">
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
  
          {/* Компьютеры */}
          {activeTab === 'computers' && (
            <div className="tab-content">
              <div className="filters-section">
                <label>
                  Клуб:
                  <select value={clubFilter} onChange={handleClubFilterChange}>
                    <option value="all">Все клубы</option>
                    {clubs.map(club => (
                      <option key={club.id} value={club.id}>{club.address}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Комната:
                  <select value={roomFilter} onChange={handleRoomFilterChange}>
                    <option value="all">Все комнаты</option>
                    {rooms
                      .filter(r => clubFilter === 'all' || r.club_id == clubFilter)
                      .map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                  </select>
                </label>
              </div>
              <div className="form-section">
                <h3>{getFormTitle('computer')}</h3>
                <form onSubmit={handleComputerSubmit} className="admin-form">
                  <div className="form-row">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Цена за час *"
                      value={computerForm.price}
                      onChange={(e) => {
                        setComputerForm(prev => ({ ...prev, price: e.target.value }));
                        if (formErrors.computer) setFormErrors(prev => ({ ...prev, computer: null }));
                      }}
                      required
                    />
                    <select
                      value={computerForm.spec_id}
                      onChange={(e) => setComputerForm(prev => ({ ...prev, spec_id: e.target.value }))}
                      required
                    >
                      <option value="">Характеристики</option>
                      {specs.map(spec => (
                        <option key={spec.id} value={spec.id}>
                          {spec.processor} + {spec.gpu}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <select
                      value={computerForm.club_id}
                      onChange={(e) => {
                        const clubId = e.target.value;
                        setComputerForm(prev => ({
                          ...prev,
                          club_id: clubId,
                          room_id: '',
                          position_id: ''
                        }));
                      }}
                      required
                    >
                      <option value="">Клуб</option>
                      {clubs.map(club => (
                        <option key={club.id} value={club.id}>{club.address}</option>
                      ))}
                    </select>
                    <select
                      value={computerForm.room_id}
                      onChange={(e) => {
                        const roomId = e.target.value;
                        setComputerForm(prev => ({
                          ...prev,
                          room_id: roomId,
                          position_id: ''
                        }));
                      }}
                      required
                      disabled={!computerForm.club_id}
                    >
                      <option value="">Комната</option>
                      {rooms
                        .filter(r => r.club_id == computerForm.club_id)
                        .map(room => (
                          <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <select
                      value={computerForm.position_id}
                      onChange={(e) => setComputerForm(prev => ({ ...prev, position_id: e.target.value }))}
                      required
                      disabled={!computerForm.room_id}
                    >
                      <option value="">Позиция (место)</option>
                      {positions
                        .filter(p => p.room_id == computerForm.room_id)
                        .map(pos => (
                          <option key={pos.id} value={pos.id}>
                            Место {pos.number}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn primary">
                      {editingType === 'computer' ? 'Обновить' : 'Добавить'} компьютер
                    </button>
                    {editingType === 'computer' && (
                      <button type="button" onClick={cancelEdit} className="btn secondary">
                        Отмена
                      </button>
                    )}
                  </div>
                </form>
              </div>
  
              <div className="list-section">
                <h3>Список компьютеров ({filteredComputers.length})</h3>
                <div className="items-grid">
                  {filteredComputers.map(computer => {
                    const pos = positions.find(p => p.id == computer.position_id);
                    const room = rooms.find(r => r.id == pos?.room_id);
                    const club = clubs.find(c => c.id == pos?.club_id);
                    const spec = specs.find(s => s.id == computer.spec_id);
                    
                    return (
                      <div key={computer.id} className="item-card">
                        <div className="item-info">
                          <h4>Компьютер #{computer.id}</h4>
                          <div className="info-row">
                            <div className="info-field">
                              <span className="field-label">Цена за час</span>
                              <span className="field-value">{computer.price} ₽</span>
                            </div>
                            <div className="info-field">
                              <span className="field-label">Клуб</span>
                              <span className="field-value">{club?.address || '—'}</span>
                            </div>
                            <div className="info-field">
                              <span className="field-label">Комната</span>
                              <span className="field-value">{room?.name || '—'}</span>
                            </div>
                            <div className="info-field">
                              <span className="field-label">Место</span>
                              <span className="field-value">{pos?.number || '—'}</span>
                            </div>
                            {spec && (
                              <div className="info-field">
                                <span className="field-label">Характеристики</span>
                                <span className="field-value">{spec.processor} + {spec.gpu}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="item-actions">
                          <button onClick={() => startEdit('computer', computer)} className="btn edit-btn">
                            Редактировать
                          </button>
                          <button onClick={() => handleDeleteComputer(computer.id)} className="btn danger">
                            Удалить
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
  
          {activeTab === 'positions' && (
            <div className="tab-content">
              <div className="filters-section">
                <label>
                  Клуб:
                  <select value={clubFilter} onChange={handleClubFilterChange}>
                    <option value="all">Все клубы</option>
                    {clubs.map(club => (
                      <option key={club.id} value={club.id}>{club.address}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-section">
                <h3>{getFormTitle('position')}</h3>
                <form onSubmit={handlePositionSubmit} className="admin-form">
                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="Номер места"
                      value={positionForm.number}
                      onChange={(e) => setPositionForm(prev => ({ ...prev, number: e.target.value }))}
                      required
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5.0"
                      placeholder="Коэффициент цены"
                      value={positionForm.coefficient}
                      onChange={(e) => setPositionForm(prev => ({ ...prev, coefficient: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <select
                      value={positionForm.club_id}
                      onChange={(e) => {
                        const clubId = e.target.value;
                        setPositionForm(prev => ({
                          ...prev,
                          club_id: clubId,
                          room_id: ''
                        }));
                      }}
                      required
                    >
                      <option value="">Выберите клуб</option>
                      {clubs.map(club => (
                        <option key={club.id} value={club.id}>
                          {club.address}
                        </option>
                      ))}
                    </select>
                    <select
                      value={positionForm.room_id}
                      onChange={(e) => setPositionForm(prev => ({ ...prev, room_id: e.target.value }))}
                      required
                      disabled={!positionForm.club_id}
                    >
                      <option value="">Выберите комнату</option>
                      {rooms
                        .filter(room => room.club_id == positionForm.club_id)
                        .map(room => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn primary">
                      {editingType === 'position' ? 'Обновить' : 'Добавить'} позицию
                    </button>
                    {editingType === 'position' && (
                      <button type="button" onClick={cancelEdit} className="btn secondary">
                        Отмена
                      </button>
                    )}
                  </div>
                </form>
              </div>
  
              <div className="list-section">
                <h3>Список позиций ({filteredPositions.length})</h3>
                <div className="items-grid">
                  {filteredPositions.map(position => {
                    const room = rooms.find(r => r.id == position.room_id);
                    const club = clubs.find(c => c.id == position.club_id);
                    return (
                      <div key={position.id} className="item-card">
                        <div className="item-info">
                          <h4>Позиция #{position.id}</h4>
                          <div className="info-row">
                            <div className="info-field">
                              <span className="field-label">Комната</span>
                              <span className="field-value">{room ? room.name : `ID ${position.room_id}`}</span>
                            </div>
                            <div className="info-field">
                              <span className="field-label">Место</span>
                              <span className="field-value">{position.number}</span>
                            </div>
                            <div className="info-field">
                              <span className="field-label">Коэффициент</span>
                              <span className="field-value">{position.coefficient}</span>
                            </div>
                            <div className="info-field">
                              <span className="field-label">Клуб</span>
                              <span className="field-value">{club ? club.address : `ID ${position.club_id}`}</span>
                            </div>
                          </div>
                        </div>
                        <div className="item-actions">
                          <button onClick={() => startEdit('position', position)} className="btn edit-btn">
                            Редактировать
                          </button>
                          <button onClick={() => handleDeletePosition(position.id)} className="btn danger">
                            Удалить
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
  
          {['specs', 'rooms', 'clubs'].includes(activeTab) && (
            <div className="tab-content">
              {activeTab === 'specs' && (
                <>
                  <div className="form-section">
                    <h3>{getFormTitle('spec')}</h3>
                    <form onSubmit={handleSpecSubmit} className="admin-form">
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Оперативная память"
                          value={specForm.ram}
                          onChange={(e) => setSpecForm(prev => ({ ...prev, ram: e.target.value }))}
                        />
                        <input
                          type="text"
                          placeholder="Процессор"
                          value={specForm.processor}
                          onChange={(e) => setSpecForm(prev => ({ ...prev, processor: e.target.value }))}
                        />
                      </div>
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Видеокарта"
                          value={specForm.gpu}
                          onChange={(e) => setSpecForm(prev => ({ ...prev, gpu: e.target.value }))}
                        />
                        <input
                          type="text"
                          placeholder="Монитор"
                          value={specForm.monitor}
                          onChange={(e) => setSpecForm(prev => ({ ...prev, monitor: e.target.value }))}
                        />
                      </div>
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Наушники"
                          value={specForm.headphones}
                          onChange={(e) => setSpecForm(prev => ({ ...prev, headphones: e.target.value }))}
                        />
                        <input
                          type="text"
                          placeholder="Мышь"
                          value={specForm.mouse}
                          onChange={(e) => setSpecForm(prev => ({ ...prev, mouse: e.target.value }))}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Клавиатура"
                        value={specForm.keyboard}
                        onChange={(e) => setSpecForm(prev => ({ ...prev, keyboard: e.target.value }))}
                      />
                      <div className="form-actions">
                        <button type="submit" className="btn primary">
                          {editingType === 'spec' ? 'Обновить' : 'Добавить'} характеристики
                        </button>
                        {editingType === 'spec' && (
                          <button type="button" onClick={cancelEdit} className="btn secondary">
                            Отмена
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
  
                  <div className="list-section">
                    <h3>Список характеристик</h3>
                    <div className="items-grid">
                      {specs.map(spec => (
                        <div key={spec.id} className="item-card">
                          <div className="item-info">
                            <h4>Характеристики #{spec.id}</h4>
                            <div className="info-row">
                              <div className="info-field">
                                <span className="field-label">Процессор</span>
                                <span className="field-value">{spec.processor}</span>
                              </div>
                              <div className="info-field">
                                <span className="field-label">Видеокарта</span>
                                <span className="field-value">{spec.gpu}</span>
                              </div>
                              <div className="info-field">
                                <span className="field-label">Память</span>
                                <span className="field-value">{spec.ram}</span>
                              </div>
                              <div className="info-field">
                                <span className="field-label">Монитор</span>
                                <span className="field-value">{spec.monitor}</span>
                              </div>
                              <div className="info-field">
                                <span className="field-label">Наушники</span>
                                <span className="field-value">{spec.headphones}</span>
                              </div>
                              <div className="info-field">
                                <span className="field-label">Мышь</span>
                                <span className="field-value">{spec.mouse}</span>
                              </div>
                              <div className="info-field">
                                <span className="field-label">Клавиатура</span>
                                <span className="field-value">{spec.keyboard}</span>
                              </div>
                            </div>
                          </div>
                          <div className="item-actions">
                            <button onClick={() => startEdit('spec', spec)} className="btn edit-btn">
                              Редактировать
                            </button>
                            <button onClick={() => handleDeleteSpec(spec.id)} className="btn danger">
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
  
              {activeTab === 'rooms' && (
                <>
                  <div className="form-section">
                    <h3>{getFormTitle('room')}</h3>
                    <form onSubmit={handleRoomSubmit} className="admin-form">
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Название комнаты *"
                          value={roomForm.name}
                          onChange={(e) => setRoomForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                        <select
                          value={roomForm.club_id}
                          onChange={(e) => setRoomForm(prev => ({ ...prev, club_id: e.target.value }))}
                          required
                        >
                          <option value="">Выберите клуб</option>
                          {clubs.map(club => (
                            <option key={club.id} value={club.id}>
                              {club.address}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn primary">
                          {editingType === 'room' ? 'Обновить' : 'Добавить'} комнату
                        </button>
                        {editingType === 'room' && (
                          <button type="button" onClick={cancelEdit} className="btn secondary">
                            Отмена
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
  
                  <div className="list-section">
                    <h3>Список комнат</h3>
                    <div className="items-grid">
                      {rooms.map(room => (
                        <div key={room.id} className="item-card">
                          <div className="item-info">
                            <h4>{room.name}</h4>
                            <div className="info-row">
                              <div className="info-field">
                                <span className="field-label">Клуб</span>
                                <span className="field-value">{clubs.find(c => c.id == room.club_id)?.address || '—'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="item-actions">
                            <button onClick={() => startEdit('room', room)} className="btn edit-btn">
                              Редактировать
                            </button>
                            <button onClick={() => handleDeleteRoom(room.id)} className="btn danger">
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
  
              {activeTab === 'clubs' && (
                <>
                  <div className="form-section">
                    <h3>{getFormTitle('club')}</h3>
                    {formErrors.club && <div className="form-error">{formErrors.club}</div>}
                    <form onSubmit={handleClubSubmit} className="admin-form">
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Адрес *"
                          value={clubForm.address}
                          onChange={(e) => setClubForm(prev => ({ ...prev, address: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <input
                          type="tel"
                          placeholder="Телефон *"
                          value={clubForm.phone}
                          onChange={(e) => setClubForm(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn primary">
                          {editingType === 'club' ? 'Обновить' : 'Добавить'} клуб
                        </button>
                        {editingType === 'club' && (
                          <button type="button" onClick={cancelEdit} className="btn secondary">
                            Отмена
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
  
                  <div className="list-section">
                    <h3>Список клубов</h3>
                    <div className="items-grid">
                      {clubs.map(club => (
                        <div key={club.id} className="item-card">
                          <div className="item-info">
                            <h4>Клуб #{club.id}</h4>
                            <div className="info-row">
                              <div className="info-field">
                                <span className="field-label">Адрес</span>
                                <span className="field-value">{club.address}</span>
                              </div>
                              <div className="info-field">
                                <span className="field-label">Телефон</span>
                                <span className="field-value">{club.phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="item-actions">
                            <button onClick={() => startEdit('club', club)} className="btn edit-btn">
                              Редактировать
                            </button>
                            <button onClick={() => handleDeleteClub(club.id)} className="btn danger">
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;