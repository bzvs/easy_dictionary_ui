/**
 * Базовый URL API. В браузере берётся из текущего хоста (чтобы работало с других устройств в сети).
 * При сборке через REACT_APP_API_URL можно задать фиксированный URL.
 */
export const getApiBase = () => {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8080`;
  }
  return process.env.REACT_APP_API_URL || "http://localhost:8080";
};
