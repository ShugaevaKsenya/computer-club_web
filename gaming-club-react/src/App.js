// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Hero from './components/Hero';
import Clubs from './components/Clubs';
import Pricing from './components/Pricing';
import Cafe from './components/Cafe';
import CombinedLayoutBooking from './components/CombinedLayoutBooking';
import BookingConfirmation from './components/BookingConfirmation';
import AdminPanel from './components/AdminPanel';
import MyBookings from './components/MyBookings';
import Login from './components/Login';
import './styles/App.css';
import Rooms from './components/Rooms';

// Защита только для админки и "Мои бронирования"
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="app-loading">Загрузка...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (!adminOnly && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const HomePage = () => {
  return (
    <>
      <Hero />
      <Clubs />
      {/* <Cafe /> */}
      {/* Убрано: <CombinedLayoutBooking /> — он на отдельной странице */}
    </>
  );
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="app-loading">Загрузка...</div>;
  }

  // Админ — только админка
  if (user?.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  // Все остальные — публичные маршруты + защищённые по необходимости
  return (
    <Routes>
      {/* Публичные маршруты — доступны всем */}
      <Route path="/" element={<HomePage />} />
      <Route path="/clubs" element={<Clubs />} />
      {/* <Route path="/cafe" element={<Cafe />} /> */}
      <Route path="/rooms/:clubId" element={<Rooms />} />
      <Route path="/booking" element={<CombinedLayoutBooking />} />
      <Route path="/confirmation" element={<BookingConfirmation />} />
      <Route path="/cafe/:clubId" element={<Cafe />} />
      
      {/* Защищённые маршруты */}
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      {/* Авторизация */}
      <Route path="/login" element={<Login />} />

      {/* Редиректы */}
      <Route path="/admin" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;