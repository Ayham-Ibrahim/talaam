/**
 * Training-center courses — mirrors TeacherCourseResource exactly. Courses are
 * a completely separate backend resource from packages (own fields, own
 * draft → pending_approval → active workflow, own create/submit endpoints).
 */

export const COURSE_LEVEL_LABELS = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

export const COURSE_DELIVERY_MODE_LABELS = {
  online: 'عن بعد',
  onsite: 'حضوري',
  hybrid: 'مدمج',
  recorded: 'مسجّل',
};

export const TEACHER_COURSE_STATUS_STYLES = {
  draft: { label: 'مسودة', bg: '#F2F2F7', color: '#6B7280' },
  pending_approval: { label: 'قيد المراجعة', bg: '#FDF8F0', color: '#FF8D28' },
  active: { label: 'نشطة', bg: '#EAFEEF', color: '#34C759' },
  full: { label: 'مكتملة العدد', bg: '#F0FAFD', color: '#2F80ED' },
  rejected: { label: 'مرفوضة', bg: '#FDEFF2', color: '#B00852' },
  disabled: { label: 'معطّلة', bg: '#F2F2F7', color: '#6B7280' },
};

export let mockTeacherCoursesList = [
  {
    id: 9001,
    title: 'دورة إدارة المشاريع الاحترافية PMP',
    course_field_id: 1,
    subject_id: null,
    level: 'advanced',
    delivery_mode: 'online',
    start_date: '2026-08-10',
    end_date: '2026-09-10',
    total_sessions: 20,
    session_duration_min: 90,
    max_seats: 25,
    enrolled_count: 4,
    provider_price: 250,
    student_price: null,
    status: 'draft',
    created_at: '2026-07-22',
  },
  {
    id: 9002,
    title: 'دورة تحليل البيانات باستخدام Excel',
    course_field_id: 3,
    subject_id: null,
    level: 'intermediate',
    delivery_mode: 'hybrid',
    start_date: '2026-08-01',
    end_date: '2026-08-20',
    total_sessions: 15,
    session_duration_min: 60,
    max_seats: 30,
    enrolled_count: 10,
    provider_price: 180,
    student_price: 279,
    status: 'active',
    created_at: '2026-07-01',
  },
];

let nextTeacherCourseId = 9100;

/** POST /courses always creates a draft — mirrors CourseService::createDraft */
export function createMockTeacherCourse(payload) {
  const created = {
    id: nextTeacherCourseId++,
    ...payload,
    enrolled_count: 0,
    student_price: null,
    status: 'draft',
    created_at: new Date().toISOString().slice(0, 10),
  };
  mockTeacherCoursesList = [created, ...mockTeacherCoursesList];
  return created;
}

/** draft → pending_approval, mirrors CourseService::submitForApproval */
export function submitMockTeacherCourse(id) {
  mockTeacherCoursesList = mockTeacherCoursesList.map((c) => (c.id === Number(id) ? { ...c, status: 'pending_approval' } : c));

  return mockTeacherCoursesList.find((c) => c.id === Number(id));
}
