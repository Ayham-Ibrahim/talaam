import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** حالات حضور تعني خصماً فعلياً من رصيد الطالب — الباك اند يرفض تعديل موعد جلسة عليها أي منها */
const RECORDED_ATTENDANCE = ['present', 'absent', 'partial'];

/** GET /class-sessions row → صف جدول جلسات الأدمن (ملف المعلم / جلسات الطالب) */
function mapSessionRow(row) {
  const attendees = row.attendees ?? [];
  const startsAt = row.scheduled_at ? new Date(row.scheduled_at).getTime() : NaN;

  return {
    id: row.id,
    title: row.booking?.package?.title ?? row.course?.title ?? null,
    category: row.course_id ? 'training' : (row.booking?.package?.session_format ?? null),
    teacherName: row.teacher?.user?.name ?? null,
    studentNames: attendees.map((a) => a.student?.user?.name).filter(Boolean),
    students: attendees.map((a) => ({ studentId: a.student_id, name: a.student?.user?.name ?? null })),
    // سجل الانضمام (زر "انضم") — يُرجعه الباك اند للأدمن فقط
    // false = الجلسة بدأت قبل بدء تسجيل الانضمام، فلا يُستنتج منها "لم يحضر"
    joinTracked: Boolean(row.join_tracked),
    joinLogs: (row.join_logs ?? []).map((log) => ({
      role: log.role,
      studentId: log.student_id,
      firstJoinedAt: log.first_joined_at,
    })),
    scheduledAt: row.scheduled_at,
    originalScheduledAt: row.original_scheduled_at,
    durationMin: row.duration_min,
    status: row.status,
    isMakeup: Boolean(row.is_makeup),
    hasJoinLink: Boolean(row.join_url_teacher || row.join_url_student),
    // نفس قيود RescheduleService::adminReschedule — يُخفي الزر مسبقاً، والباك اند يرفض 422 على أي حال
    canReschedule:
      row.status === 'scheduled' &&
      Number.isFinite(startsAt) &&
      Date.now() < startsAt &&
      !attendees.some((a) => RECORDED_ATTENDANCE.includes(a.attendance)),
  };
}

export const adminSessionsService = {
  /** جلسات معلم (teacherId) أو طالب (studentId) — ترقيم من السيرفر */
  async list({ teacherId, studentId, status, page = 1, perPage = 10 } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
    }
    const { data } = await client.get(endpoints.classSessions.list, {
      params: {
        teacher_id: teacherId || undefined,
        student_id: studentId || undefined,
        status: status && status !== 'all' ? status : undefined,
        // القادمة: الأقرب موعداً أولاً. غير ذلك: الأحدث أولاً (افتراضي الـ API).
        sort: status === 'upcoming' ? 'asc' : 'desc',
        page,
        per_page: perPage,
      },
    });
    return { data: data.data.map(mapSessionRow), meta: data.meta };
  },

  /** PATCH /class-sessions/{id}/schedule — رابط الجلسة لا يتغير، ويُبلَّغ المعلم والطلاب */
  async reschedule(sessionId, { scheduledAt, notes }) {
    if (config.useMocks) {
      await mockDelay(400);
      return { message: 'تم تعديل موعد الجلسة' };
    }
    const { data } = await client.patch(endpoints.classSessions.reschedule(sessionId), {
      scheduled_at: scheduledAt,
      notes: notes || undefined,
    });
    return { message: data.message };
  },
};
