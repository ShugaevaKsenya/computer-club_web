

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let role;

      if (isLogin) {
        role = await login(email, password); // login уже устанавливает user
      } else {
        role = await register(name, email, password); // register тоже устанавливает user
      }

      // Восстановление бронирования
      const pendingBooking = localStorage.getItem('pendingBooking');
      if (pendingBooking) {
        const bookingData = JSON.parse(pendingBooking);
        localStorage.setItem('savedBooking', JSON.stringify(bookingData));
        localStorage.removeItem('pendingBooking');

        navigate('/confirmation', { replace: true }); // перенаправление на страницу подтверждения
        return;
      }
      

      // Навигация после обычного логина
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">{isLogin ? 'Вход' : 'Регистрация'}</h2>
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="login-form-group">
              <input
                type="text"
                placeholder="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="login-input"
                required
              />
            </div>
          )}
          <div className="login-form-group">
            <input
              type="email"
              placeholder="Email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <div className="login-form-group">
            <input
              type="password"
              placeholder="Пароль"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <button type="submit" className="login-btn-primary" disabled={loading}>
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="login-toggle">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="login-btn-link"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>

        <div className="login-guest">
          <button
            type="button"
            onClick={() => navigate(from, { replace: true })}
            className="login-btn-secondary"
          >
            Продолжить без входа
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
