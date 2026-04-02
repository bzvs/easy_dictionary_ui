import { apiClient } from '../api/apiClient';

/**
 * Получить статистику за период.
 * @param {number} [periodDays=30] — период в днях (7, 30, 90)
 */
export const getStatistics = (periodDays = 30) =>
  apiClient.get('/user/statistics', { params: { periodDays } }).then((res) => res.data);
