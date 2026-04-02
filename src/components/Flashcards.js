import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SavedWordsService from '../services/savedWords.service';

const AUTO_NEXT_DELAY_MS = 1800;
/** Длительность анимации переворота в CSS (0.5s) — переключаем слово только после неё */
const FLIP_DURATION_MS = 500;

const Flashcards = () => {
  const location = useLocation();
  const isUnderMemorization = location.pathname.startsWith('/memorization');
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    SavedWordsService.getWordsForReview()
      .then((res) => setWords(res.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Не удалось загрузить слова для повторения'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const current = words[index];

  const handleAnswer = (remembered) => {
    if (!current || submitting || flipped) return;
    setSubmitting(true);
    SavedWordsService.submitReview(current.uuid, remembered)
      .then(() => {
        setFlipped(true);
        setSubmitting(false);
        setTimeout(() => {
          setFlipped(false);
          setTimeout(() => {
            setIndex((i) => i + 1);
          }, FLIP_DURATION_MS);
        }, AUTO_NEXT_DELAY_MS);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Не удалось сохранить результат');
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <section className="page-section">
        <div className="card-modern flashcards-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">Загрузка карточек…</p>
        </div>
      </section>
    );
  }

  if (error && words.length === 0) {
    return (
      <section className="page-section">
        <div className="card-modern flashcards-container">
          {isUnderMemorization && (
            <Link to="/memorization" className="flashcards-back" aria-label="Назад к выбору режима">
              ← Тренировка
            </Link>
          )}
          <h1 className="title-page">Карточки</h1>
          <p className="subtitle-page">Повторение слов с интервальным запоминанием.</p>
          <div className="alert-error mb-2">{error}</div>
          <button type="button" className="btn-modern" onClick={load}>
            Повторить загрузку
          </button>
        </div>
      </section>
    );
  }

  if (words.length === 0) {
    return (
      <section className="page-section">
        <div className="card-modern flashcards-container">
          {isUnderMemorization && (
            <Link to="/memorization" className="flashcards-back" aria-label="Назад к выбору режима">
              ← Тренировка
            </Link>
          )}
          <h1 className="title-page">Карточки</h1>
          <p className="subtitle-page">Повторение слов с интервальным запоминанием.</p>
          <p className="text-muted">
            Нет слов на сегодня. Добавьте слова в разделе «Мои слова» и отметьте их «На изучении» — они появятся здесь.
          </p>
          {isUnderMemorization && (
            <Link to="/memorization" className="btn-modern mt-2">
              К тренировке
            </Link>
          )}
        </div>
      </section>
    );
  }

  if (index >= words.length) {
    return (
      <section className="page-section">
        <div className="card-modern flashcards-container flashcards-done">
          {isUnderMemorization && (
            <Link to="/memorization" className="flashcards-back" aria-label="Назад к выбору режима">
              ← Тренировка
            </Link>
          )}
          <h1 className="title-page">Готово</h1>
          <p className="subtitle-page">Вы повторили все карточки на сегодня.</p>
          <div className="flashcards-done-actions">
            <button type="button" className="btn-modern" onClick={() => { setIndex(0); load(); }}>
              Загрузить снова
            </button>
            {isUnderMemorization && (
              <Link to="/memorization" className="btn-modern btn-outline">
                К тренировке
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section page-section-flashcards">
      <div className="card-modern flashcards-container">
        {isUnderMemorization && (
          <Link to="/memorization" className="flashcards-back" aria-label="Назад к выбору режима">
            ← Тренировка
          </Link>
        )}
        <div className="flashcards-header">
          <h1 className="title-page">Карточки</h1>
          <p className="flashcards-progress">
            {index + 1} / {words.length}
          </p>
        </div>

        {error && <div className="alert-error mb-2">{error}</div>}

        <div
          className={`flashcard ${flipped ? 'flipped' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={flipped ? `Перевод: ${current.targetWord}` : `Слово: ${current.sourceWord}`}
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <p className="flashcard-word">{current.sourceWord}</p>
              <p className="flashcard-hint">Нажмите «Помню» или «Не помню»</p>
            </div>
            <div className="flashcard-back">
              <p className="flashcard-word flashcard-word-target">{current.targetWord}</p>
            </div>
          </div>
        </div>

        <div className="flashcards-actions">
          <button
            type="button"
            className="btn-flashcard btn-flashcard-no"
            onClick={() => handleAnswer(false)}
            disabled={submitting || flipped}
          >
            Не помню
          </button>
          <button
            type="button"
            className="btn-flashcard btn-flashcard-yes"
            onClick={() => handleAnswer(true)}
            disabled={submitting || flipped}
          >
            Помню
          </button>
        </div>
      </div>
    </section>
  );
};

export default Flashcards;
