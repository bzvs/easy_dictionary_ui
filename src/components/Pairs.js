import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SavedWordsService from '../services/savedWords.service';

const MAX_PAIRS = 8;
const MIN_PAIRS = 2;
const WRONG_FEEDBACK_MS = 800;

/** Перемешать массив (Fisher–Yates) */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Pairs = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchedUuids, setMatchedUuids] = useState(() => new Set());
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [showWrong, setShowWrong] = useState(false);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    SavedWordsService.getWordsForReview()
      .then((res) => {
        const list = res.data || [];
        setWords(list.slice(0, MAX_PAIRS));
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Не удалось загрузить слова для игры')
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { leftColumn, rightColumn } = useMemo(() => {
    if (words.length === 0) return { leftColumn: [], rightColumn: [] };
    const left = shuffle(words).map((p) => ({ uuid: p.uuid, display: p.sourceWord }));
    const right = shuffle(words).map((p) => ({ uuid: p.uuid, display: p.targetWord }));
    return { leftColumn: left, rightColumn: right };
  }, [words]);

  const handleLeftClick = (index) => {
    if (matchedUuids.has(leftColumn[index].uuid)) return;
    if (showWrong) return;

    if (selectedRight !== null) {
      const leftUuid = leftColumn[index].uuid;
      const rightUuid = rightColumn[selectedRight].uuid;
      if (leftUuid === rightUuid) {
        setMatchedUuids((prev) => new Set(prev).add(leftUuid));
        SavedWordsService.submitReview(leftUuid, true).catch(() => {});
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setShowWrong(true);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setShowWrong(false);
        }, WRONG_FEEDBACK_MS);
      }
      return;
    }

    setSelectedLeft(selectedLeft === index ? null : index);
    setSelectedRight(null);
  };

  const handleRightClick = (index) => {
    if (matchedUuids.has(rightColumn[index].uuid)) return;
    if (showWrong) return;

    if (selectedLeft !== null) {
      const leftUuid = leftColumn[selectedLeft].uuid;
      const rightUuid = rightColumn[index].uuid;
      if (leftUuid === rightUuid) {
        setMatchedUuids((prev) => new Set(prev).add(leftUuid));
        SavedWordsService.submitReview(leftUuid, true).catch(() => {});
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setShowWrong(true);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setShowWrong(false);
        }, WRONG_FEEDBACK_MS);
      }
      return;
    }

    setSelectedRight(selectedRight === index ? null : index);
    setSelectedLeft(null);
  };

  const allMatched = words.length > 0 && matchedUuids.size === words.length;

  if (loading) {
    return (
      <section className="page-section">
        <div className="card-modern pairs-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">Загрузка…</p>
        </div>
      </section>
    );
  }

  if (error && words.length === 0) {
    return (
      <section className="page-section">
        <div className="card-modern pairs-container">
          <Link to="/memorization" className="pairs-back" aria-label="Назад к выбору режима">
            ← Тренировка
          </Link>
          <h1 className="title-page">Пары</h1>
          <p className="subtitle-page">Сопоставьте слова с переводами.</p>
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
        <div className="card-modern pairs-container">
          <Link to="/memorization" className="pairs-back" aria-label="Назад к выбору режима">
            ← Тренировка
          </Link>
          <h1 className="title-page">Пары</h1>
          <p className="subtitle-page">Сопоставьте слова с переводами.</p>
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

  if (words.length < MIN_PAIRS) {
    return (
      <section className="page-section">
        <div className="card-modern pairs-container">
          <Link to="/memorization" className="pairs-back" aria-label="Назад к выбору режима">
            ← Тренировка
          </Link>
          <h1 className="title-page">Пары</h1>
          <p className="text-muted">
            Для игры нужно минимум {MIN_PAIRS} слова на повторение. Сейчас доступно {words.length}.
          </p>
          <Link to="/memorization" className="btn-modern mt-2">
            К тренировке
          </Link>
        </div>
      </section>
    );
  }

  if (allMatched) {
    return (
      <section className="page-section">
        <div className="card-modern pairs-container pairs-done">
          <Link to="/memorization" className="pairs-back" aria-label="Назад к выбору режима">
            ← Тренировка
          </Link>
          <h1 className="title-page">Готово</h1>
          <p className="subtitle-page">Все пары сопоставлены верно.</p>
          <div className="pairs-done-actions">
            <button
              type="button"
              className="btn-modern"
              onClick={() => {
                setMatchedUuids(new Set());
                load();
              }}
            >
              Играть снова
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
    <section className="page-section page-section-pairs">
      <div className="card-modern pairs-container">
        <Link to="/memorization" className="pairs-back" aria-label="Назад к выбору режима">
          ← Тренировка
        </Link>
        <div className="pairs-header">
          <h1 className="title-page">Пары</h1>
          <p className="pairs-progress">
            {matchedUuids.size} / {words.length}
          </p>
        </div>
        <p className="pairs-hint">Выберите слово слева, затем перевод справа.</p>

        {error && <div className="alert-error mb-2">{error}</div>}
        {showWrong && <p className="pairs-feedback pairs-feedback-wrong">Неверная пара</p>}

        <div className="pairs-columns">
          <div className="pairs-column">
            {leftColumn.map((item, i) => (
              <button
                key={`${item.uuid}-${i}`}
                type="button"
                className={`pairs-item ${matchedUuids.has(item.uuid) ? 'pairs-item-matched' : ''} ${selectedLeft === i ? 'pairs-item-selected' : ''}`}
                onClick={() => handleLeftClick(i)}
                disabled={matchedUuids.has(item.uuid)}
              >
                {item.display}
              </button>
            ))}
          </div>
          <div className="pairs-column">
            {rightColumn.map((item, i) => (
              <button
                key={`${item.uuid}-${i}`}
                type="button"
                className={`pairs-item ${matchedUuids.has(item.uuid) ? 'pairs-item-matched' : ''} ${selectedRight === i ? 'pairs-item-selected' : ''}`}
                onClick={() => handleRightClick(i)}
                disabled={matchedUuids.has(item.uuid)}
              >
                {item.display}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pairs;
