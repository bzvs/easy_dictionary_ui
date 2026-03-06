import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/auth.service';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await AuthService.register(username, email, password);
      navigate('/login');
    } catch (err) {
      const resMessage =
        (err.response?.data?.message) ||
        err.message ||
        'Ошибка регистрации';
      setError(resMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="card-modern">
        <h1 className="title-page">Регистрация</h1>
        <p className="subtitle-page">Создайте аккаунт для использования словаря</p>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="reg-username">Имя пользователя</label>
            <input
              id="reg-username"
              type="text"
              className="input-modern"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              className="input-modern"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Пароль</label>
            <input
              id="reg-password"
              type="password"
              className="input-modern"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn-modern" disabled={loading}>
            {loading ? 'Регистрация…' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="text-muted mt-2 mb-2" style={{ marginTop: '1.25rem', fontSize: '0.875rem' }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
