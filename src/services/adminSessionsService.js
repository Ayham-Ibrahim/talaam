import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** حالات حضور تعني خصماً فعلياً من رصيد الطالب — الباك اند يرفض تعديل موعد جلسة عليها أي منها */
const RECORDED_ATTENDANCE = ['present', 'absent', 'partial'];

/** نتائج الحضور التلقائي التي تسمح بجلسة تعويضية — نفس SessionService::scheduleMakeupByAdmin */
export const COMPENSABLE_OUTCOMES = ['teacher_absent', 'student_no_show'];

/**
 * نسبة مستحق المعلم من الجلسة — نفس PayoutService::payablePercent: تُثبَّت عند انتهائها،
 * وNULL على جلسة مكتملة (قبل الحضور التلقائي) تُصرف كاملة. no_show_teacher (تسجيل يدوي قديم)
 * لا تُصرف. null = لم تُحسم بعد (قادمة) أو ملغاة.
 */
function payoutPercentOf(row) {
  if (row.status === 'no_show_teacher') return 0;
  if (row.status !== 'completed') return null;
  return row.teacher_payout_percent == null ? 100 : Number(row.teacher_payout_percent);
}

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
      // سجّله الأدمن يدوياً ولم يدخل عبر المنصة ولو مرة — SessionJoinLogService::recordByAdmin
      manual: log.join_count === 0,
    })),
    scheduledAt: row.scheduled_at,
    originalScheduledAt: row.original_scheduled_at,
    // منطقة الطالب — مواعيد الجلسة تُعرض وتُدخَل بها لا بتوقيت متصفح الأدمن (الباك اند يفسّر بها)
    studentTimezone: row.student_timezone ?? 'Asia/Dubai',
    durationMin: row.duration_min,
    status: row.status,
    isMakeup: Boolean(row.is_makeup),
    // نتيجة الحضور التلقائي بعد انتهاء الجلسة — تُرجَع للأدمن فقط
    attendanceOutcome: row.attendance_outcome ?? null,
    hasMakeup: Boolean(row.has_makeup),
    payoutPercent: payoutPercentOf(row),
    // {amount, paid, capped}: المصروف فعلاً، أو المتوقع لجلسة مكتملة لم تُصرف — null لغير المكتملة.
    // capped: سقط منها شيء بسقف الجلسات (الدورة أو الحجز) — صفر كلياً، أو حصص بعض الطلاب في المجموعة
    payoutAmount: row.teacher_payout_amount
      ? {
          amount: Number(row.teacher_payout_amount.amount),
          paid: Boolean(row.teacher_payout_amount.paid),
          capped: Boolean(row.teacher_payout_amount.capped),
        }
      : null,
    hasJoinLink: Boolean(row.join_url_teacher || row.join_url_student),
    // روابط BBB المباشرة — الباك اند يُرجع الاثنين للأدمن فقط (ClassSessionResource)
    joinUrlTeacher: row.join_url_teacher ?? null,
    joinUrlStudent: row.join_url_student ?? null,
    // نفس قيود RescheduleService::adminReschedule — يُخفي الزر مسبقاً، والباك اند يرفض 422 على أي حال
    canReschedule:
      row.status === 'scheduled' &&
      Number.isFinite(startsAt) &&
      Date.now() < startsAt &&
      !attendees.some((a) => RECORDED_ATTENDANCE.includes(a.attendance)),
    // تعويضية واحدة لجلسة منتهية غاب عنها المعلم أو الطلاب — الباك اند يرفض 422 غير ذلك
    canCreateMakeup:
      row.status === 'completed' && COMPENSABLE_OUTCOMES.includes(row.attendance_outcome) && !row.has_makeup,
  };
}

export const adminSessionsService = {
  /** جلسات معلم (teacherId) أو طالب (studentId) — ترقيم من السيرفر */
  async list({ teacherId, studentId, status, from, to, sort, page = 1, perPage = 10 } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
    }
    const { data } = await client.get(endpoints.classSessions.list, {
      params: {
        teacher_id: teacherId || undefined,
        student_id: studentId || undefined,
        status: status && status !== 'all' ? status : undefined,
        from: from || undefined,
        to: to || undefined,
        // ترتيب صريح (صفحة "الجلسات")، وإلا: القادمة أو يوم محدد → الأقرب موعداً أولاً،
        // غير ذلك → الأحدث أولاً (افتراضي الـ API).
        sort: sort ?? (status === 'upcoming' || from ? 'asc' : 'desc'),
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

  /** POST /class-sessions/{id}/makeup — جلسة جديدة بطلاب الأصلية المدفوعين، ويُبلَّغ المعلم والطلاب */
  async createMakeup(sessionId, { scheduledAt, notes }) {
    if (config.useMocks) {
      await mockDelay(400);
      return { message: 'تم إنشاء الجلسة التعويضية' };
    }
    const { data } = await client.post(endpoints.classSessions.makeup(sessionId), {
      scheduled_at: scheduledAt,
      notes: notes || undefined,
    });
    return { message: data.message };
  },

  /**
   * POST /class-sessions/{id}/attendance — حضور يدوي للمعلم (role=teacher) أو لطالب (role=student)
   * أثناء الجلسة فقط، يُحتسب كحضور طبيعي في الوقت
   */
  async markAttendance(sessionId, { role, studentId }) {
    if (config.useMocks) {
      await mockDelay(400);
      return { message: 'تم تسجيل الحضور' };
    }
    const { data } = await client.post(endpoints.classSessions.attendance(sessionId), {
      role,
      student_id: role === 'student' ? studentId : undefined,
    });
    return { message: data.message };
  },
};
