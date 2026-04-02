import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SavedWordsService from '../services/savedWords.service';

const OPTIONS_COUNT = 4;
const FEEDBACK_DELAY_MS = 1500;

/** Перемешать массив (Fisher–Yates) */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Для одного слова строим варианты ответа: правильный + до 3 неправильных.
 * В качестве пула для неправильных вариантов используются все слова пользователя (allWordsPool),
 * а не только слова на повторение — чтобы в конце сессии оставалось достаточно вариантов выбора.
 */
function buildOptionsForWord(current, wordsForReview, allWordsPool) {
  const correct = current.targetWord;
  const pool = (allWordsPool && allWordsPool.length > 0) ? allWordsPool : wordsForReview;
  const others = pool
    .filter((w) => w.uuid !== current.uuid)
    .map((w) => w.targetWord)
    .filter((t) => t && t !== correct);
  const uniqueOthers = [...new Set(others)];
  const wrongs = shuffle(uniqueOthers).slice(0, OPTIONS_COUNT - 1);
  return shuffle([correct, ...wrongs]);
}

const ChooseTranslation = () => {
  const [words, setWords] = useState([]);
  /** Все сохранённые слова пользователя — пул для вариантов ответов (чтобы хватало выбора в конце сессии) */
  const [allWordsPool, setAllWordsPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    SavedWordsService.getWordsForReview()
      .then((reviewRes) => {
        setWords(reviewRes.data || []);
        return SavedWordsService.getSavedWords().then((savedRes) => {
          setAllWordsPool(savedRes.data || []);
        }).catch(() => {
          setAllWordsPool([]);
        });
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Не удалось загрузить слова для теста')
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const current = words[index];
  const options = useMemo(
    () => (current ? buildOptionsForWord(current, words, allWordsPool) : []),
    [current?.uuid, index, words, allWordsPool]
  );

  const handleSelectOption = (option) => {
    if (!current || submitting || selectedOption !== null) return;
    const isCorrect = option === current.targetWord;
    setSelectedOption(option);
    setSubmitting(true);
    SavedWordsService.submitReview(current.uuid, isCorrect)
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        setSubmitting(false);
        setTimeout(() => {
          setSelectedOption(null);
          setIndex((i) => i + 1);
        }, FEEDBACK_DELAY_MS);
      });
  };

  if (loading) {
    return (
      <section className="page-section">
        <div className="card-modern quiz-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">Загрузка теста…</p>
        </div>
      </section>
    );
  }

  if (error && words.length === 0) {
    return (
      <section className="page-section">
        <div className="card-modern quiz-container">
          <h1 className="title-page">Выбери перевод</h1>
          <p className="subtitle-page">Тест с выбором варианта ответа.</p>
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
        <div className="card-modern quiz-container">
          <h1 className="title-page">Выбери перевод</h1>
          <p className="subtitle-page">Тест с выбором варианта ответа.</p>
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

  if (words.length < 2) {
    return (
      <section className="page-section">
        <div className="card-modern quiz-container">
          <h1 className="title-page">Выбери перевод</h1>
          <p className="text-muted">
            Для теста нужно минимум 2 слова на повторение. Сейчас доступно только одно.
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
        <div className="card-modern quiz-container quiz-done">
          <h1 className="title-page">Готово</h1>
          <p className="subtitle-page">Вы прошли тест по всем словам.</p>
          <div className="quiz-done-actions">
            <button
              type="button"
              className="btn-modern"
              onClick={() => {
                setIndex(0);
                load();
              }}
            >
              Пройти снова
            </button>
            <Link to="/memorization" className="btn-modern btn-outline">
              К тренировке
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const showFeedback = selectedOption !== null;
  const isCorrect = selectedOption === current.targetWord;

  return (
    <section className="page-section page-section-quiz">
      <div className="card-modern quiz-container">
        <div className="quiz-header">
          <Link to="/memorization" className="quiz-back" aria-label="Назад к выбору режима">
            ← Тренировка
          </Link>
          <h1 className="title-page">Выбери перевод</h1>
          <p className="quiz-progress">
            {index + 1} / {words.length}
          </p>
        </div>

        {error && <div className="alert-error mb-2">{error}</div>}

        <p className="quiz-question-word">{current.sourceWord}</p>
        <p className="quiz-question-hint">Выберите правильный перевод:</p>

        <div className="quiz-options">
          {options.map((option) => {
            let btnClass = 'btn-quiz-option';
            if (showFeedback) {
              if (option === current.targetWord) btnClass += ' btn-quiz-option-correct';
              else if (option === selectedOption) btnClass += ' btn-quiz-option-wrong';
              else btnClass += ' btn-quiz-option-dimmed';
            }
            return (
              <button
                key={option}
                type="button"
                className={btnClass}
                onClick={() => handleSelectOption(option)}
                disabled={showFeedback}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <p className={`quiz-feedback ${isCorrect ? 'quiz-feedback-correct' : 'quiz-feedback-wrong'}`}>
            {isCorrect ? 'Верно!' : `Правильный ответ: ${current.targetWord}`}
          </p>
        )}
      </div>
    </section>
  );
};

export default ChooseTranslation;
