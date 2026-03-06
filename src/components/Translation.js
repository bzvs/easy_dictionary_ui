import React, { useState, useRef } from 'react';
import TranslationService from '../services/translation.service';

const Translation = () => {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await TranslationService.translate(inputValue.trim(), 'ENGLISH', 'RUSSIAN');
      const data = res.data;
      const text = typeof data === 'string' ? data : (data?.translation ?? data?.text ?? data?.result ?? JSON.stringify(data));
      setResult(text);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка перевода. Проверьте подключение и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section" style={{ maxWidth: '560px' }}>
      <div className="card-modern">
        <h1 className="title-page">Перевод</h1>
        <p className="subtitle-page">Введите слово на английском для перевода на русский</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="translation-input">Слово или фраза</label>
            <div className="input-with-clear">
              <input
                ref={inputRef}
                id="translation-input"
                type="text"
                className="input-modern"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Например: hello, book, good morning"
                disabled={loading}
                autoFocus
              />
              {inputValue && (
                <button
                  type="button"
                  className="input-clear-btn"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onClick={() => {
                    setInputValue('');
                    setResult(null);
                    setError(null);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  disabled={loading}
                  title="Очистить поле"
                  aria-label="Очистить поле"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <button type="submit" className="btn-modern" disabled={loading}>
            {loading ? 'Перевожу…' : 'Перевести'}
          </button>
        </form>

        {error && <div className="alert-error mt-2">{error}</div>}

        {result != null && !error && (
          <div
            className="mt-3"
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              background: 'var(--color-primary-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              Результат
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 500 }}>{result}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Translation;
