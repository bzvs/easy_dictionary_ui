import { apiClient } from '../api/apiClient';

const SETTINGS_PATH = '/user/settings';
const PUSH_SUBSCRIPTION_PATH = '/user/settings/push-subscription';

/**
 * Получить настройки пользователя с бэкенда (включая vapidPublicKey для push).
 */
export const getSettings = () => apiClient.get(SETTINGS_PATH).then((res) => res.data);

/**
 * Обновить настройки на бэкенде.
 * @param {{ notificationsEnabled?: boolean, reminderTime?: string, reminderOnlyIfWords?: boolean }} payload
 */
export const updateSettings = (payload) =>
  apiClient.put(SETTINGS_PATH, payload).then((res) => res.data);

/**
 * Сохранить Web Push подписку на бэкенде (для отправки уведомлений с сервера).
 * @param {{ endpoint: string, keys: { p256dh: string, auth: string } }} subscription - объект из pushManager.subscribe()
 */
export const savePushSubscription = (subscription) => {
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return Promise.reject(new Error('Invalid subscription'));
  }
  return apiClient.post(PUSH_SUBSCRIPTION_PATH, {
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });
};

export default { getSettings, updateSettings, savePushSubscription };
