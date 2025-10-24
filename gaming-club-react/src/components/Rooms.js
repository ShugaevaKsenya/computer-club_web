// src/components/Rooms.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/Api';
import '../styles/Rooms.css';

const Rooms = () => {
  const { clubId } = useParams(); 
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clubAddress, setClubAddress] = useState('');

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const [clubs, roomsData] = await Promise.all([
          apiService.getClubs(),
          apiService.getRooms()
        ]);

        const club = clubs.find(c => c.id == clubId);
        if (!club) {
          navigate('/clubs');
          return;
        }
        setClubAddress(club.address);

        const clubRooms = roomsData.filter(room => room.club_id == clubId);
        setRooms(clubRooms);
      } catch (error) {
        console.error('Ошибка загрузки комнат:', error);
        navigate('/clubs');
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [clubId, navigate]);

  const handleRoomSelect = (roomId, roomName) => {
    localStorage.setItem('bookingStarted', 'true');
    localStorage.setItem('selectedRoomId', roomId);
    localStorage.setItem('selectedRoomName', roomName);
    localStorage.setItem('selectedClubId', clubId); 
    navigate('/booking');
  };

  if (loading) {
    return <div className="rooms-section"><h2>Загрузка комнат...</h2></div>;
  }

  return (
    <section className="rooms-section">
      <div className="container">
        <h2 className="section-title">Выберите зал в клубе {clubAddress}</h2>
        <div className="rooms-grid">
          {rooms.map((room) => (
            <button
              key={room.id}
              className="room-card"
              onClick={() => handleRoomSelect(room.id, room.name)}
            >
              <h3>{room.name}</h3>
            </button>
          ))}
        </div>
        <button className="btn secondary" onClick={() => navigate('/clubs')}>
          ← Назад к выбору клуба
        </button>
      </div>
    </section>
  );
};

export default Rooms;