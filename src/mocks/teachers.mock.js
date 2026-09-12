/**
 * Mock teachers — mirrors the EXACT shape the backend must return.
 * Avatars are null (students upload later per the platform policy).
 */

const SUBJECTS_POOL = [
  'المحادثة بالانكليزية',
  'الانجليزية للاعمال',
  'تحضير IELTS',
  'القواعد والمفردات',
  'الرياضيات',
  'الفيزياء',
  'الكيمياء',
];

const buildTeacher = (id, overrides = {}) => ({
  id,
  name: 'أ. أحمد الشمري',
  avatar: null,
  type: 'university',
  typeLabel: 'مدرس رياضيات',
  isVerified: true,
  rating: 4.9,
  reviewsCount: 5235,
  studentsCount: 512,
  completedSessions: 1200,
  satisfactionRate: 92,
  stageLabel: 'مرحلة جامعية',
  experienceYears: 5,
  experienceLabel: 'أكثر من 5 سنوات خبرة',
  experienceShort: '+5 سنوات',
  city: 'الإمارات',
  bio: 'معلم متخصص في مناهج Cambridge و Edexcel و IB واختبارات IELTS/TOEFL، بخبرة أكثر من ثماني سنوات في تدريس الطلاب من مختلف المراحل الدراسية. أومن أن كل طالب قادر على تحقيق التفوق عند توفير الأسلوب المناسب والبيئة الداعمة، لذلك أركز على تبسيط المفاهيم وبناء أساسيات قوية قبل الانتقال إلى المسائل المتقدمة، مع متابعة فردية لكل طالب وتقارير دورية لولي الأمر.',
  introVideoUrl: null,
  introYoutubeId: 'M7lc1UVf-VE',
  introVideoDuration: '1:26',
  qualifications: ['بكالوريوس رياضيات', 'ماجستير', 'شهادات تدريس معتمدة'],
  experiences: [
    { id: 1, title: 'مدرس في مدارس خاصة في دبي', period: '2019 - 2022' },
    { id: 2, title: 'مدرس في أكاديمية تعليمية', period: '2022 - الآن' },
    { id: 3, title: 'خبرة في مناهج British / American / IB', period: '' },
  ],
  subjects: SUBJECTS_POOL.slice(0, 4),
  curricula: ['بريطاني', 'أمريكي', 'A-Level', 'IGCSE'],
  stages: ['الابتدائي', 'المتوسط', 'الثانوي', 'الجامعي'],
  grades: [10, 11, 12],
  examPrep: ['SAT', 'ACT', 'IB', 'IGCSE'],
  languages: [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'الإنجليزية' },
  ],
  teachingMethods: ['شرح مباشر', 'حل واجبات', 'تدريب امتحانات', 'تدريب عملي', 'مشاريع'],
  sessionTypes: ['فردية', 'جماعية', 'دورة', 'ورشة عمل'],
  badges: [
    { label: 'مؤهلات جامعية', icon: '🎓' },
    { label: 'فحص أمني', icon: '🛡️' },
    { label: 'معلم مميز', icon: '🥇' },
    { label: 'مركز معتمد', icon: '🏅' },
  ],
  minPrice: 50,
  currency: 'USD',
  ...overrides,
});

export const mockTeachers = [
  buildTeacher(1, {
    name: 'ياسر معروف',
    type: 'school',
    typeLabel: 'مدرسي',
    stageLabel: 'مرحلة ثانوية',
    rating: 4.9,
    reviewsCount: 5235,
  }),
  buildTeacher(2, { name: 'أ. أحمد الشمري', minPrice: 50, rating: 4.9 }),
  buildTeacher(3, { name: 'أ. سارة العتيبي', type: 'school', typeLabel: 'مدرسي', rating: 4.8, minPrice: 60 }),
  buildTeacher(4, { name: 'أ. خالد النعيمي', type: 'training', typeLabel: 'مدرب', rating: 4.7, minPrice: 80 }),
  buildTeacher(5, { name: 'أ. منى الحربي', rating: 5.0, minPrice: 120 }),
  buildTeacher(6, { name: 'أ. عبدالله سليم', type: 'school', typeLabel: 'مدرسي', rating: 4.6, minPrice: 45 }),
  buildTeacher(7, { name: 'أ. ريم القحطاني', type: 'university', typeLabel: 'مدرس جامعي', rating: 4.9, minPrice: 90 }),
  buildTeacher(8, { name: 'أ. فهد الدوسري', type: 'training', typeLabel: 'مدرب', rating: 4.5, minPrice: 70 }),
  buildTeacher(9, { name: 'أ. نورة الشهري', type: 'university', typeLabel: 'مدرس جامعي', rating: 4.8, minPrice: 100 }),
  buildTeacher(10, { name: 'أ. سلطان العنزي', type: 'school', typeLabel: 'مدرسي', rating: 4.4, minPrice: 55 }),
  buildTeacher(11, { name: 'أ. جواهر المطيري', type: 'training', typeLabel: 'مدرب', rating: 4.9, minPrice: 130 }),
  buildTeacher(12, { name: 'أ. ماجد الغامدي', type: 'university', typeLabel: 'مدرس جامعي', rating: 4.7, minPrice: 85 }),
];

/** Client-side mock filtering that mimics backend query behavior */
export function filterMockTeachers(teachers, filters = {}) {
  let result = [...teachers];

  if (filters.type) {
    result = result.filter((t) => t.type === filters.type);
  }
  if (filters.q) {
    const q = filters.q.trim();
    result = result.filter((t) => t.name.includes(q) || t.subjects.some((s) => s.includes(q)));
  }
  if (filters.minPrice != null) {
    result = result.filter((t) => t.minPrice >= Number(filters.minPrice));
  }
  if (filters.maxPrice != null) {
    result = result.filter((t) => t.minPrice <= Number(filters.maxPrice));
  }
  if (filters.minRating != null) {
    result = result.filter((t) => t.rating >= Number(filters.minRating));
  }

  if (filters.sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (filters.sort === 'price_asc') {
    result.sort((a, b) => a.minPrice - b.minPrice);
  } else if (filters.sort === 'price_desc') {
    result.sort((a, b) => b.minPrice - a.minPrice);
  }

  return result;
}
