/**
 * Audit log mocks — mirrors the `audit_logs` table. Every sensitive action
 * across every admin domain we've built gets logged here: approvals,
 * rejections, suspensions, badge changes, settings changes, resolutions.
 */

export const AUDIT_ACTION_LABELS = {
  'teacher.approved': 'اعتماد معلم',
  'teacher.rejected': 'رفض طلب معلم',
  'teacher.suspended': 'إيقاف معلم',
  'verification_document.approved': 'قبول وثيقة توثيق',
  'verification_document.rejected': 'رفض وثيقة توثيق',
  'badge.granted': 'منح شارة',
  'badge.revoked': 'سحب شارة',
  'listing.approved': 'اعتماد باقة/دورة',
  'listing.rejected': 'رفض باقة/دورة',
  'listing.disabled': 'تعطيل باقة/دورة',
  'complaint.resolved': 'حل شكوى',
  'complaint.escalated': 'تصعيد شكوى',
  'reschedule.approved': 'قبول تغيير موعد',
  'reschedule.rejected': 'رفض تغيير موعد',
  'payout.approved': 'اعتماد مستحقات',
  'payout.paid': 'دفع مستحقات',
  'settings.updated': 'تعديل إعداد',
  'taxonomy.updated': 'تعديل تصنيف',
  'review.hidden': 'إخفاء تقييم',
};

export const mockAuditLog = [
  { id: 1, action: 'teacher.approved', adminName: 'مدير المنصة', targetLabel: 'محمد العتيبي', createdAt: '2026-07-19T11:20:00' },
  { id: 2, action: 'verification_document.rejected', adminName: 'مدير المنصة', targetLabel: 'وثيقة الهوية — عمر راشد', createdAt: '2026-07-21T09:05:00' },
  { id: 3, action: 'listing.approved', adminName: 'مدير المنصة', targetLabel: 'باقة محادثة إنجليزية مكثفة', createdAt: '2026-06-01T14:10:00' },
  { id: 4, action: 'listing.rejected', adminName: 'مدير المنصة', targetLabel: 'باقة فيزياء متقدمة', createdAt: '2026-05-10T16:40:00' },
  { id: 5, action: 'complaint.resolved', adminName: 'مدير المنصة', targetLabel: 'شكوى #604 — سارة الأحمد', createdAt: '2026-07-15T12:30:00' },
  { id: 6, action: 'complaint.escalated', adminName: 'مدير المنصة', targetLabel: 'شكوى #603 — ليان خالد', createdAt: '2026-07-20T10:00:00' },
  { id: 7, action: 'reschedule.approved', adminName: 'مدير المنصة', targetLabel: 'طلب #704 — ريما الحربي', createdAt: '2026-07-13T09:15:00' },
  { id: 8, action: 'reschedule.rejected', adminName: 'مدير المنصة', targetLabel: 'طلب #706 — فيصل الدوسري', createdAt: '2026-07-08T15:20:00' },
  { id: 9, action: 'badge.granted', adminName: 'مدير المنصة', targetLabel: 'مؤهلات مراجعة — فيصل الدوسري', createdAt: '2026-05-25T13:00:00' },
  { id: 10, action: 'payout.approved', adminName: 'مدير المنصة', targetLabel: 'مستحقات #803 — سلمى ياسين', createdAt: '2026-07-21T10:45:00' },
  { id: 11, action: 'payout.paid', adminName: 'مدير المنصة', targetLabel: 'مستحقات #801 — فيصل الدوسري', createdAt: '2026-07-05T08:30:00' },
  { id: 12, action: 'teacher.suspended', adminName: 'مدير المنصة', targetLabel: 'لبنى سالم', createdAt: '2026-02-01T11:00:00' },
  { id: 13, action: 'settings.updated', adminName: 'مدير المنصة', targetLabel: 'هامش الربح الافتراضي: 55% → 60%', createdAt: '2026-04-01T09:00:00' },
  { id: 14, action: 'taxonomy.updated', adminName: 'مدير المنصة', targetLabel: 'إضافة مادة: اللغة الفرنسية', createdAt: '2026-03-15T10:20:00' },
  { id: 15, action: 'review.hidden', adminName: 'مدير المنصة', targetLabel: 'تقييم بتقييم 1 نجمة — محتوى غير لائق', createdAt: '2026-06-20T17:00:00' },
  { id: 16, action: 'listing.disabled', adminName: 'مدير المنصة', targetLabel: 'دورة أساسيات البرمجة بلغة Python', createdAt: '2026-05-01T12:00:00' },
];

export function filterMockAuditLog(filters = {}) {
  let result = [...mockAuditLog];
  if (filters.action) result = result.filter((e) => e.action === filters.action);
  if (filters.q) {
    const q = filters.q.trim().toLowerCase();
    result = result.filter((e) => e.targetLabel.toLowerCase().includes(q));
  }
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return result;
}
