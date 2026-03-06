import axios from "axios";
import { getApiBase } from "../config";
import AuthService from "../services/auth.service";
import EventBus from "../common/EventBus";

/**
 * Экземпляр axios для запросов с авторизацией.
 * При 401 пробует обновить токен через refresh и повторяет запрос; при неудаче — выход.
 * При 403 (нет/неверный токен) очищает сессию и перенаправляет на страницу входа.
 */
function createApiClient() {
  const instance = axios.create({ baseURL: getApiBase() });

  let refreshPromise = null;

  const clearSession = (redirectToLogin = true) => {
    refreshPromise = null;
    AuthService.logout();
    EventBus.dispatch("logout", { redirectToLogin });
  };

  instance.interceptors.request.use((config) => {
    const token = AuthService.getCurrentUserToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;

      // 403 — нет токена или доступ запрещён: очищаем сессию и перенаправляем на вход
      if (status === 403) {
        clearSession(true);
        return Promise.reject(error);
      }

      // 401 — пробуем обновить токен и повторить запрос
      if (status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (!AuthService.getRefreshToken()) {
        clearSession(true);
        return Promise.reject(error);
      }

      if (!refreshPromise) {
        refreshPromise = AuthService.refreshTokens()
          .then(() => { refreshPromise = null; })
          .catch(() => {
            clearSession(true);
            refreshPromise = null;
          });
      }

      return refreshPromise.then(() => {
        const newToken = AuthService.getCurrentUserToken();
        if (!newToken) return Promise.reject(error);
        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      });
    }
  );

  return instance;
}

export const apiClient = createApiClient();
