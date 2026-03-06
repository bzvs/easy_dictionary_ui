import { apiClient } from "../api/apiClient";

const BASE_PATH = "/user/translation";

/** Значения статуса слова (совпадают с бэкендом UserTranslationStatus) */
export const WORD_STATUS = {
  NEW: "NEW",
  IN_PROCESS: "IN_PROCESS",
  LEARNED: "LEARNED"
};

/**
 * @param {string|null} [statusFilter] - NEW | IN_PROCESS | LEARNED или пусто (все)
 */
const getSavedWords = (statusFilter = null) => {
  const params = statusFilter ? { status: statusFilter } : {};
  return apiClient.get(BASE_PATH, { params });
};

const setWordStatus = (uuid, status) => {
  return apiClient.patch(`${BASE_PATH}/${uuid}/status`, { status });
};

const deleteSavedWord = (uuid) => {
  return apiClient.delete(`${BASE_PATH}/${uuid}`);
};

/** Слова для повторения на сегодня (интервальное повторение), в случайном порядке */
const getWordsForReview = () => {
  return apiClient.get(`${BASE_PATH}/review`);
};

/** Отправить результат повторения карточки: remembered true = «Помню», false = «Не помню» */
const submitReview = (uuid, remembered) => {
  return apiClient.post(`${BASE_PATH}/${uuid}/review`, { remembered });
};

const SavedWordsService = {
  getSavedWords,
  setWordStatus,
  deleteSavedWord,
  getWordsForReview,
  submitReview,
  WORD_STATUS
};

export default SavedWordsService;
