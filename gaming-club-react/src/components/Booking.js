import React, { useState } from 'react';
import '../styles/Booking.css';

const Booking = () => {
  const [formData, setFormData] = useState({
    place: '',
    timeFrom: '',
    timeTo: '',
    address: '',
    cart: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking data:', formData);
  };

  return (
    <section id="booking" className="booking-section">
      <div className="background-container">
        <img src="/images/05a22047612f11d0169e2d6483daa45080a81adb.png" alt="Gaming setup background" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>
      <div className="container">
        <h2 className="booking-title">Бронь</h2>
        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="place">Место</label>
            <input 
              type="text" 
              id="place" 
              name="place"
              value={formData.place}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group time-group">
            <label htmlFor="time-from">Время</label>
            <div className="time-inputs">
              <span>с</span>
              <input 
                type="text" 
                id="time-from" 
                name="timeFrom"
                value={formData.timeFrom}
                onChange={handleChange}
                placeholder="00:00"
                required 
              />
              <span>до</span>
              <input 
                type="text" 
                id="time-to" 
                name="timeTo"
                value={formData.timeTo}
                onChange={handleChange}
                placeholder="00:00"
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="address">Адрес</label>
            <input 
              type="text" 
              id="address" 
              name="address"
              value={formData.address}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="cart">Корзина</label>
            <textarea 
              id="cart" 
              name="cart"
              value={formData.cart}
              onChange={handleChange}
              rows="5"
            ></textarea>
          </div>
          <div className="booking-actions">
            <button type="submit" className="btn">Оплатить</button>
            <a href="#cafe" className="btn">Перейти в кафе</a>
            <button type="button" className="btn">Назад</button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Booking;