/**
 * Reviews moderation mocks — mirrors ReviewService::hide(). Only completed,
 * attended sessions can be reviewed in the first place (enforced at
 * submission time); the admin's only lever here is hiding a violating review.
 */

let mockAdminReviews = [
  {
    id: 901,
    studentName: 'نورة الشمري',
    teacherName: 'سلمى ياسين',
    subjectName: 'اللغة الانكليزية',
    rating: 5,
    comment: 'أسلوب رائع في الشرح وصبر كبير، استفدت كثيراً من الجلسات.',
    createdAt: '2026-07-15T18:00:00',
    isHidden: false,
    hiddenReason: null,
  },
  {
    id: 902,
    studentName: 'عبدالرحمن فهد',
    teacherName: 'فيصل الدوسري',
    subjectName: 'رياضيات',
    rating: 4,
    comment: 'شرح منظم لكن أحياناً الجلسة تتأخر قليلاً عن موعدها.',
    createdAt: '2026-07-10T20:15:00',
    isHidden: false,
    hiddenReason: null,
  },
  {
    id: 903,
    studentName: 'ليان خالد',
    teacherName: 'يوسف كريم',
    subjectName: 'برمجة',
    rating: 1,
    comment: 'محتوى الدورة سيء جداً ولا يستحق السعر المدفوع إطلاقاً!!',
    createdAt: '2026-06-20T16:30:00',
    isHidden: true,
    hiddenReason: 'محتوى غير لائق ومخالف لسياسة التقييمات الموضوعية.',
  },
  {
    id: 904,
    studentName: 'سارة الأحمد',
    teacherName: 'ريما الحربي',
    subjectName: 'تسويق رقمي',
    rating: 5,
    comment: 'من أفضل الدورات التي أخذتها، شرح عملي ومفيد جداً.',
    createdAt: '2026-06-05T14:00:00',
    isHidden: false,
    hiddenReason: null,
  },
  {
    id: 905,
    studentName: 'محمد راشد',
    teacherName: 'سلمى ياسين',
    subjectName: 'اللغة الانكليزية',
    rating: 2,
    comment: 'المعلمة لم تلتزم بخطة الدروس المتفق عليها في البداية.',
    createdAt: '2026-07-12T19:45:00',
    isHidden: false,
    hiddenReason: null,
  },
  {
    id: 906,
    studentName: 'هيا سلطان',
    teacherName: 'فيصل الدوسري',
    subjectName: 'فيزياء',
    rating: 5,
    comment: 'معلم متميز جداً ويشرح بطريقة مبسطة وواضحة.',
    createdAt: '2026-05-28T17:20:00',
    isHidden: false,
    hiddenReason: null,
  },
];

export function filterMockAdminReviews(filters = {}) {
  let result = [...mockAdminReviews];
  if (filters.visibility === 'hidden') result = result.filter((r) => r.isHidden);
  if (filters.visibility === 'visible') result = result.filter((r) => !r.isHidden);
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return result;
}

export function updateMockReview(id, patch) {
  mockAdminReviews = mockAdminReviews.map((r) => (r.id === Number(id) ? { ...r, ...patch } : r));
  return mockAdminReviews.find((r) => r.id === Number(id)) ?? null;
}

export { mockAdminReviews };
