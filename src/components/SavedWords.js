import React, { useState, useEffect, useCallback } from 'react';
import SavedWordsService, { WORD_STATUS } from '../services/savedWords.service';

const FILTER_ALL = null;
const FILTER_NEW = WORD_STATUS.NEW;
const FILTER_IN_STUDY = WORD_STATUS.IN_PROCESS;

const STATUS_LABELS = {
  [WORD_STATUS.NEW]: 'Новое',
  [WORD_STATUS.IN_PROCESS]: 'На изучении',
  [WORD_STATUS.LEARNED]: 'Выучено'
};

const SavedWords = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState(FILTER_ALL);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    SavedWordsService.getSavedWords(statusFilter)
      .then((res) => setList(res.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Не удалось загрузить список слов'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (uuid) => {
    setDeletingId(uuid);
    SavedWordsService.deleteSavedWord(uuid)
      .then(() => setList((prev) => prev.filter((item) => item.uuid !== uuid)))
      .catch((err) => setError(err.response?.data?.message || 'Не удалось удалить слово'))
      .finally(() => setDeletingId(null));
  };

  const handleTakeForStudy = (uuid) => {
    setUpdatingId(uuid);
    SavedWordsService.setWordStatus(uuid, WORD_STATUS.IN_PROCESS)
      .then(() => setList((prev) => prev.map((item) => (item.uuid === uuid ? { ...item, status: WORD_STATUS.IN_PROCESS } : item))))
      .catch((err) => setError(err.response?.data?.message || 'Не удалось изменить статус'))
      .finally(() => setUpdatingId(null));
  };

  const formatDate = (value) => {
    if (value == null) return '—';
    let d;
    if (Array.isArray(value)) {
      // Spring Boot Jackson может отдавать LocalDateTime как [year, month, day, hour, minute, second]
      const [y, m, day, h = 0, min = 0, s = 0] = value;
      d = new Date(y, (m != null ? m : 1) - 1, day ?? 1, h, min, s);
    } else if (typeof value === 'string') {
      d = new Date(value);
    } else {
      d = new Date(value);
    }
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <section className="page-section">
        <div className="card-modern" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">Загрузка списка слов…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section page-section-saved-words">
      <div className="card-modern">
        <h1 className="title-page">Мои слова</h1>
        <p className="subtitle-page">
          Слова, которые вы переводили.
        </p>

        {error && <div className="alert-error mb-2">{error}</div>}

        <div className="saved-words-filters">
          <button
            type="button"
            className={`saved-words-filter-btn ${statusFilter === FILTER_ALL ? 'active' : ''}`}
            onClick={() => setStatusFilter(FILTER_ALL)}
            title="Все слова"
          >
            <span className="saved-words-filter-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </span>
            <span className="saved-words-filter-btn-text">Все</span>
          </button>
          <button
            type="button"
            className={`saved-words-filter-btn ${statusFilter === FILTER_NEW ? 'active' : ''}`}
            onClick={() => setStatusFilter(FILTER_NEW)}
            title="Новые слова"
          >
            <span className="saved-words-filter-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </span>
            <span className="saved-words-filter-btn-text">Новые</span>
          </button>
          <button
            type="button"
            className={`saved-words-filter-btn ${statusFilter === FILTER_IN_STUDY ? 'active' : ''}`}
            onClick={() => setStatusFilter(FILTER_IN_STUDY)}
            title="На изучении"
          >
            <span className="saved-words-filter-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/></svg>
            </span>
            <span className="saved-words-filter-btn-text">На изучении</span>
          </button>
        </div>

        {list.length === 0 && !error && (
          <p className="text-muted" style={{ marginTop: '1rem' }}>
            {statusFilter === FILTER_NEW
              ? 'Нет новых слов.'
              : statusFilter === FILTER_IN_STUDY
                ? 'Нет слов на изучении. Отметьте новые слова кнопкой «На изучение».'
                : 'Пока нет запомненных слов. Переводите слова на странице «Перевод» — они будут добавляться сюда.'}
          </p>
        )}

        {list.length > 0 && (
          <ul className="saved-words-list">
            {list.map((item) => (
              <li key={item.uuid} className="saved-words-item">
                <div className="saved-words-content">
                  <span className="saved-words-source">{item.sourceWord}</span>
                  <span className="saved-words-arrow">→</span>
                  <span className="saved-words-target">{item.targetWord}</span>
                  <span className={`saved-words-status saved-words-status-${(item.status || WORD_STATUS.NEW).toLowerCase()}`}>
                    {STATUS_LABELS[item.status] || STATUS_LABELS[WORD_STATUS.NEW]}
                  </span>
                  <span className="saved-words-date">{formatDate(item.createdAt ?? item.createDate)}</span>
                </div>
                <div className="saved-words-actions">
                  {(item.status === WORD_STATUS.NEW || !item.status) && (
                    <button
                      type="button"
                      className="btn-study-word"
                      onClick={() => handleTakeForStudy(item.uuid)}
                      disabled={updatingId === item.uuid}
                      title="Взять на изучение"
                    >
                      <span className="saved-words-action-icon" aria-hidden>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/></svg>
                      </span>
                      <span className="saved-words-action-text">{updatingId === item.uuid ? '…' : 'На изучение'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-delete-word"
                    onClick={() => handleDelete(item.uuid)}
                    disabled={deletingId === item.uuid}
                    title="Удалить из списка"
                  >
                    <span className="saved-words-action-icon" aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </span>
                    <span className="saved-words-action-text">{deletingId === item.uuid ? '…' : 'Удалить'}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default SavedWords;
