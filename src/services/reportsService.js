import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** تقارير مالية مشتركة بين الأدمن والمحاسب (Gate: view-finance-reports). */
export const reportsService = {
  /** كل مدرس: الحصص التي استحق عنها، ومستحقه مطابقاً لكشوف المستحقات (مُدرَج/لم يُدرَج بعد)، وعائدها للمنصة */
  async getTeacherSessionsReport({ from, to, teacherId } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return { rows: [], totals: { sessionsCount: 0, teacherRevenue: 0, inPayoutsAmount: 0, notInPayoutsAmount: 0, platformRevenue: 0 } };
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

  /** المحاسبة المالية للدعم الأكاديمي: أرباح المنصة والتزاماتها تجاه كل داعم، لكل داعم وباقة واشتراك مدفوع */
  async getAcademicSupportFinanceReport({ from, to, supporterId } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return {
        totals: { purchasesCount: 0, supportersCount: 0, studentsPaid: 0, discountAmount: 0, supporterAmount: 0, platformAmount: 0 },
        supporters: [],
        packages: [],
        purchases: [],
        supporterOptions: [],
      };
    }
    const { data } = await client.get(endpoints.reports.academicSupportFinance, {
      params: { from: from || undefined, to: to || undefined, supporter_id: supporterId || undefined },
    });
    return data.data;
  },

  /** sheet (supporters|packages|purchases) يصدّر جدولاً واحداً؛ بدونه التقرير الشامل */
  async exportAcademicSupportFinanceReport({ from, to, supporterId, sheet } = {}) {
    if (config.useMocks) {
      await mockDelay(500);
      return new Blob(['Demo mode — no real export available.'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }
    const { data } = await client.get(endpoints.reports.exportAcademicSupportFinance, {
      params: { from: from || undefined, to: to || undefined, supporter_id: supporterId || undefined, sheet: sheet || undefined },
      responseType: 'blob',
    });
    return data;
  },

  /** تقارير الطلاب (أدمن فقط): من انتهت باقاتهم ولم يجددوا، توزيع المناهج، والنشطون أسبوعياً حسب المرحلة */
  async getStudentsReport({ weekStart } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return {
        totals: { studentsCount: 0 },
        expiredWithoutRenewal: [],
        curricula: [],
        educationTypes: [],
        weeklyActive: { weekStart: null, weekEnd: null, totalActive: 0, previousWeekTotalActive: 0, rows: [] },
      };
    }
    const { data } = await client.get(endpoints.reports.students, {
      params: { week_start: weekStart || undefined },
    });
    return data.data;
  },

  /** sheet (expired|curricula|weekly) يصدّر جدولاً واحداً؛ بدونه التقرير الشامل */
  async exportStudentsReport({ weekStart, sheet } = {}) {
    if (config.useMocks) {
      await mockDelay(500);
      return new Blob(['Demo mode — no real export available.'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }
    const { data } = await client.get(endpoints.reports.exportStudents, {
      params: { week_start: weekStart || undefined, sheet: sheet || undefined },
      responseType: 'blob',
    });
    return data;
  },
};
