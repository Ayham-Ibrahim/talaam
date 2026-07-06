/**
 * Package prices are ALREADY the student-facing price
 * (teacher price × 1.60 per platform policy). Backend must return the same.
 */
export const mockPackages = [
  { id: 101, teacherId: 1, title: 'جلسة وحدة', sessionsCount: 1, durationPerSession: 60, price: 50, discountPercent: null, currency: 'USD' },
  { id: 102, teacherId: 1, title: 'باقة 5 جلسات', sessionsCount: 5, durationPerSession: 60, price: 150, discountPercent: null, currency: 'USD' },
  { id: 103, teacherId: 1, title: 'باقة 10 جلسات', sessionsCount: 10, durationPerSession: 60, price: 250, discountPercent: null, currency: 'USD' },
  { id: 104, teacherId: 1, title: 'باقة 20 جلسة', sessionsCount: 20, durationPerSession: 60, price: 350, discountPercent: 15, currency: 'USD' },
  { id: 105, teacherId: 1, title: 'دورة كاملة', sessionsCount: null, durationPerSession: 60, price: 450, discountPercent: null, currency: 'USD', note: 'ثلاثة اشهر' },
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

/** Generates availability slots for a given date */
export function buildMockAvailability(teacherId, date) {
  const slots = [];
  const hours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  hours.forEach((time, i) => {
    slots.push({
      time,
      period: Number(time.split(':')[0]) < 12 ? 'صباحاً' : 'مساءً',
      available: i % 3 !== 0, // some unavailable
    });
  });
  return { teacherId, date, slots };
}

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
