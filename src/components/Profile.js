import React, { useState, useEffect } from 'react';
import UserService from '../services/user.service';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    UserService.getCurrentUser()
      .then((res) => setUser(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Не удалось загрузить профиль'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="page-section">
        <div className="card-modern" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">Загрузка профиля…</p>
        </div>
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="page-section">
        <div className="card-modern">
          <div className="alert-error">{error || 'Профиль недоступен'}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="card-modern">
        <h1 className="title-page">Профиль</h1>
        <p className="subtitle-page">Данные вашего аккаунта</p>
        <dl style={{ margin: 0, display: 'grid', gap: '0.75rem' }}>
          <div>
            <dt style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Имя пользователя</dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>{user.username || '—'}</dd>
          </div>
          <div>
            <dt style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Email</dt>
            <dd style={{ margin: 0 }}>{user.email || '—'}</dd>
          </div>
          {user.id != null && (
            <div>
              <dt style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>ID</dt>
              <dd style={{ margin: 0, fontFamily: 'ui-monospace, monospace', fontSize: '0.875rem' }}>{user.id}</dd>
            </div>
          )}
          {user.roles?.length > 0 && (
            <div>
              <dt style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Роли</dt>
              <dd style={{ margin: 0 }}>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {user.roles.map((role, index) => (
                    <li key={index}>{role}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
};

export default Profile;
