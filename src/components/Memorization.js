import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Flashcards from './Flashcards';
import ChooseTranslation from './ChooseTranslation';
import Pairs from './Pairs';
import Dictation from './Dictation';

/** Обобщающая страница «Тренировка»: выбор режима — карточки, выбери перевод, пары или диктант */
function MemorizationIndex() {
  return (
    <section className="page-section page-section-memorization">
      <div className="card-modern memorization-container">
        <h1 className="title-page">Тренировка</h1>
        <p className="subtitle-page">
          Выберите способ повторения: карточки, тест, пары или диктант (озвучка слова).
        </p>
        <div className="memorization-modes">
          <Link to="/memorization/cards" className="memorization-mode-card">
            <span className="memorization-mode-icon" aria-hidden>🃏</span>
            <span className="memorization-mode-title">Карточки</span>
            <span className="memorization-mode-desc">Переворот карточки, «Помню» / «Не помню»</span>
          </Link>
          <Link to="/memorization/quiz" className="memorization-mode-card">
            <span className="memorization-mode-icon" aria-hidden>✓</span>
            <span className="memorization-mode-title">Выбери перевод</span>
            <span className="memorization-mode-desc">Вопрос и 4 варианта ответа</span>
          </Link>
          <Link to="/memorization/pairs" className="memorization-mode-card">
            <span className="memorization-mode-icon" aria-hidden>⇄</span>
            <span className="memorization-mode-title">Пары</span>
            <span className="memorization-mode-desc">Сопоставьте слова с переводами</span>
          </Link>
          <Link to="/memorization/dictation" className="memorization-mode-card">
            <span className="memorization-mode-icon" aria-hidden>🔊</span>
            <span className="memorization-mode-title">Диктант</span>
            <span className="memorization-mode-desc">Слушайте слово и введите перевод</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

const Memorization = () => (
  <Routes>
    <Route index element={<MemorizationIndex />} />
    <Route path="cards" element={<Flashcards />} />
    <Route path="quiz" element={<ChooseTranslation />} />
    <Route path="pairs" element={<Pairs />} />
    <Route path="dictation" element={<Dictation />} />
  </Routes>
);

export default Memorization;
