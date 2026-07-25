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
