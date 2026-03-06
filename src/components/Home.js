import React from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/auth.service';

const Home = () => {
  const isLoggedIn = !!AuthService.getCurrentUserToken();

  return (
    <section className="page-section home-landing" style={{ maxWidth: '600px', paddingTop: '2rem' }}>
      <div className="home-hero">
        <h1 className="home-title">EasyDict</h1>
        <p className="home-tagline">
          Удобный словарь для перевода слов. Сохраняйте переводы и учите лексику в одном месте.
        </p>
      </div>

      {isLoggedIn ? (
        <div className="card-modern home-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="subtitle-page" style={{ marginBottom: '1.5rem' }}>
            Вы уже вошли в аккаунт. Переходите к переводу или к сохранённым словам.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/translation" className="btn-modern" style={{ width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              Перевод
            </Link>
            <Link
              to="/saved-words"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                background: 'transparent',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
              }}
            >
              Мои слова
            </Link>
          </div>
        </div>
      ) : (
        <>
          <ul className="home-features">
            <li>Перевод слов и фраз</li>
            <li>Сохранение переводов в личный список</li>
            <li>Доступ с любого устройства</li>
          </ul>
          <div className="card-modern home-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="subtitle-page" style={{ marginBottom: '1.5rem' }}>
              Войдите или зарегистрируйтесь, чтобы начать пользоваться словарём.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn-modern" style={{ width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                Войти
              </Link>
              <Link
                to="/register"
                className="btn-outline"
              >
                Регистрация
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Home;
