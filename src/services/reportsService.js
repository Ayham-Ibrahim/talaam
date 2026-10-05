import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** تقارير مالية مشتركة بين الأدمن والمحاسب (Gate: view-finance-reports). */
export const reportsService = {
  /** كل مدرس: عدد الحصص المحقَّقة فعلاً (حضور حقيقي، لا مجرد انقضاء الوقت) وعائدها للمنصة */
  async getTeacherSessionsReport({ from, to, teacherId } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return { rows: [], totals: { sessionsCount: 0, teacherRevenue: 0, platformRevenue: 0 } };
    }
    const { data } = await client.get(endpoints.reports.teacherSessions, {
      params: { from: from || undefined, to: to || undefined, teacher_id: teacherId || undefined },
    });
    return data.data;
  },

  async exportTeacherSessionsReport({ from, to, teacherId } = {}) {
    if (config.useMocks) {
      await mockDelay(500);
      return new Blob(['Demo mode — no real export available.'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }
    const { data } = await client.get(endpoints.reports.exportTeacherSessions, {
      params: { from: from || undefined, to: to || undefined, teacher_id: teacherId || undefined },
      responseType: 'blob',
    });
    return data;
  },
};
