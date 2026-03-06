import './App.css';
import React, { useEffect, useState } from 'react';
import AuthService from './services/auth.service';
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Translation from "./components/Translation";
import SavedWords from "./components/SavedWords";
import Flashcards from "./components/Flashcards";
import EventBus from "./common/EventBus";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";

const App = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = AuthService.getCurrentUserToken();
    if (user) setCurrentUser(user);

    const handleLogout = (data) => {
      setCurrentUser(undefined);
      if (data?.redirectToLogin) navigate("/login");
    };
    EventBus.on("logout", handleLogout);
    return () => EventBus.remove("logout");
  }, [navigate]);

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(undefined);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";
  const isHome = location.pathname === "/" || location.pathname === "/home";

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div>
      <nav className="app-nav">
        <div className="app-nav-inner">
          <Link to="/" className="app-nav-brand" onClick={closeMobileMenu}>
            EasyDict
          </Link>
          <ul className="app-nav-links">
            <li>
              <Link to="/" className={isHome ? "nav-link active" : "nav-link"}>
                Главная
              </Link>
            </li>
            {currentUser ? (
              <>
                <li>
                  <Link to="/translation" className={isActive("/translation")}>
                    Перевод
                  </Link>
                </li>
                <li>
                  <Link to="/saved-words" className={isActive("/saved-words")}>
                    Мои слова
                  </Link>
                </li>
                <li>
                  <Link to="/flashcards" className={isActive("/flashcards")}>
                    Карточки
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className={isActive("/profile")}>
                    Профиль
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
          <div className="app-nav-right">
            {currentUser ? (
              <button type="button" className="btn-logout" onClick={handleLogout}>
                Выйти
              </button>
            ) : (
              <>
                <Link to="/login" className={isActive("/login")}>
                  Вход
                </Link>
                <Link to="/register" className={isActive("/register")}>
                  Регистрация
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="app-nav-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Меню"
          >
            <span className="app-nav-menu-icon" />
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="app-nav-overlay open"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
      <div className={`app-nav-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="app-nav-drawer-inner">
          {currentUser ? (
            <>
              <Link to="/profile" className="app-nav-drawer-link" onClick={closeMobileMenu}>
                Профиль
              </Link>
              <button type="button" className="app-nav-drawer-btn" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="app-nav-drawer-link" onClick={closeMobileMenu}>
                Вход
              </Link>
              <Link to="/register" className="app-nav-drawer-link" onClick={closeMobileMenu}>
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/translation" element={<Translation />} />
          <Route path="/saved-words" element={<SavedWords />} />
          <Route path="/flashcards" element={<Flashcards />} />
        </Routes>
      </div>

      <nav className="app-nav-bottom app-nav-bottom-three" aria-label="Основные разделы">
        <Link to="/saved-words" className={isActive("/saved-words")} onClick={closeMobileMenu}>
          Мои слова
        </Link>
        <Link to="/translation" className={isActive("/translation")} onClick={closeMobileMenu}>
          Перевод
        </Link>
        <Link to="/flashcards" className={isActive("/flashcards")} onClick={closeMobileMenu}>
          Карточки
        </Link>
      </nav>
    </div>
  );
};

export default App;
