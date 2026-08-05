/** Used only by the "my students" pages (session-history rows, package-type badges) — unrelated to the sessions list below */
export const TEACHER_SESSION_TYPE_STYLES = {
  individual: { label: 'فردية', color: '#6BCEEE' },
  group: { label: 'جماعية', color: '#F74E28' },
  training: { label: 'دورة تدريبية', color: '#B00852' },
};

/** "الطلاب" details page session-history badge — wording differs from the teacher's own sessions table */
export const STUDENT_SESSION_HISTORY_STATUS_STYLES = {
  attended: { label: 'تم الحضور', bg: '#F0FDF2', color: '#34C759' },
  cancelled: { label: 'ملغاة', bg: '#FDF0F0', color: '#FF383C' },
};

/** Mirrors the real class_sessions.status enum exactly — every value the backend can return */
export const TEACHER_SESSION_STATUS_STYLES = {
  scheduled: { label: 'قادمة', bg: '#F0FAFD', color: '#6BCEEE' },
  reschedule_pending: { label: 'بانتظار موافقة تغيير الموعد', bg: '#FDF8F0', color: '#FF8D28' },
  rescheduled: { label: 'أُعيد جدولتها', bg: '#F0FAFD', color: '#2F80ED' },
  active: { label: 'الجلسة جارية الآن', bg: '#EAFEEF', color: '#34C759' },
  completed: { label: 'مكتملة', bg: '#F0FDF3', color: '#34C759' },
  cancelled: { label: 'ملغاة', bg: '#FDF0F0', color: '#FF383C' },
  suspended: { label: 'مؤجلة (تجميد)', bg: '#F2F2F7', color: '#6B7280' },
  no_show_student: { label: 'غياب الطالب', bg: '#FDEFF2', color: '#B00852' },
  no_show_teacher: { label: 'غياب المعلم', bg: '#FDEFF2', color: '#B00852' },
};

/** Mirrors ClassSessionResource exactly — the mock/real branches of dashboardService.getTeacherSessions() must agree on shape */
export const mockTeacherSessions = [
  {
    id: 6001,
    booking_id: 1,
    course_id: null,
    sequence_no: 3,
    scheduled_at: '2026-08-01T10:00:00',
    duration_min: 60,
    status: 'scheduled',
    started_at: null,
    ended_at: null,
    cancellation_reason: null,
    is_makeup: false,
    join_url_teacher: 'https://bbb.example.com/join/1?pw=abc',
    booking: { id: 1, package: { title: 'باقة تأسيس القواعد الإنجليزية' } },
    course: null,
    attendees: [{ id: 1, attendance: 'registered', student: { user: { name: 'محمد سالم' } } }],
  },
  {
    id: 6002,
    booking_id: 2,
    course_id: null,
    sequence_no: 1,
    scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    duration_min: 60,
    status: 'active',
    started_at: new Date().toISOString(),
    ended_at: null,
    cancellation_reason: null,
    is_makeup: false,
    join_url_teacher: 'https://bbb.example.com/join/2?pw=def',
    booking: { id: 2, package: { title: 'باقة محادثة إنجليزية مكثفة' } },
    course: null,
    attendees: [{ id: 2, attendance: 'present', student: { user: { name: 'سارة أحمد' } } }],
  },
  {
    id: 6003,
    booking_id: null,
    course_id: 9002,
    sequence_no: 5,
    scheduled_at: '2026-07-20T09:00:00',
    duration_min: 90,
    status: 'reschedule_pending',
    started_at: null,
    ended_at: null,
    cancellation_reason: null,
    is_makeup: false,
    join_url_teacher: null,
    booking: null,
    course: { title: 'دورة تحليل البيانات باستخدام Excel' },
    attendees: [
      { id: 3, attendance: 'registered', student: { user: { name: 'خالد يوسف' } } },
      { id: 4, attendance: 'registered', student: { user: { name: 'ليان محمد' } } },
    ],
  },
  {
    id: 6004,
    booking_id: 3,
    course_id: null,
    sequence_no: 4,
    scheduled_at: '2026-07-25T11:00:00',
    duration_min: 60,
    status: 'completed',
    started_at: '2026-07-25T11:00:00',
    ended_at: '2026-07-25T12:00:00',
    cancellation_reason: null,
    is_makeup: false,
    join_url_teacher: null,
    booking: { id: 3, package: { title: 'باقة فيزياء متقدمة' } },
    course: null,
    attendees: [{ id: 5, attendance: 'present', student: { user: { name: 'نورة سعيد' } } }],
  },
  {
    id: 6005,
    booking_id: 1,
    course_id: null,
    sequence_no: 2,
    scheduled_at: '2026-07-18T10:00:00',
    duration_min: 60,
    status: 'no_show_teacher',
    started_at: null,
    ended_at: null,
    cancellation_reason: 'لم يحضر المعلم الجلسة دون إشعار مسبق',
    is_makeup: false,
    join_url_teacher: null,
    booking: { id: 1, package: { title: 'باقة تأسيس القواعد الإنجليزية' } },
    course: null,
    attendees: [{ id: 6, attendance: 'excused', student: { user: { name: 'محمد سالم' } } }],
  },
  {
    id: 6006,
    booking_id: 4,
    course_id: null,
    sequence_no: 1,
    scheduled_at: '2026-07-15T14:00:00',
    duration_min: 60,
    status: 'no_show_student',
    started_at: null,
    ended_at: null,
    cancellation_reason: null,
    is_makeup: false,
    join_url_teacher: null,
    booking: { id: 4, package: { title: 'باقة قواعد متقدمة' } },
    course: null,
    attendees: [{ id: 7, attendance: 'absent', student: { user: { name: 'عبدالله فهد' } } }],
  },
  {
    id: 6007,
    booking_id: null,
    course_id: 9001,
    sequence_no: 8,
    scheduled_at: '2026-08-15T09:00:00',
    duration_min: 90,
    status: 'suspended',
    started_at: null,
    ended_at: null,
    cancellation_reason: null,
    is_makeup: false,
    join_url_teacher: null,
    booking: null,
    course: { title: 'دورة إدارة المشاريع الاحترافية PMP' },
    attendees: [{ id: 8, attendance: 'registered', student: { user: { name: 'ريم عبدالعزيز' } } }],
  },
  {
    id: 6008,
    booking_id: 2,
    course_id: null,
    sequence_no: 2,
    scheduled_at: '2026-08-03T16:00:00',
    duration_min: 60,
    status: 'rescheduled',
    started_at: null,
    ended_at: null,
    cancellation_reason: null,
    is_makeup: false,
    join_url_teacher: 'https://bbb.example.com/join/8?pw=ghi',
    booking: { id: 2, package: { title: 'باقة محادثة إنجليزية مكثفة' } },
    course: null,
    attendees: [{ id: 9, attendance: 'registered', student: { user: { name: 'سارة أحمد' } } }],
  },
  {
    id: 6009,
    booking_id: 3,
    course_id: null,
    sequence_no: 5,
    scheduled_at: '2026-07-10T11:00:00',
    duration_min: 60,
    status: 'cancelled',
    started_at: null,
    ended_at: null,
    cancellation_reason: 'طلب الطالب إلغاء الجلسة',
    is_makeup: false,
    join_url_teacher: null,
    booking: { id: 3, package: { title: 'باقة فيزياء متقدمة' } },
    course: null,
    attendees: [{ id: 10, attendance: 'registered', student: { user: { name: 'نورة سعيد' } } }],
  },
];

/** "الطلاب" (teacher students) page */
export const mockTeacherStudentStats = {
  training: 5,
  group: 5,
  individual: 5,
  total: 25,
};

const TEACHER_STUDENT_VARIANTS = [
  { type: 'individual' },
  { type: 'group' },
  { type: 'training' },
  { type: 'individual' },
  { type: 'individual' },
];

export const mockTeacherStudents = Array.from({ length: 20 }, (_, i) => {
  const variant = TEACHER_STUDENT_VARIANTS[i % TEACHER_STUDENT_VARIANTS.length];
  const studentName = 'سعيد صالح';
  const subject = 'رياضيات';
  return {
    id: 7001 + i,
    studentName,
    packageTitle: 'باقة خمس جلسات',
    type: variant.type,
    subject,
    level: 'ثانوي',
    joinDate: '10/05/2026',
    completedSessions: 1,
    remainingSessions: 5,
    nextSessionDay: 'السبت',
    nextSessionDate: '20/05/2026',
    time: '10:00 AM',
    sessions: Array.from({ length: 3 }, (_, j) => ({
      id: 8001 + i * 10 + j,
      studentName,
      studentAvatar: null,
      subject: 'اللغة الانكليزية',
      time: '10:00 ص',
      duration: 60,
      day: 'الخميس',
      date: '16 مايو',
      status: 'attended',
    })),
  };
});

/** Teacher dashboard mocks — mirrors the shape GET /dashboard/teacher must return */
export const mockTeacherStats = {
  averageRating: 4.3,
  teachingHours: 5,
  activePackagesCount: 5,
  totalStudents: 25,
};

export const mockTeacherUpcomingSessions = [
  {
    id: 1,
    sessionType: 'جلسة فردية',
    studentName: 'محمد سالم',
    studentAvatar: null,
    subject: 'اللغة الانكليزية',
    date: '16 مايو',
    day: 'الخميس',
    time: '10:00',
    period: 'ص',
    durationMinutes: 60,
    countdown: { days: 1, hours: 14, minutes: 32 },
  },
  {
    id: 2,
    sessionType: 'جلسة جماعية',
    studentName: 'محمد سالم',
    studentAvatar: null,
    subject: 'اللغة الانكليزية',
    date: '16 مايو',
    day: 'الخميس',
    time: '10:00',
    period: 'ص',
    durationMinutes: 60,
    countdown: { days: 1, hours: 14, minutes: 32 },
  },
  {
    id: 3,
    sessionType: 'دورة تدريبية',
    studentName: 'محمد سالم',
    studentAvatar: null,
    subject: 'اللغة الانكليزية',
    date: '16 مايو',
    day: 'الخميس',
    time: '10:00',
    period: 'ص',
    durationMinutes: 60,
    countdown: { days: 1, hours: 14, minutes: 32 },
  },
];

/** "باقاتي" (teacher packages management) page */
export let mockTeacherPackageStats = {
  sessionsCount: 5,
  pendingReview: 2,
  activePackagesCount: 3,
  totalPackages: 6,
};

/** Package session_format badge colors — matches CreatePackageRequest's only two real values */
export const TEACHER_PACKAGE_TYPE_STYLES = {
  individual: { label: 'فردية', color: '#6BCEEE' },
  group: { label: 'جماعية', color: '#F74E28' },
};

/** Package-status badge colors — mirrors the backend's real workflow: draft → pending_approval → active/rejected */
export const TEACHER_PACKAGE_STATUS_STYLES = {
  draft: { label: 'مسودة', bg: '#F2F2F7', color: '#6B7280' },
  pending_approval: { label: 'قيد المراجعة', bg: '#FDF8F0', color: '#FF8D28' },
  active: { label: 'نشطة', bg: '#EAFEEF', color: '#34C759' },
  full: { label: 'مكتملة العدد', bg: '#F0FAFD', color: '#2F80ED' },
  rejected: { label: 'مرفوضة', bg: '#FDEFF2', color: '#B00852' },
  disabled: { label: 'معطّلة', bg: '#F2F2F7', color: '#6B7280' },
};

/** Mirrors the real TeacherPackageResource shape exactly — no platform_margin_percent/platform_revenue (teacher never sees them) */
export let mockTeacherPackagesList = [
  {
    id: 3001,
    title: 'باقة تأسيس القواعد الإنجليزية',
    session_format: 'individual',
    capacity: 1,
    subject_id: 1,
    sessions_count: 8,
    session_duration_min: 60,
    enrolled_count: 1,
    teacher_price: 80,
    student_price: null,
    status: 'draft',
    created_at: '2026-07-20',
  },
  {
    id: 3002,
    title: 'باقة تحضير الرياضيات الجامعية',
    session_format: 'group',
    capacity: 6,
    subject_id: 1,
    sessions_count: 10,
    session_duration_min: 60,
    enrolled_count: 2,
    teacher_price: 120,
    student_price: null,
    status: 'pending_approval',
    created_at: '2026-07-18',
  },
  {
    id: 3003,
    title: 'باقة محادثة إنجليزية مكثفة',
    session_format: 'individual',
    capacity: 1,
    subject_id: 4,
    sessions_count: 12,
    session_duration_min: 60,
    enrolled_count: 1,
    teacher_price: 90,
    student_price: 144,
    status: 'active',
    created_at: '2026-06-01',
  },
  {
    id: 3004,
    title: 'باقة فيزياء متقدمة',
    session_format: 'individual',
    capacity: 1,
    subject_id: 2,
    sessions_count: 6,
    session_duration_min: 60,
    enrolled_count: 0,
    teacher_price: 100,
    student_price: null,
    status: 'rejected',
    created_at: '2026-05-10',
  },
  {
    id: 3005,
    title: 'باقة كيمياء جماعية',
    session_format: 'group',
    capacity: 4,
    subject_id: 3,
    sessions_count: 8,
    session_duration_min: 60,
    enrolled_count: 4,
    teacher_price: 70,
    student_price: 112,
    status: 'full',
    created_at: '2026-04-15',
  },
  {
    id: 3006,
    title: 'باقة قواعد متقدمة',
    session_format: 'individual',
    capacity: 1,
    subject_id: 4,
    sessions_count: 10,
    session_duration_min: 60,
    enrolled_count: 0,
    teacher_price: 85,
    student_price: 136,
    status: 'disabled',
    created_at: '2026-03-01',
  },
];

let nextTeacherPackageId = 4000;

/** Pushes a new draft package — mirrors PackageService::createDraft (POST /packages always creates a draft) */
export function createMockTeacherPackage(payload) {
  const created = {
    id: nextTeacherPackageId++,
    title: payload.title,
    session_format: payload.session_format,
    capacity: payload.capacity,
    subject_id: payload.subject_id,
    sessions_count: payload.sessions_count,
    session_duration_min: payload.session_duration_min,
    validity_days: payload.validity_days,
    discount_percent: payload.discount_percent,
    curriculum_ids: payload.curriculum_ids,
    stage_ids: payload.stage_ids,
    schedules: payload.schedules,
    enrolled_count: 0,
    teacher_price: payload.teacher_price,
    student_price: null,
    status: 'draft',
    created_at: new Date().toISOString().slice(0, 10),
  };
  mockTeacherPackagesList = [created, ...mockTeacherPackagesList];
  mockTeacherPackageStats = { ...mockTeacherPackageStats, totalPackages: mockTeacherPackageStats.totalPackages + 1 };
  return created;
}

/** Mirrors PackageService::updateDraft — throws for non-draft, exactly like the real backend */
export function updateMockTeacherPackage(id, payload) {
  const existing = mockTeacherPackagesList.find((p) => p.id === Number(id));
  if (existing?.status !== 'draft') {
    throw { message: 'لا يمكن تعديل الباقة إلا في حالة المسودة', errors: { status: ['لا يمكن تعديل الباقة إلا في حالة المسودة'] } };
  }
  mockTeacherPackagesList = mockTeacherPackagesList.map((p) => (p.id === Number(id) ? { ...p, ...payload } : p));
  return mockTeacherPackagesList.find((p) => p.id === Number(id));
}

/** Mirrors PackageService::submitForApproval — draft → pending_approval, a separate explicit action from creation */
export function submitMockTeacherPackage(id) {
  mockTeacherPackagesList = mockTeacherPackagesList.map((p) =>
    p.id === Number(id) ? { ...p, status: 'pending_approval' } : p
  );
  mockTeacherPackageStats = { ...mockTeacherPackageStats, pendingReview: mockTeacherPackageStats.pendingReview + 1 };

  return mockTeacherPackagesList.find((p) => p.id === Number(id));
}

/** "الباقات النشطة" table on the teacher home page — sessionType key colors reuse SESSION_TYPE_STYLES */
export const mockTeacherActivePackages = [
  {
    id: 1,
    packageTitle: 'باقة 5 جلسات',
    sessionType: 'individual',
    subject: 'رياضيات',
    curriculum: 'IG , American',
    sessionsCount: 5,
  },
  {
    id: 2,
    packageTitle: 'باقة 5 جلسات',
    sessionType: 'individual',
    subject: 'رياضيات',
    curriculum: 'IG , American',
    sessionsCount: 5,
  },
  {
    id: 3,
    packageTitle: 'دورة تدريبية',
    sessionType: 'individual',
    subject: 'رياضيات',
    curriculum: 'IG , American',
    sessionsCount: 5,
  },
];
