import React, { useState, useEffect, useCallback } from 'react';
import * as StatisticsApi from '../services/statistics.api';

const PERIOD_OPTIONS = [
  { value: 7, label: '7 дней' },
  { value: 30, label: '30 дней' },
  { value: 90, label: '90 дней' },
];

/** Форматирование даты для отображения (кратко) */
function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDate();
  const month = d.toLocaleDateString('ru-RU', { month: 'short' });
  return `${day} ${month}`;
}

const Statistics = () => {
  const [data, setData] = useState(null);
  const [periodDays, setPeriodDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    StatisticsApi.getStatistics(periodDays)
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Не удалось загрузить статистику'))
      .finally(() => setLoading(false));
  }, [periodDays]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <section className="page-section">
        <div className="card-modern statistics-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">Загрузка статистики…</p>
        </div>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="page-section">
        <div className="card-modern statistics-container">
          <h1 className="title-page">Статистика</h1>
          <div className="alert-error mb-2">{error}</div>
          <button type="button" className="btn-modern" onClick={load}>
            Повторить
          </button>
        </div>
      </section>
    );
  }

  const total = data?.totalWords ?? 0;
  const learned = data?.learnedWords ?? 0;
  const progressPercent = total > 0 ? Math.round((learned / total) * 100) : 0;

  return (
    <section className="page-section page-section-statistics">
      <div className="card-modern statistics-container">
        <h1 className="title-page">Статистика</h1>
        <p className="subtitle-page">Прогресс и результаты тренировок</p>

        <div className="statistics-period">
          <label htmlFor="stat-period" className="statistics-period-label">
            Период:
          </label>
          <select
            id="stat-period"
            className="statistics-period-select"
            value={periodDays}
            onChange={(e) => setPeriodDays(Number(e.target.value))}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="statistics-block">
          <h2 className="statistics-block-title">Слова</h2>
          <div className="statistics-total">
            Всего слов: <strong>{total}</strong>
          </div>
          <div className="statistics-status-grid">
            <div className="statistics-status-card statistics-status-new">
              <span className="statistics-status-value">{data?.newWords ?? 0}</span>
              <span className="statistics-status-label">Новых</span>
            </div>
            <div className="statistics-status-card statistics-status-inprogress">
              <span className="statistics-status-value">{data?.inProgressWords ?? 0}</span>
              <span className="statistics-status-label">На изучении</span>
            </div>
            <div className="statistics-status-card statistics-status-learned">
              <span className="statistics-status-value">{data?.learnedWords ?? 0}</span>
              <span className="statistics-status-label">Изучено</span>
            </div>
          </div>
          <div className="statistics-progress-wrap">
            <div className="statistics-progress-bar">
              <div
                className="statistics-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="statistics-progress-text">
              Прогресс: {learned} из {total} ({progressPercent}%)
            </p>
          </div>
          <div className="statistics-learned-period">
            За последние <strong>{data?.periodDays ?? periodDays} дней</strong> изучено слов:{' '}
            <strong>{data?.learnedInPeriod ?? 0}</strong>
          </div>
        </div>

        <div className="statistics-block">
          <h2 className="statistics-block-title">Тренировки</h2>
          <p className="statistics-hint">Верные и неверные ответы за выбранный период</p>
          <div className="statistics-training-totals">
            <div className="statistics-training-item statistics-training-correct">
              <span className="statistics-training-value">{data?.trainingCorrect ?? 0}</span>
              <span className="statistics-training-label">Верно</span>
            </div>
            <div className="statistics-training-item statistics-training-incorrect">
              <span className="statistics-training-value">{data?.trainingIncorrect ?? 0}</span>
              <span className="statistics-training-label">Неверно</span>
            </div>
          </div>
          {data?.trainingCorrect + data?.trainingIncorrect > 0 && (
            <p className="statistics-accuracy">
              Точность:{' '}
              <strong>
                {Math.round(
                  (data.trainingCorrect / (data.trainingCorrect + data.trainingIncorrect)) * 100
                )}
                %
              </strong>
            </p>
          )}
          {data?.byDay?.length > 0 && (
            <div className="statistics-by-day">
              <h3 className="statistics-by-day-title">По дням</h3>
              <ul className="statistics-by-day-list">
                {[...(data.byDay || [])].reverse().map((day) => (
                  <li key={day.date} className="statistics-by-day-row">
                    <span className="statistics-by-day-date">{formatDateShort(day.date)}</span>
                    <span className="statistics-by-day-correct">+{day.correct}</span>
                    <span className="statistics-by-day-incorrect">−{day.incorrect}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
