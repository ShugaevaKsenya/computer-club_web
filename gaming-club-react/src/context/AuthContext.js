// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/Api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getAuthFromStorage = () => {
  const auth = localStorage.getItem('auth');
  if (auth && auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.substring(6));
      const [email, password] = decoded.split(':', 2);
      if (email && password) {
        return { email, password, token: auth };
      }
    } catch (e) {
      console.warn('Invalid auth token in localStorage');
    }
  }
  return null;
};

const setAuthToStorage = (email, password) => {
  const token = `Basic ${btoa(`${email}:${password}`)}`;
  localStorage.setItem('auth', token);
  return token;
};

const clearAuth = () => {
  localStorage.removeItem('auth');
  apiService.setAuthHeader(null);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const initAuth = async () => {
    const auth = getAuthFromStorage();
    if (auth) {
      apiService.setAuthHeader(auth.token);
      try {
        const userData = await apiService.getCurrentUser();
        
        // Добавляем роль по умолчанию, если её нет
        const userWithRole = {
          ...userData,
          role: userData.role || 'user', // ← fallback
          password: auth.password
        };
        
        setUser(userWithRole);
      } catch (err) {
        console.warn('Auth token invalid, clearing...');
        clearAuth();
      }
    }
    setLoading(false);
  };
  initAuth();
}, []);

  // src/context/AuthContext.js

const login = async (email, password) => {
  const response = await apiService.login(email, password);
  const userData = response.user;

  if (!userData) {
    throw new Error('Неверные данные');
  }

  // Убедимся, что роль есть
  const userWithRole = {
    ...userData,
    role: userData.role || 'user'
  };

  const token = setAuthToStorage(email, password);
  apiService.setAuthHeader(token);
  setUser({ ...userWithRole, password });
  return userWithRole.role;
};
  const register = async (name, email, password) => {
  const userData = {
    name,
    email,
    password,
    role: 'user',
    money: 0.00 // ← добавлено
  };
  const response = await apiService.register(userData);
  const token = setAuthToStorage(email, password);
  apiService.setAuthHeader(token);
  setUser({ ...userData, password });
    return userData.role;
};

  const logout = () => {
  setUser(null);
  clearAuth();
  localStorage.removeItem('bookingStarted'); // ← СБРОС
};

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};