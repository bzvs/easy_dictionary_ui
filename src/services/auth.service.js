import axios from "axios";
import { getApiBase } from "../config";
import EventBus from "../common/EventBus";

const API_URL = getApiBase() + "/auth/";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

const register = (username, email, password) => {
  return axios.post(API_URL + "signup", {
    username,
    email,
    password,
  });
};

const login = (email, password) => {
  return axios
    .post(API_URL + "login", {
      email,
      password,
    })
    .then((response) => {
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
      }
      if (response.data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      }
      return response.data;
    });
};

/** Обновление пары токенов по refresh-токену. Выбрасывает при ошибке. */
const refreshTokens = () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    return Promise.reject(new Error("No refresh token"));
  }
  return axios
    .post(API_URL + "refresh", { refreshToken })
    .then((response) => {
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
      }
      if (response.data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  return axios.post(API_URL + "signout").catch(() => ({})).then(() => ({}));
};

const getCurrentUserToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const AuthService = {
  register,
  login,
  logout,
  refreshTokens,
  getCurrentUserToken,
  getRefreshToken,
};

export default AuthService;