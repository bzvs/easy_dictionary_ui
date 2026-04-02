import React, { useState, useEffect, useCallback } from 'react';
import * as SettingsApi from '../services/settings.api';

/** Генерация вариантов времени для select: с 06:00 до 23:00 с шагом 30 мин */
function getTimeOptions() {
  const options = [];
  for (let h = 6; h <= 23; h++) {
    options.push({ value: `${String(h).padStart(2, '0')}:00`, label: `${String(h).padStart(2, '0')}:00` });
    if (h < 23) options.push({ value: `${String(h).padStart(2, '0')}:30`, label: `${String(h).padStart(2, '0')}:30` });
  }
  return options;
}

const TIME_OPTIONS = getTimeOptions();

/** Преобразование VAPID public key (base64url) в Uint8Array для pushManager.subscribe */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderOnlyIfWords, setReminderOnlyIfWords] = useState(true);
  const [vapidPublicKey, setVapidPublicKey] = useState(null);
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = useCallback(() => {
    setLoading(true);
    setError(null);
    SettingsApi.getSettings()
      .then((data) => {
        setNotificationsEnabled(data.notificationsEnabled ?? false);
        setReminderTime(data.reminderTime || '09:00');
        setReminderOnlyIfWords(data.reminderOnlyIfWords ?? true);
        if (data.vapidPublicKey) setVapidPublicKey(data.vapidPublicKey);
      })
      .catch((err) => setError(err.response?.data?.message || 'Не удалось загрузить настройки'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, [notificationsEnabled]);

  const persistSettings = useCallback((patch) => {
    SettingsApi.updateSettings(patch)
      .then((data) => {
        if (data.notificationsEnabled !== undefined) setNotificationsEnabled(data.notificationsEnabled);
        if (data.reminderTime !== undefined) setReminderTime(data.reminderTime);
        if (data.reminderOnlyIfWords !== undefined) setReminderOnlyIfWords(data.reminderOnlyIfWords);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      })
      .catch((err) => setError(err.response?.data?.message || 'Не удалось сохранить настройки'));
  }, []);

  const handleToggleNotifications = async (enabled) => {
    if (enabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        setNotificationsEnabled(false);
        return;
      }
    }
    if (enabled && vapidPublicKey && 'serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        await SettingsApi.savePushSubscription(sub);
      } catch (e) {
        console.warn('Push subscription failed:', e);
        setError('Не удалось подписаться на уведомления. Проверьте, что сервер настроен (VAPID).');
      }
    }
    setNotificationsEnabled(enabled);
    persistSettings({ notificationsEnabled: enabled });
  };

  const handleTimeChange = (e) => {
    const v = e.target.value;
    setReminderTime(v);
    persistSettings({ reminderTime: v });
  };

  const handleOnlyIfWordsChange = (e) => {
    const v = e.target.checked;
    setReminderOnlyIfWords(v);
    persistSettings({ reminderOnlyIfWords: v });
  };

  const handleTestNotification = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_REMINDER',
          title: 'EasyDict',
          body: 'Это тестовое напоминание. Так вы будете видеть уведомления о повторении слов.',
        });
      } else {
        new Notification('EasyDict', {
          body: 'Это тестовое напоминание. Так вы будете видеть уведомления о повторении слов.',
        });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window;

  if (loading) {
    return (
      <section className="page-section page-section-settings">
        <div className="card-modern settings-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">Загрузка настроек…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section page-section-settings">
      <div className="card-modern settings-container">
        <h1 className="title-page">Настройки</h1>
        <p className="subtitle-page">Уведомления и напоминания о повторении слов. Напоминания отправляются с сервера в выбранное время.</p>

        {error && <div className="alert-error mb-2">{error}</div>}

        {!notificationsSupported && (
          <div className="alert-error mb-2">
            Уведомления не поддерживаются в этом браузере. Используйте современный браузер или PWA.
          </div>
        )}

        {notificationsSupported && (
          <div className="settings-block">
            <h2 className="settings-block-title">Напоминания</h2>

            <div className="form-group settings-row settings-row-toggle">
              <label className="settings-toggle-label">
                <span className="settings-toggle-text">Включить напоминания</span>
                <input
                  type="checkbox"
                  className="settings-toggle-input"
                  checked={notificationsEnabled}
                  onChange={(e) => handleToggleNotifications(e.target.checked)}
                  disabled={permission === 'denied'}
                />
                <span className="settings-toggle-slider" />
              </label>
              {permission === 'denied' && (
                <p className="settings-hint settings-hint-error">
                  Уведомления запрещены в браузере. Разрешите их в настройках сайта.
                </p>
              )}
              {!vapidPublicKey && (
                <p className="settings-hint">
                  Сервер не настроен для push (VAPID). Напоминания будут сохраняться, но отправка с сервера недоступна.
                </p>
              )}
            </div>

            {notificationsEnabled && (
              <>
                <div className="form-group settings-row">
                  <label htmlFor="settings-reminder-time" className="settings-label">
                    Время напоминания
                  </label>
                  <select
                    id="settings-reminder-time"
                    className="settings-select"
                    value={reminderTime}
                    onChange={handleTimeChange}
                  >
                    {TIME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="settings-hint">Напоминание отправляется с сервера один раз в день в выбранное время (по времени сервера).</p>
                </div>

                <div className="form-group settings-row">
                  <label className="settings-checkbox-label">
                    <input
                      type="checkbox"
                      className="settings-checkbox"
                      checked={reminderOnlyIfWords}
                      onChange={handleOnlyIfWordsChange}
                    />
                    <span>Напоминать только если есть слова на повторение</span>
                  </label>
                  <p className="settings-hint">
                    Если включено, уведомление придёт только когда у вас есть слова на сегодня (интервальное повторение).
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-modern btn-outline settings-test-btn"
                  onClick={handleTestNotification}
                  disabled={permission !== 'granted'}
                >
                  Проверить уведомление
                </button>
              </>
            )}
          </div>
        )}

        {saved && <p className="settings-saved-msg">Настройки сохранены</p>}
      </div>
    </section>
  );
};

export default Settings;
