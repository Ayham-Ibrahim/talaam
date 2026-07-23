/**
 * Complaints + reschedule requests — grouped together since both are
 * admin-decision queues with an SLA/approval workflow and no refunds
 * (resolution options are: makeup session, credit, warning, or no action).
 */

export const COMPLAINT_STATUS_STYLES = {
  open: { label: 'مفتوحة', bg: '#FEF3E2', color: '#B7791F' },
  escalated: { label: 'مصعّدة', bg: '#FDEFF2', color: '#B00852' },
  resolved: { label: 'محلولة', bg: '#E3F5EC', color: '#2E9E6B' },
};

export const RESOLUTION_TYPE_LABELS = {
  makeup_session: 'جلسة تعويضية',
  credit: 'رصيد إضافي',
  no_action: 'لا إجراء',
  warning_issued: 'تحذير للمعلم',
};

export const RESCHEDULE_STATUS_STYLES = {
  pending: { label: 'بانتظار المراجعة', bg: '#FEF3E2', color: '#B7791F' },
  approved: { label: 'مقبول', bg: '#E3F5EC', color: '#2E9E6B' },
  approved_with_alternative: { label: 'مقبول بموعد بديل', bg: '#F0FAFD', color: '#2F80ED' },
  rejected: { label: 'مرفوض', bg: '#FDEFF2', color: '#B00852' },
};

let mockComplaints = [
  {
    id: 601,
    studentName: 'نورة الشمري',
    teacherName: 'سلمى ياسين',
    subjectName: 'اللغة الانكليزية',
    description: 'المعلمة تأخرت 20 دقيقة عن موعد الجلسة دون إشعار مسبق.',
    createdAt: '2026-07-21T10:00:00',
    slaDeadline: '2026-07-22T10:00:00',
    status: 'open',
    resolutionType: null,
    resolutionNote: null,
  },
  {
    id: 602,
    studentName: 'عبدالرحمن فهد',
    teacherName: 'فيصل الدوسري',
    subjectName: 'رياضيات',
    description: 'جودة الصوت في الجلسة كانت سيئة جداً ولم نستطع إكمال الشرح.',
    createdAt: '2026-07-22T14:30:00',
    slaDeadline: '2026-07-23T14:30:00',
    status: 'open',
    resolutionType: null,
    resolutionNote: null,
  },
  {
    id: 603,
    studentName: 'ليان خالد',
    teacherName: 'يوسف كريم',
    subjectName: 'برمجة',
    description: 'محتوى الدورة لا يطابق الوصف المعلن، الدروس أبسط من المستوى المتوقع.',
    createdAt: '2026-07-20T09:15:00',
    slaDeadline: '2026-07-21T09:15:00',
    status: 'escalated',
    resolutionType: null,
    resolutionNote: null,
  },
  {
    id: 604,
    studentName: 'سارة الأحمد',
    teacherName: 'ريما الحربي',
    subjectName: 'تسويق رقمي',
    description: 'تم إلغاء الجلسة من طرف المركز قبل ساعة واحدة فقط من موعدها.',
    createdAt: '2026-07-15T11:00:00',
    slaDeadline: '2026-07-16T11:00:00',
    status: 'resolved',
    resolutionType: 'makeup_session',
    resolutionNote: 'تم جدولة جلسة تعويضية بالاتفاق مع الطالبة والمركز.',
  },
  {
    id: 605,
    studentName: 'محمد راشد',
    teacherName: 'سلمى ياسين',
    subjectName: 'اللغة الانكليزية',
    description: 'المعلمة لم تلتزم بخطة الدروس المتفق عليها في بداية الباقة.',
    createdAt: '2026-07-12T16:45:00',
    slaDeadline: '2026-07-13T16:45:00',
    status: 'resolved',
    resolutionType: 'warning_issued',
    resolutionNote: 'تم التواصل مع المعلمة وتوجيه تحذير رسمي بخصوص الالتزام بخطة الدروس.',
  },
  {
    id: 606,
    studentName: 'هيا سلطان',
    teacherName: 'فيصل الدوسري',
    subjectName: 'فيزياء',
    description: 'طلب استرجاع بسبب عدم الرضا عن أسلوب الشرح.',
    createdAt: '2026-07-10T08:20:00',
    slaDeadline: '2026-07-11T08:20:00',
    status: 'resolved',
    resolutionType: 'no_action',
    resolutionNote: 'تمت مراجعة تسجيل الجلسة، الشرح كان مطابقاً لخطة الباقة المعتمدة.',
  },
];

let mockRescheduleRequests = [
  {
    id: 701,
    teacherName: 'سلمى ياسين',
    studentName: 'نورة الشمري',
    subjectName: 'اللغة الانكليزية',
    originalScheduledAt: '2026-07-25T17:00:00',
    proposedScheduledAt: '2026-07-27T17:00:00',
    reason: 'ظرف طارئ لدى المعلمة',
    withinFreeWindow: false,
    createdAt: '2026-07-22T09:00:00',
    status: 'pending',
    alternativeScheduledAt: null,
    rejectionReason: null,
  },
  {
    id: 702,
    teacherName: 'فيصل الدوسري',
    studentName: 'عبدالرحمن فهد',
    subjectName: 'رياضيات',
    originalScheduledAt: '2026-07-24T19:00:00',
    proposedScheduledAt: '2026-07-24T21:00:00',
    reason: null,
    withinFreeWindow: true,
    createdAt: '2026-07-23T10:30:00',
    status: 'pending',
    alternativeScheduledAt: null,
    rejectionReason: null,
  },
  {
    id: 703,
    teacherName: 'يوسف كريم',
    studentName: 'مجموعة (6 طلاب)',
    subjectName: 'برمجة',
    originalScheduledAt: '2026-07-26T18:00:00',
    proposedScheduledAt: '2026-07-29T18:00:00',
    reason: 'تعارض في جدول المدرب',
    withinFreeWindow: false,
    createdAt: '2026-07-23T12:00:00',
    status: 'pending',
    alternativeScheduledAt: null,
    rejectionReason: null,
  },
  {
    id: 704,
    teacherName: 'ريما الحربي',
    studentName: 'سارة الأحمد',
    subjectName: 'تسويق رقمي',
    originalScheduledAt: '2026-07-14T16:00:00',
    proposedScheduledAt: '2026-07-16T16:00:00',
    reason: 'سفر مفاجئ',
    withinFreeWindow: false,
    createdAt: '2026-07-13T08:00:00',
    status: 'approved',
    alternativeScheduledAt: null,
    rejectionReason: null,
  },
  {
    id: 705,
    teacherName: 'سلمى ياسين',
    studentName: 'محمد راشد',
    subjectName: 'اللغة الانكليزية',
    originalScheduledAt: '2026-07-11T17:00:00',
    proposedScheduledAt: '2026-07-13T17:00:00',
    reason: 'ظرف صحي',
    withinFreeWindow: false,
    createdAt: '2026-07-10T09:00:00',
    status: 'approved_with_alternative',
    alternativeScheduledAt: '2026-07-14T19:00:00',
    rejectionReason: null,
  },
  {
    id: 706,
    teacherName: 'فيصل الدوسري',
    studentName: 'هيا سلطان',
    subjectName: 'فيزياء',
    originalScheduledAt: '2026-07-09T17:00:00',
    proposedScheduledAt: '2026-07-09T20:00:00',
    reason: 'تعديل بسيط بنفس اليوم',
    withinFreeWindow: true,
    createdAt: '2026-07-08T15:00:00',
    status: 'rejected',
    alternativeScheduledAt: null,
    rejectionReason: 'لا يوجد موعد بديل متاح لدى المعلم في هذا التوقيت.',
  },
];

export function filterMockComplaints(filters = {}) {
  let result = [...mockComplaints];
  if (filters.status) result = result.filter((c) => c.status === filters.status);
  if (filters.q) {
    const q = filters.q.trim().toLowerCase();
    result = result.filter(
      (c) => c.studentName.toLowerCase().includes(q) || c.teacherName.toLowerCase().includes(q)
    );
  }
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return result;
}

export function findMockComplaint(id) {
  return mockComplaints.find((c) => c.id === Number(id)) ?? null;
}

export function updateMockComplaint(id, patch) {
  mockComplaints = mockComplaints.map((c) => (c.id === Number(id) ? { ...c, ...patch } : c));
  return findMockComplaint(id);
}

export function getOpenComplaintsCount() {
  return mockComplaints.filter((c) => c.status !== 'resolved').length;
}

export function filterMockRescheduleRequests(filters = {}) {
  let result = [...mockRescheduleRequests];
  if (filters.status) result = result.filter((r) => r.status === filters.status);
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return result;
}

export function findMockRescheduleRequest(id) {
  return mockRescheduleRequests.find((r) => r.id === Number(id)) ?? null;
}

export function updateMockRescheduleRequest(id, patch) {
  mockRescheduleRequests = mockRescheduleRequests.map((r) => (r.id === Number(id) ? { ...r, ...patch } : r));
  return findMockRescheduleRequest(id);
}

export { mockComplaints, mockRescheduleRequests };
