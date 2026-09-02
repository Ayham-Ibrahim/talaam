import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/**
 * رؤية الأدمن على محاولات إرسال الإشعارات (بريد أساساً) — بلا هذه، لا طريقة
 * لمعرفة أن بريد ترحيب معلم/طالب مستورَد فشل فعلياً قبل أن يشتكي هو بنفسه.
 */
export const adminNotificationLogsService = {
  async getLogs(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return { data: [], total: 0 };
    }
    const { data } = await client.get(endpoints.admin.notificationLogs, { params: filters });
    return { data: data.data, total: data.meta?.total ?? data.data.length };
  },
};
