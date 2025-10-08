import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Hero from './components/Hero';
import Clubs from './components/Clubs';
import Pricing from './components/Pricing';
import Cafe from './components/Cafe';
import CombinedLayoutBooking from './components/CombinedLayoutBooking';
import BookingConfirmation from './components/BookingConfirmation';
import './styles/App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Главная страница со всеми секциями */}
            <Route path="/" element={
              <>
                <Hero />
                <Clubs />
                <Pricing />
                <Cafe />
                <CombinedLayoutBooking />
              </>
            } />
            
            {/* Отдельная страница бронирования */}
            <Route path="/booking" element={<CombinedLayoutBooking />} />
            
            {/* Страница подтверждения брони */}
            <Route path="/confirmation" element={<BookingConfirmation />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;