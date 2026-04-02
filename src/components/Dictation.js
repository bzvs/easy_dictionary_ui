import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import SavedWordsService from '../services/savedWords.service';

const FEEDBACK_DELAY_MS = 1800;

/** Поддержка Web Speech API в браузере */
const hasSpeech = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

/** Озвучить текст через браузерный TTS. lang — код языка (ru-RU, en-US и т.д.) */
function speak(text, lang = null) {
  if (!hasSpeech() || !text) return;
  window.speechSynthesis.cancel();
  const u = new window.SpeechSynthesisUtterance(text);
  if (lang) u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

/** Эвристика: по символам текста подобрать код языка для TTS */
function guessLangForTts(text) {
  if (!text) return 'en-US';
  const cyrillic = /[\u0400-\u04FF]/.test(text);
  return cyrillic ? 'ru-RU' : 'en-US';
}

/** Нормализация для сравнения ответа */
function normalize(s) {
  return (s || '').trim().toLowerCase();
}

const Dictation = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    SavedWordsService.getWordsForReview()
      .then((res) => setWords(res.data || []))
      .catch((err) =>
        setError(err.response?.data?.message || 'Не удалось загрузить слова для диктанта')
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const current = words[index];
  const ttsSupported = hasSpeech();

  /** Озвучить текущее слово (исходное слово → пользователь вводит перевод) */
  const handleSpeak = useCallback(() => {
    if (!current) return;
    window.speechSynthesis?.cancel();
    const textToSpeak = current.sourceWord;
    const lang = guessLangForTts(textToSpeak);
    speak(textToSpeak, lang);
  }, [current]);

  const handleSubmit = () => {
    if (!current || submitting || feedback !== null) return;
    const expected = current.targetWord;
    const normalizedInput = normalize(inputValue);
    const normalizedExpected = normalize(expected);
    const isCorrect = normalizedInput === normalizedExpected;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setSubmitting(true);
    SavedWordsService.submitReview(current.uuid, isCorrect)
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        setSubmitting(false);
        setTimeout(() => {
          setFeedback(null);
          setInputValue('');
          setIndex((i) => i + 1);
          inputRef.current?.focus();
        }, FEEDBACK_DELAY_MS);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (loading) {
    return (
      <section className="page-section">
        <div className="card-modern dictation-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">Загрузка…</p>
        </div>
      </section>
    );
  }

  if (error && words.length === 0) {
    return (
      <section className="page-section">
        <div className="card-modern dictation-container">
          <Link to="/memorization" className="dictation-back" aria-label="Назад к выбору режима">
            ← Тренировка
          </Link>
          <h1 className="title-page">Диктант</h1>
          <p className="subtitle-page">Слушайте слово и введите перевод.</p>
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
        <div className="card-modern dictation-container">
          <Link to="/memorization" className="dictation-back" aria-label="Назад к выбору режима">
            ← Тренировка
          </Link>
          <h1 className="title-page">Диктант</h1>
          <p className="subtitle-page">Слушайте слово и введите перевод.</p>
          <p className="text-muted">
            Нет слов на сегодня. Добавьте слова в разделе «Мои слова» и отметьте их «На изучении».
          </p>
          <Link to="/memorization" className="btn-modern mt-2">
            К тренировке
          </Link>
        </div>
      </section>
    );
  }

  if (index >= words.length) {
    return (
      <section className="page-section">
        <div className="card-modern dictation-container dictation-done">
          <Link to="/memorization" className="dictation-back" aria-label="Назад к выбору режима">
            ← Тренировка
          </Link>
          <h1 className="title-page">Готово</h1>
          <p className="subtitle-page">Диктант завершён.</p>
          <div className="dictation-done-actions">
            <button
              type="button"
              className="btn-modern"
              onClick={() => {
                setIndex(0);
                setInputValue('');
                setFeedback(null);
                load();
              }}
            >
              Начать снова
            </button>
            <Link to="/memorization" className="btn-modern btn-outline">
              К тренировке
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section page-section-dictation">
      <div className="card-modern dictation-container">
        <Link to="/memorization" className="dictation-back" aria-label="Назад к выбору режима">
          ← Тренировка
        </Link>
        <div className="dictation-header">
          <h1 className="title-page">Диктант</h1>
          <p className="dictation-progress">
            {index + 1} / {words.length}
          </p>
        </div>
        <p className="dictation-hint">
          Вам озвучат слово. Введите перевод в поле ниже.
        </p>

        {!ttsSupported && (
          <div className="alert-error mb-2">
            Озвучка недоступна в этом браузере. Используйте Chrome, Edge или Safari.
          </div>
        )}

        {error && <div className="alert-error mb-2">{error}</div>}

        <div className="dictation-speak-row">
          <button
            type="button"
            className="btn-modern btn-dictation-speak"
            onClick={handleSpeak}
            disabled={!ttsSupported}
            aria-label="Произнести слово"
          >
            🔊 Произнести
          </button>
          {!ttsSupported && (
            <span className="dictation-word-fallback">Слово: {current.sourceWord}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="dictation-input">Ваш перевод</label>
          <input
            ref={inputRef}
            id="dictation-input"
            type="text"
            className={`dictation-input ${feedback ? (feedback === 'correct' ? 'dictation-input-correct' : 'dictation-input-wrong') : ''}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={feedback !== null}
            placeholder="Введите перевод…"
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>

        {feedback && (
          <p className={`dictation-feedback ${feedback === 'correct' ? 'dictation-feedback-correct' : 'dictation-feedback-wrong'}`}>
            {feedback === 'correct' ? 'Верно!' : `Правильный ответ: ${current.targetWord}`}
          </p>
        )}

        <button
          type="button"
          className="btn-modern btn-dictation-check"
          onClick={handleSubmit}
          disabled={submitting || feedback !== null || !inputValue.trim()}
        >
          Проверить
        </button>
      </div>
    </section>
  );
};

export default Dictation;
