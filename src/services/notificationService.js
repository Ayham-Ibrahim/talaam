import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import {
  listMockNotifications,
  countMockUnread,
  markMockNotificationRead,
  markAllMockNotificationsRead,
} from '@/mocks/notifications.mock';

export const notificationService = {
  async getNotifications() {
    if (config.useMocks) {
      await mockDelay(250);
      return listMockNotifications();
    }
    const { data } = await client.get(endpoints.notifications.list);
    return data.data;
  },

  async getUnreadCount() {
    if (config.useMocks) {
      await mockDelay(150);
      return countMockUnread();
    }
    const { data } = await client.get(endpoints.notifications.unreadCount);
    return data.data.count;
  },

  async markRead(id) {
    if (config.useMocks) {
      await mockDelay(150);
      return markMockNotificationRead(id);
    }
    const { data } = await client.post(endpoints.notifications.markRead(id));
    return data.data;
  },

  async markAllRead() {
    if (config.useMocks) {
      await mockDelay(200);
      markAllMockNotificationsRead();
      return true;
    }
    const { data } = await client.post(endpoints.notifications.markAllRead);
    return data.data;
  },
};
