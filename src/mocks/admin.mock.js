/**
 * Admin mocks — mirrors the shape the real backend returns for
 * GET /teachers (admin view), /verification-documents, /teachers/{id}/badges.
 * Arrays are mutable (`let`) and mutated in place by the helper functions below
 * so the demo behaves like a real backend across approve/reject/grant actions —
 * there's no server to persist to, so this module IS the persistence layer.
 */

export const TEACHER_STATUS_STYLES = {
  pending: { label: 'بانتظار المراجعة', bg: '#FEF3E2', color: '#B7791F' },
  verified: { label: 'معتمد', bg: '#E3F5EC', color: '#2E9E6B' },
  rejected: { label: 'مرفوض', bg: '#FDEFF2', color: '#B00852' },
  suspended: { label: 'موقوف', bg: '#F2F2F7', color: '#6B7280' },
};

export const TEACHER_TYPE_LABELS = {
  school: 'مدرسي',
  university: 'جامعي',
  training_center: 'مركز تدريب',
};

export const DOCUMENT_STATUS_STYLES = {
  pending: { label: 'بانتظار المراجعة', bg: '#FEF3E2', color: '#B7791F' },
  approved: { label: 'مقبولة', bg: '#E3F5EC', color: '#2E9E6B' },
  rejected: { label: 'مرفوضة', bg: '#FDEFF2', color: '#B00852' },
};

export const DOCUMENT_TYPE_LABELS = {
  national_id: 'الهوية الوطنية',
  degree_certificate: 'الشهادة العلمية',
  teaching_license: 'رخصة تدريس',
  cv: 'السيرة الذاتية',
};

export const BADGE_CATALOG = [
  { id: 1, name: 'مؤهلات مراجعة', icon: '🎓' },
  { id: 2, name: 'فحص أمني', icon: '🛡️' },
  { id: 3, name: 'معلم مميز', icon: '🥇' },
  { id: 4, name: 'مركز معتمد', icon: '🏅' },
];

let mockAdminTeachers = [
  {
    id: 301,
    name: 'محمد العتيبي',
    email: 'mohammed.otaibi@example.com',
    phone: '0501234501',
    avatar: null,
    type: 'school',
    status: 'pending',
    bio: 'معلم رياضيات وفيزياء للمرحلة الثانوية، خبرة 4 سنوات في مناهج وزارية ودولية.',
    submittedAt: '2026-07-18',
    verifiedAt: null,
    rejectionReason: null,
    suspensionReason: null,
  },
  {
    id: 302,
    name: 'هند القرني',
    email: 'hind.qarni@example.com',
    phone: '0501234502',
    avatar: null,
    type: 'university',
    status: 'pending',
    bio: 'أستاذة مساعدة في هندسة الحاسوب، تدرّس مقررات البرمجة وهياكل البيانات.',
    submittedAt: '2026-07-20',
    verifiedAt: null,
    rejectionReason: null,
    suspensionReason: null,
  },
  {
    id: 303,
    name: 'عمر راشد',
    email: 'omar.rashed@example.com',
    phone: '0501234503',
    avatar: null,
    type: 'training_center',
    status: 'pending',
    bio: 'مدرب معتمد في إدارة المشاريع (PMP) ومهارات القيادة.',
    submittedAt: '2026-07-21',
    verifiedAt: null,
    rejectionReason: null,
    suspensionReason: null,
  },
  {
    id: 304,
    name: 'سلمى ياسين',
    email: 'salma.yaseen@example.com',
    phone: '0501234504',
    avatar: null,
    type: 'school',
    status: 'verified',
    bio: 'معلمة لغة انكليزية معتمدة IELTS، 6 سنوات خبرة.',
    submittedAt: '2026-06-05',
    verifiedAt: '2026-06-10',
    rejectionReason: null,
    suspensionReason: null,
  },
  {
    id: 305,
    name: 'فيصل الدوسري',
    email: 'faisal.dosari@example.com',
    phone: '0501234505',
    avatar: null,
    type: 'university',
    status: 'verified',
    bio: 'دكتوراه في الكيمياء، يدرّس مقررات جامعية وتحضير اختبارات القبول.',
    submittedAt: '2026-05-15',
    verifiedAt: '2026-05-22',
    rejectionReason: null,
    suspensionReason: null,
  },
  {
    id: 306,
    name: 'ريما الحربي',
    email: 'rima.harbi@example.com',
    phone: '0501234506',
    avatar: null,
    type: 'training_center',
    status: 'verified',
    bio: 'مركز تدريب معتمد في المهارات الرقمية والتسويق الالكتروني.',
    submittedAt: '2026-04-08',
    verifiedAt: '2026-04-15',
    rejectionReason: null,
    suspensionReason: null,
  },
  {
    id: 307,
    name: 'طارق منصور',
    email: 'tareq.mansour@example.com',
    phone: '0501234507',
    avatar: null,
    type: 'school',
    status: 'rejected',
    bio: 'معلم علوم للمرحلة المتوسطة.',
    submittedAt: '2026-07-10',
    verifiedAt: null,
    rejectionReason: 'الوثائق المرفوعة غير واضحة، الرجاء إعادة رفع صور بدقة أعلى.',
    suspensionReason: null,
  },
  {
    id: 308,
    name: 'لبنى سالم',
    email: 'lubna.salem@example.com',
    phone: '0501234508',
    avatar: null,
    type: 'university',
    status: 'suspended',
    bio: 'محاضِرة في إدارة الأعمال.',
    submittedAt: '2026-01-20',
    verifiedAt: '2026-02-01',
    rejectionReason: null,
    suspensionReason: 'شكاوى متكررة من الطلاب بخصوص عدم الالتزام بمواعيد الجلسات.',
  },
  {
    id: 309,
    name: 'يوسف كريم',
    email: 'youssef.karim@example.com',
    phone: '0501234509',
    avatar: null,
    type: 'training_center',
    status: 'verified',
    bio: 'مدرب معتمد في تحليل البيانات وExcel المتقدم.',
    submittedAt: '2026-06-25',
    verifiedAt: '2026-07-01',
    rejectionReason: null,
    suspensionReason: null,
  },
];

let mockVerificationDocuments = [
  { id: 1, teacherId: 301, type: 'national_id', fileName: 'national_id_301.pdf', status: 'pending', uploadedAt: '2026-07-18', rejectionReason: null },
  { id: 2, teacherId: 301, type: 'degree_certificate', fileName: 'degree_301.pdf', status: 'pending', uploadedAt: '2026-07-18', rejectionReason: null },
  { id: 3, teacherId: 301, type: 'cv', fileName: 'cv_301.pdf', status: 'pending', uploadedAt: '2026-07-18', rejectionReason: null },

  { id: 4, teacherId: 302, type: 'national_id', fileName: 'national_id_302.pdf', status: 'pending', uploadedAt: '2026-07-20', rejectionReason: null },
  { id: 5, teacherId: 302, type: 'degree_certificate', fileName: 'degree_302.pdf', status: 'pending', uploadedAt: '2026-07-20', rejectionReason: null },

  { id: 6, teacherId: 303, type: 'national_id', fileName: 'national_id_303.pdf', status: 'rejected', uploadedAt: '2026-07-19', rejectionReason: 'الصورة غير واضحة' },
  { id: 7, teacherId: 303, type: 'degree_certificate', fileName: 'degree_303.pdf', status: 'pending', uploadedAt: '2026-07-21', rejectionReason: null },
  { id: 8, teacherId: 303, type: 'teaching_license', fileName: 'license_303.pdf', status: 'pending', uploadedAt: '2026-07-21', rejectionReason: null },
  { id: 9, teacherId: 303, type: 'cv', fileName: 'cv_303.pdf', status: 'pending', uploadedAt: '2026-07-21', rejectionReason: null },

  { id: 10, teacherId: 304, type: 'national_id', fileName: 'national_id_304.pdf', status: 'approved', uploadedAt: '2026-06-05', rejectionReason: null },
  { id: 11, teacherId: 304, type: 'degree_certificate', fileName: 'degree_304.pdf', status: 'approved', uploadedAt: '2026-06-05', rejectionReason: null },
  { id: 12, teacherId: 304, type: 'cv', fileName: 'cv_304.pdf', status: 'approved', uploadedAt: '2026-06-05', rejectionReason: null },

  { id: 13, teacherId: 305, type: 'national_id', fileName: 'national_id_305.pdf', status: 'approved', uploadedAt: '2026-05-15', rejectionReason: null },
  { id: 14, teacherId: 305, type: 'degree_certificate', fileName: 'degree_305.pdf', status: 'approved', uploadedAt: '2026-05-15', rejectionReason: null },

  { id: 15, teacherId: 306, type: 'national_id', fileName: 'national_id_306.pdf', status: 'approved', uploadedAt: '2026-04-08', rejectionReason: null },
  { id: 16, teacherId: 306, type: 'teaching_license', fileName: 'license_306.pdf', status: 'approved', uploadedAt: '2026-04-08', rejectionReason: null },

  { id: 17, teacherId: 307, type: 'national_id', fileName: 'national_id_307.pdf', status: 'rejected', uploadedAt: '2026-07-10', rejectionReason: 'صورة الهوية غير واضحة' },
  { id: 18, teacherId: 307, type: 'degree_certificate', fileName: 'degree_307.pdf', status: 'rejected', uploadedAt: '2026-07-10', rejectionReason: 'الشهادة منتهية الصلاحية' },

  { id: 19, teacherId: 308, type: 'national_id', fileName: 'national_id_308.pdf', status: 'approved', uploadedAt: '2026-01-20', rejectionReason: null },
  { id: 20, teacherId: 308, type: 'degree_certificate', fileName: 'degree_308.pdf', status: 'approved', uploadedAt: '2026-01-20', rejectionReason: null },

  { id: 21, teacherId: 309, type: 'national_id', fileName: 'national_id_309.pdf', status: 'approved', uploadedAt: '2026-06-25', rejectionReason: null },
  { id: 22, teacherId: 309, type: 'teaching_license', fileName: 'license_309.pdf', status: 'approved', uploadedAt: '2026-06-25', rejectionReason: null },
];

let mockBadgeAwards = [
  { id: 1, teacherId: 305, badgeId: 1, awardedAt: '2026-05-25' },
  { id: 2, teacherId: 305, badgeId: 4, awardedAt: '2026-06-01' },
  { id: 3, teacherId: 306, badgeId: 1, awardedAt: '2026-04-20' },
  { id: 4, teacherId: 306, badgeId: 2, awardedAt: '2026-04-22' },
  { id: 5, teacherId: 306, badgeId: 3, awardedAt: '2026-05-01' },
  { id: 6, teacherId: 309, badgeId: 1, awardedAt: '2026-07-05' },
];

let nextDocumentId = 23;
let nextBadgeAwardId = 7;

/** Client-side filtering that mimics backend query params for GET /teachers */
export function filterMockAdminTeachers(teachers, filters = {}) {
  let result = [...teachers];

  if (filters.status) {
    result = result.filter((t) => t.status === filters.status);
  }
  if (filters.type) {
    result = result.filter((t) => t.type === filters.type);
  }
  if (filters.q) {
    const q = filters.q.trim().toLowerCase();
    result = result.filter(
      (t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
    );
  }

  result.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  return result;
}

export function getAdminOverviewStats(pendingApprovalsCount = 0, openComplaintsCount = 0) {
  return {
    verifiedTeachersCount: mockAdminTeachers.filter((t) => t.status === 'verified').length,
    pendingVerificationsCount: mockAdminTeachers.filter((t) => t.status === 'pending').length,
    pendingApprovalsCount,
    openComplaintsCount,
    totalStudents: 1240,
    monthlyRevenue: 18450,
  };
}

export function getPendingVerificationTeachers() {
  return mockAdminTeachers.filter((t) => t.status === 'pending');
}

export function getTeacherDocuments(teacherId) {
  return mockVerificationDocuments.filter((d) => d.teacherId === Number(teacherId));
}

export function getTeacherBadgeAwards(teacherId) {
  return mockBadgeAwards
    .filter((a) => a.teacherId === Number(teacherId))
    .map((a) => ({ ...a, badge: BADGE_CATALOG.find((b) => b.id === a.badgeId) }));
}

export function findMockAdminTeacher(id) {
  return mockAdminTeachers.find((t) => t.id === Number(id)) ?? null;
}

export function updateMockTeacher(id, patch) {
  mockAdminTeachers = mockAdminTeachers.map((t) => (t.id === Number(id) ? { ...t, ...patch } : t));
  return findMockAdminTeacher(id);
}

export function updateMockDocument(documentId, patch) {
  mockVerificationDocuments = mockVerificationDocuments.map((d) =>
    d.id === Number(documentId) ? { ...d, ...patch } : d
  );
  return mockVerificationDocuments.find((d) => d.id === Number(documentId)) ?? null;
}

export function addMockDocument(teacherId, doc) {
  const created = { id: nextDocumentId++, teacherId: Number(teacherId), status: 'pending', rejectionReason: null, ...doc };
  mockVerificationDocuments = [...mockVerificationDocuments, created];
  return created;
}

export function addMockBadgeAward(teacherId, badgeId) {
  const created = { id: nextBadgeAwardId++, teacherId: Number(teacherId), badgeId: Number(badgeId), awardedAt: new Date().toISOString().slice(0, 10) };
  mockBadgeAwards = [...mockBadgeAwards, created];
  return { ...created, badge: BADGE_CATALOG.find((b) => b.id === created.badgeId) };
}

export function removeMockBadgeAward(awardId) {
  mockBadgeAwards = mockBadgeAwards.filter((a) => a.id !== Number(awardId));
}

export { mockAdminTeachers };
