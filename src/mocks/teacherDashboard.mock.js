/** "الجلسات" (teacher sessions) page — type/status colors reuse the same tokens as elsewhere */
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

export const TEACHER_SESSION_STATUS_STYLES = {
  upcoming: { label: 'قادمة', bg: '#F0FAFD', color: '#6BCEEE' },
  attended: { label: 'مكتملة', bg: '#F0FDF3', color: '#34C759' },
  cancelled: { label: 'ملغاة', bg: '#FDF0F0', color: '#FF383C' },
};

const TEACHER_SESSION_VARIANTS = [
  { type: 'individual', status: 'upcoming' },
  { type: 'group', status: 'attended' },
  { type: 'training', status: 'upcoming' },
  { type: 'individual', status: 'upcoming' },
  { type: 'individual', status: 'upcoming' },
];

export const mockTeacherSessions = Array.from({ length: 20 }, (_, i) => {
  const variant = TEACHER_SESSION_VARIANTS[i % TEACHER_SESSION_VARIANTS.length];
  return {
    id: 6001 + i,
    packageTitle: 'باقة 5 جلسات',
    type: variant.type,
    subject: 'رياضيات',
    day: 'السبت',
    date: '20/05/2026',
    time: '10:00 AM',
    status: variant.status,
  };
});

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
  pendingReview: 5,
  activePackagesCount: 5,
  totalPackages: 25,
};

/** Package-type badge colors on the teacher's own "باقاتي" management table */
export const TEACHER_PACKAGE_TYPE_STYLES = {
  individual: { label: 'فردية', color: '#6BCEEE' },
  group: { label: 'جماعية', color: '#F74E28' },
  training: { label: 'دورة', color: '#B00852' },
};

/** Package-status badge colors — mirrors the backend's submitted → active/rejected workflow */
export const TEACHER_PACKAGE_STATUS_STYLES = {
  submitted: { label: 'قيد المراجعة', bg: '#FDF8F0', color: '#FF8D28' },
  active: { label: 'نشطة', bg: '#EAFEEF', color: '#34C759' },
  rejected: { label: 'مرفوضة', bg: '#FDEFF2', color: '#B00852' },
};

const TEACHER_PACKAGE_VARIANTS = [
  { type: 'individual', packageTitle: 'باقة 5 جلسات', seats: { filled: 1, total: 1 } },
  { type: 'group', packageTitle: 'باقة 5 جلسات', seats: { filled: 3, total: 5 } },
  { type: 'group', packageTitle: 'باقة 5 جلسات', seats: { filled: 5, total: 5 } },
  { type: 'training', packageTitle: 'دورة تدريبية', seats: null },
];

export let mockTeacherPackagesList = Array.from({ length: 42 }, (_, i) => {
  const variant = TEACHER_PACKAGE_VARIANTS[i % TEACHER_PACKAGE_VARIANTS.length];
  return {
    id: 3001 + i,
    packageTitle: variant.packageTitle,
    type: variant.type,
    subject: 'رياضيات',
    seats: variant.seats,
    status: 'active',
    price: 250,
  };
});

/** Slots already booked by one of the teacher's other packages — shown as disabled cells in the scheduling grid */
export const mockTeacherBookedSlots = [{ day: 'monday', hour: 11 }];

export const SESSION_DURATION_MINUTES = 60;

let nextTeacherPackageId = 5000;

/** Pushes a new draft package (status "submitted") — mirrors PackageService::createDraft */
export function createMockTeacherPackage({ packageTitle, type, subject, sessionsCount, price }) {
  const created = {
    id: nextTeacherPackageId++,
    packageTitle,
    type,
    subject,
    seats: type === 'group' ? { filled: 0, total: 5 } : null,
    status: 'submitted',
    price,
  };
  mockTeacherPackagesList = [created, ...mockTeacherPackagesList];
  mockTeacherPackageStats = {
    ...mockTeacherPackageStats,
    pendingReview: mockTeacherPackageStats.pendingReview + 1,
    totalPackages: mockTeacherPackageStats.totalPackages + 1,
  };
  return created;
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
