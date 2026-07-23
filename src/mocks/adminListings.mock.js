/**
 * Admin listings mocks — packages and courses unified into one review queue,
 * mirroring GET /packages and /courses on the backend (both go through the
 * same admin approval workflow: provider sets their price, admin sets the
 * margin at approval time, student price + platform revenue are derived).
 */

export const LISTING_STATUS_STYLES = {
  submitted: { label: 'بانتظار المراجعة', bg: '#FEF3E2', color: '#B7791F' },
  active: { label: 'نشطة', bg: '#E3F5EC', color: '#2E9E6B' },
  rejected: { label: 'مرفوضة', bg: '#FDEFF2', color: '#B00852' },
  disabled: { label: 'معطّلة', bg: '#F2F2F7', color: '#6B7280' },
};

export const LISTING_KIND_LABELS = {
  package: 'باقة',
  course: 'دورة',
};

export const SESSION_FORMAT_LABELS = {
  individual: 'فردية',
  group: 'جماعية',
};

export const PROVIDER_TYPE_LABELS = {
  school: 'مدرسي',
  university: 'جامعي',
  training_center: 'مركز تدريب',
};

let mockAdminListings = [
  {
    id: 401,
    kind: 'package',
    title: 'باقة تأسيس القواعد الإنجليزية',
    subjectName: 'اللغة الانكليزية',
    providerName: 'سلمى ياسين',
    providerType: 'school',
    description: 'باقة مكثفة لتأسيس القواعد الأساسية في اللغة الانكليزية للمرحلة المتوسطة والثانوية.',
    teacherPrice: 80,
    sessionFormat: 'individual',
    capacity: 1,
    sessionsCount: 8,
    submittedAt: '2026-07-19',
    status: 'submitted',
    marginPercent: null,
    studentPrice: null,
    platformRevenue: null,
    rejectionReason: null,
    disabledReason: null,
  },
  {
    id: 402,
    kind: 'package',
    title: 'باقة تحضير الرياضيات الجامعية',
    subjectName: 'رياضيات',
    providerName: 'فيصل الدوسري',
    providerType: 'university',
    description: 'باقة جماعية لتحضير طلاب السنة الأولى الجامعية في مقررات التفاضل والتكامل.',
    teacherPrice: 120,
    sessionFormat: 'group',
    capacity: 6,
    sessionsCount: 10,
    submittedAt: '2026-07-21',
    status: 'submitted',
    marginPercent: null,
    studentPrice: null,
    platformRevenue: null,
    rejectionReason: null,
    disabledReason: null,
  },
  {
    id: 403,
    kind: 'package',
    title: 'باقة محادثة إنجليزية مكثفة',
    subjectName: 'اللغة الانكليزية',
    providerName: 'سلمى ياسين',
    providerType: 'school',
    description: 'جلسات محادثة فردية لتطوير الطلاقة اللغوية.',
    teacherPrice: 90,
    sessionFormat: 'individual',
    capacity: 1,
    sessionsCount: 12,
    submittedAt: '2026-06-01',
    status: 'active',
    marginPercent: 60,
    studentPrice: 144,
    platformRevenue: 54,
    rejectionReason: null,
    disabledReason: null,
  },
  {
    id: 404,
    kind: 'package',
    title: 'باقة فيزياء متقدمة',
    subjectName: 'فيزياء',
    providerName: 'فيصل الدوسري',
    providerType: 'university',
    description: 'باقة فردية لطلاب الفيزياء المتقدمة في المرحلة الجامعية.',
    teacherPrice: 100,
    sessionFormat: 'individual',
    capacity: 1,
    sessionsCount: 6,
    submittedAt: '2026-05-10',
    status: 'rejected',
    marginPercent: null,
    studentPrice: null,
    platformRevenue: null,
    rejectionReason: 'السعر المقترح مرتفع مقارنة بمعلمين آخرين بنفس المستوى والتخصص.',
    disabledReason: null,
  },
  {
    id: 405,
    kind: 'course',
    title: 'دورة إدارة المشاريع الاحترافية PMP',
    subjectName: 'إدارة مشاريع',
    providerName: 'ريما الحربي',
    providerType: 'training_center',
    description: 'دورة تحضيرية شاملة لاختبار PMP المعتمد من PMI.',
    teacherPrice: 250,
    sessionFormat: null,
    capacity: null,
    sessionsCount: 20,
    submittedAt: '2026-07-20',
    status: 'submitted',
    marginPercent: null,
    studentPrice: null,
    platformRevenue: null,
    rejectionReason: null,
    disabledReason: null,
  },
  {
    id: 406,
    kind: 'course',
    title: 'دورة تحليل البيانات باستخدام Excel',
    subjectName: 'تحليل بيانات',
    providerName: 'يوسف كريم',
    providerType: 'training_center',
    description: 'من الأساسيات إلى الجداول المحورية والتحليل المتقدم.',
    teacherPrice: 180,
    sessionFormat: null,
    capacity: null,
    sessionsCount: 15,
    submittedAt: '2026-07-22',
    status: 'submitted',
    marginPercent: null,
    studentPrice: null,
    platformRevenue: null,
    rejectionReason: null,
    disabledReason: null,
  },
  {
    id: 407,
    kind: 'course',
    title: 'دورة التسويق الرقمي للمبتدئين',
    subjectName: 'تسويق رقمي',
    providerName: 'ريما الحربي',
    providerType: 'training_center',
    description: 'مقدمة شاملة في التسويق عبر منصات التواصل والإعلانات الممولة.',
    teacherPrice: 150,
    sessionFormat: null,
    capacity: null,
    sessionsCount: 10,
    submittedAt: '2026-06-15',
    status: 'active',
    marginPercent: 50,
    studentPrice: 225,
    platformRevenue: 75,
    rejectionReason: null,
    disabledReason: null,
  },
  {
    id: 408,
    kind: 'course',
    title: 'دورة أساسيات البرمجة بلغة Python',
    subjectName: 'برمجة',
    providerName: 'يوسف كريم',
    providerType: 'training_center',
    description: 'دورة تمهيدية للمبتدئين في عالم البرمجة.',
    teacherPrice: 200,
    sessionFormat: null,
    capacity: null,
    sessionsCount: 12,
    submittedAt: '2026-05-01',
    status: 'disabled',
    marginPercent: 55,
    studentPrice: 310,
    platformRevenue: 110,
    rejectionReason: null,
    disabledReason: 'تعارض في الجدول مع دورة أخرى مماثلة من نفس المركز.',
  },
];

export function filterMockListings(filters = {}) {
  let result = [...mockAdminListings];

  if (filters.kind) {
    result = result.filter((l) => l.kind === filters.kind);
  }
  if (filters.status) {
    result = result.filter((l) => l.status === filters.status);
  }
  if (filters.q) {
    const q = filters.q.trim().toLowerCase();
    result = result.filter(
      (l) => l.title.toLowerCase().includes(q) || l.providerName.toLowerCase().includes(q)
    );
  }

  result.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  return result;
}

export function findMockListing(id) {
  return mockAdminListings.find((l) => l.id === Number(id)) ?? null;
}

export function updateMockListing(id, patch) {
  mockAdminListings = mockAdminListings.map((l) => (l.id === Number(id) ? { ...l, ...patch } : l));
  return findMockListing(id);
}

export function getPendingListingsCount() {
  return mockAdminListings.filter((l) => l.status === 'submitted').length;
}

export { mockAdminListings };
