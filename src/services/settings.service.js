/** Настройки приложения (localStorage). Ключи с префиксом для изоляции. */
const PREFIX = 'easyDict_';

const KEYS = {
  NOTIFICATIONS_ENABLED: PREFIX + 'notificationsEnabled',
  REMINDER_TIME: PREFIX + 'reminderTime',
  REMINDER_ONLY_IF_WORDS: PREFIX + 'reminderOnlyIfWords',
  REMINDER_LAST_SHOWN_DATE: PREFIX + 'reminderLastShownDate',
};

const DEFAULT_TIME = '09:00';
const DEFAULT_ONLY_IF_WORDS = true;

const getBool = (key, defaultValue) => {
  const v = localStorage.getItem(key);
  if (v === null) return defaultValue;
  return v === 'true';
};

const setBool = (key, value) => {
  localStorage.setItem(key, String(!!value));
};

const getString = (key, defaultValue) => {
  const v = localStorage.getItem(key);
  return v !== null ? v : defaultValue;
};

/** Включены ли напоминания */
export const getNotificationsEnabled = () =>
  getBool(KEYS.NOTIFICATIONS_ENABLED, false);

export const setNotificationsEnabled = (value) => {
  setBool(KEYS.NOTIFICATIONS_ENABLED, value);
};

/** Время напоминания "HH:MM" (например "09:00") */
export const getReminderTime = () =>
  getString(KEYS.REMINDER_TIME, DEFAULT_TIME);

export const setReminderTime = (value) => {
  localStorage.setItem(KEYS.REMINDER_TIME, String(value));
};

/** Напоминать только если есть слова на повторение */
export const getReminderOnlyIfWords = () =>
  getBool(KEYS.REMINDER_ONLY_IF_WORDS, DEFAULT_ONLY_IF_WORDS);

export const setReminderOnlyIfWords = (value) => {
  setBool(KEYS.REMINDER_ONLY_IF_WORDS, value);
};

/** Дата последнего показа напоминания "YYYY-MM-DD" */
export const getReminderLastShownDate = () =>
  localStorage.getItem(KEYS.REMINDER_LAST_SHOWN_DATE) || null;

export const setReminderLastShownDate = (dateStr) => {
  if (dateStr) localStorage.setItem(KEYS.REMINDER_LAST_SHOWN_DATE, dateStr);
};

/** Текущая дата в формате YYYY-MM-DD по локальной тайм-зоне */
export const getTodayDateString = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

/** Проверка: прошло ли уже заданное время сегодня (сравниваем часы и минуты) */
export const isReminderTimeReached = (timeStr) => {
  const [h, m] = (timeStr || DEFAULT_TIME).split(':').map(Number);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = (h || 9) * 60 + (m || 0);
  return nowMinutes >= targetMinutes;
};

const SettingsService = {
  getNotificationsEnabled,
  setNotificationsEnabled,
  getReminderTime,
  setReminderTime,
  getReminderOnlyIfWords,
  setReminderOnlyIfWords,
  getReminderLastShownDate,
  setReminderLastShownDate,
  getTodayDateString,
  isReminderTimeReached,
  DEFAULT_TIME,
  KEYS,
};

export default SettingsService;
