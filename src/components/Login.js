import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/auth.service';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await AuthService.login(email, password);
      navigate('/translation');
      window.location.reload();
    } catch (err) {
      const resMessage =
        (err.response?.data?.message) ||
        err.message ||
        'Ошибка входа';
      setError(resMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="card-modern">
        <h1 className="title-page">Вход</h1>
        <p className="subtitle-page">Введите email и пароль для входа в аккаунт</p>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password">Пароль</label>
            <input
              id="login-password"
              type="password"
              className="input-modern"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-modern" disabled={loading}>
            {loading ? 'Вход…' : 'Войти'}
          </button>
        </form>
        <p className="text-muted mt-2 mb-2" style={{ marginTop: '1.25rem', fontSize: '0.875rem' }}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
