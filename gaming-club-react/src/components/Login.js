
// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, useLocation } from 'react-router-dom';
// import '../styles/Login.css';

// const Login = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const { login, register } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const from = location.state?.from?.pathname || '/';

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       let role;
//       if (isLogin) {
//         role = await login(email, password);
//       } else {
//         role = await register(name, email, password);
//       }

//       if (role === 'admin') {
//         navigate('/admin');
//       } else {
//         navigate(from, { replace: true });
//       }
//     } catch (err) {
//       setError(err.message || 'Ошибка авторизации');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
//         {error && <div className="error-message">{error}</div>}
        
//         <form onSubmit={handleSubmit}>
//           {!isLogin && (
//             <div className="form-group">
//               <input
//                 type="text"
//                 placeholder="Имя"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//               />
//             </div>
//           )}
//           <div className="form-group">
//             <input
//               type="email"
//               placeholder="Email"
//               autoComplete="username"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <input
//               type="password"
//               placeholder="Пароль"
//               autoComplete="current-password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button type="submit" className="btn primary" disabled={loading}>
//             {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
//           </button>
//         </form>

//         <div className="toggle-mode">
//           <button
//             type="button"
//             onClick={() => {
//               setIsLogin(!isLogin);
//               setError('');
//             }}
//             className="btn link"
//           >
//             {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
//           </button>
//         </div>

//         <div className="guest-access">
//           <button
//             type="button"
//             onClick={() => navigate(from, { replace: true })}
//             className="btn secondary"
//           >
//             Продолжить без входа
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

// Login.js
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

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let role;
      if (isLogin) {
        role = await login(email, password);
      } else {
        role = await register(name, email, password);
      }

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