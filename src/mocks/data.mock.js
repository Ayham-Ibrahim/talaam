/**
 * Package prices are ALREADY the student-facing price
 * (teacher price × 1.60 per platform policy). Backend must return the same.
 */
const INDIVIDUAL_SCHEDULE = [
  { id: 1001, day_of_week: 0, start_time: '10:00', end_time: '11:00' },
  { id: 1002, day_of_week: 2, start_time: '16:00', end_time: '17:00' },
];

/**
 * Group packages have no recurring weekly pattern — the teacher picks an
 * explicit calendar date per session (GroupSessionDatesPicker), so this is a
 * flat list of {date, start_time}, one entry per session, matching exactly
 * what PackageService::syncSchedules stores for a group package.
 */
const GROUP_SCHEDULE_PAST = [
  { id: 2001, date: '2026-07-09', start_time: '18:00' },
  { id: 2002, date: '2026-07-16', start_time: '18:00' },
  { id: 2003, date: '2026-07-23', start_time: '18:00' },
  { id: 2004, date: '2026-07-30', start_time: '18:00' },
  { id: 2005, date: '2026-08-06', start_time: '18:00' },
  { id: 2006, date: '2026-08-13', start_time: '18:00' },
  { id: 2007, date: '2026-08-20', start_time: '18:00' },
  { id: 2008, date: '2026-08-27', start_time: '18:00' },
];
const GROUP_SCHEDULE_UPCOMING = [
  { id: 2101, date: '2026-09-08', start_time: '18:00' },
  { id: 2102, date: '2026-09-15', start_time: '18:00' },
  { id: 2103, date: '2026-09-22', start_time: '18:00' },
  { id: 2104, date: '2026-09-29', start_time: '18:00' },
  { id: 2105, date: '2026-10-06', start_time: '18:00' },
  { id: 2106, date: '2026-10-13', start_time: '18:00' },
  { id: 2107, date: '2026-10-20', start_time: '18:00' },
  { id: 2108, date: '2026-10-27', start_time: '18:00' },
];

export const mockPackages = [
  { id: 101, teacherId: 1, title: 'جلسة وحدة', sessionFormat: 'individual', sessionsCount: 1, durationPerSession: 60, price: 50, discountPercent: null, currency: 'USD', schedules: INDIVIDUAL_SCHEDULE },
  { id: 102, teacherId: 1, title: 'باقة 5 جلسات', sessionFormat: 'individual', sessionsCount: 5, durationPerSession: 60, price: 150, discountPercent: null, currency: 'USD', schedules: INDIVIDUAL_SCHEDULE },
  { id: 103, teacherId: 1, title: 'باقة 10 جلسات', sessionFormat: 'individual', sessionsCount: 10, durationPerSession: 60, price: 250, discountPercent: null, currency: 'USD', schedules: INDIVIDUAL_SCHEDULE },
  { id: 104, teacherId: 1, title: 'باقة 20 جلسة', sessionFormat: 'individual', sessionsCount: 20, durationPerSession: 60, price: 350, discountPercent: 15, currency: 'USD', schedules: INDIVIDUAL_SCHEDULE },
  { id: 105, teacherId: 1, title: 'مجموعة تحضير الامتحانات (منتهية)', sessionFormat: 'group', sessionsCount: 8, durationPerSession: 60, price: 450, discountPercent: null, currency: 'USD', schedules: GROUP_SCHEDULE_PAST },
  { id: 106, teacherId: 1, title: 'مجموعة تحضير الامتحانات', sessionFormat: 'group', sessionsCount: 8, durationPerSession: 60, price: 450, discountPercent: null, currency: 'USD', schedules: GROUP_SCHEDULE_UPCOMING },
];

export const mockReviews = [
  { id: 201, teacherId: 1, studentName: 'سعيد صالح', studentAvatar: null, rating: 4, comment: 'دروس منظمة جدا ومفيدة لقد استفدت كثيرا شكرا للمنصة وللمدرس', createdAt: '2026-05-14' },
  { id: 202, teacherId: 1, studentName: 'سعيد صالح', studentAvatar: null, rating: 5, comment: 'دروس منظمة جدا ومفيدة لقد استفدت كثيرا شكرا للمنصة وللمدرس', createdAt: '2026-05-10' },
  { id: 203, teacherId: 1, studentName: 'منى العلي', studentAvatar: null, rating: 5, comment: 'أسلوب رائع في الشرح وصبر كبير مع الطلاب، أنصح به بشدة.', createdAt: '2026-05-02' },
];

export const mockRatingSummary = {
  teacherId: 1,
  average: 4.5,
  total: 2256896,
  distribution: { 5: 60, 4: 25, 3: 8, 2: 4, 1: 3 },
};

export const mockFilters = {
  levels: [
    { value: 'school', label: 'مدرسي' },
    { value: 'university', label: 'جامعي' },
    { value: 'training', label: 'دورات تدريبية' },
  ],
  grades: Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `الصف ${i + 1}` })),
  subjects: [
    { value: 'english', label: 'اللغة الإنجليزية' },
    { value: 'math', label: 'الرياضيات' },
    { value: 'physics', label: 'الفيزياء' },
    { value: 'chemistry', label: 'الكيمياء' },
  ],
  stages: [
    { value: 'primary', label: 'ابتدائي' },
    { value: 'middle', label: 'متوسط' },
    { value: 'secondary', label: 'ثانوي' },
    { value: 'university', label: 'جامعي' },
  ],
  languages: [
    { value: 'ar', label: 'عربي' },
    { value: 'en', label: 'إنجليزي' },
    { value: 'fr', label: 'فرنسي' },
  ],
  curricula: [
    { value: 'MOE', label: 'وزارة التربية' },
    { value: 'American', label: 'أمريكي' },
    { value: 'British', label: 'بريطاني' },
    { value: 'Cambridge', label: 'Cambridge' },
    { value: 'IB', label: 'IB' },
  ],
  priceRange: { min: 50, max: 550 },
};

export const mockStats = [
  { key: 'rating', value: 15000, label: 'متوسط التقييم', icon: 'star' },
  { key: 'students', value: 15000, label: 'طالب نشط', icon: 'graduation' },
  { key: 'sessions', value: 15000, label: 'جلسة مكتملة', icon: 'book' },
  { key: 'teachers', value: 15000, label: 'معلم معتمد', icon: 'users' },
];
