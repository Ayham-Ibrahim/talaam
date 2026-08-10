/**
 * Settings mocks — mirrors the `settings` table SettingsService reads/writes.
 * Every tunable business value in the platform (margins, windows, thresholds,
 * ranking weights) lives here — never hardcoded elsewhere.
 */

export const SETTINGS_CATEGORY_LABELS = {
  pricing: 'التسعير',
  scheduling: 'الجدولة والحضور والشكاوى',
  ranking: 'التقييمات والترتيب',
  general: 'عام',
};

let mockSettings = [
  { key: 'platform_margin_percent_default', category: 'pricing', label: 'هامش الربح الافتراضي', value: 60, unit: '%', type: 'decimal' },
  { key: 'default_currency', category: 'pricing', label: 'العملة الافتراضية', value: 'USD', unit: '', type: 'string' },
  { key: 'reschedule_free_window_hours', category: 'scheduling', label: 'نافذة تغيير الموعد المجانية', value: 24, unit: 'ساعة', type: 'integer' },
  { key: 'reschedule_max_per_session', category: 'scheduling', label: 'الحد الأقصى لطلبات تغيير الموعد لكل جلسة', value: 1, unit: 'طلب', type: 'integer' },
  { key: 'reschedule_requires_admin', category: 'scheduling', label: 'تغيير الموعد يتطلب موافقة الأدمن دائماً', value: true, unit: '', type: 'boolean' },
  { key: 'teacher_no_show_suspend_threshold', category: 'scheduling', label: 'عدد مرات غياب المعلم قبل الإيقاف التلقائي', value: 3, unit: 'مرات', type: 'integer' },
  { key: 'student_absence_advance_notice_hours', category: 'scheduling', label: 'مهلة إشعار غياب الطالب المعفى', value: 6, unit: 'ساعة', type: 'integer' },
  { key: 'complaint_sla_hours', category: 'scheduling', label: 'مهلة الرد على الشكاوى (SLA)', value: 24, unit: 'ساعة', type: 'integer' },
  { key: 'invitation_link_expiry_hours', category: 'general', label: 'مدة صلاحية رابط الدعوة', value: 48, unit: 'ساعة', type: 'integer' },
  { key: 'student_import_max_rows', category: 'general', label: 'الحد الأقصى لصفوف استيراد الطلاب', value: 500, unit: 'صف', type: 'integer' },
  { key: 'review_submission_window_days', category: 'ranking', label: 'مهلة إرسال التقييم بعد الجلسة', value: 7, unit: 'يوم', type: 'integer' },
  { key: 'review_edit_window_hours', category: 'ranking', label: 'مهلة تعديل التقييم', value: 24, unit: 'ساعة', type: 'integer' },
  { key: 'ranking_weight_rating', category: 'ranking', label: 'وزن التقييم في الترتيب', value: 40, unit: '%', type: 'decimal' },
  { key: 'ranking_weight_completion', category: 'ranking', label: 'وزن نسبة إتمام الجلسات في الترتيب', value: 25, unit: '%', type: 'decimal' },
  { key: 'ranking_weight_response', category: 'ranking', label: 'وزن سرعة الاستجابة في الترتيب', value: 15, unit: '%', type: 'decimal' },
  { key: 'ranking_weight_profile', category: 'ranking', label: 'وزن اكتمال الملف الشخصي في الترتيب', value: 10, unit: '%', type: 'decimal' },
  { key: 'ranking_weight_recency', category: 'ranking', label: 'وزن حداثة النشاط في الترتيب', value: 10, unit: '%', type: 'decimal' },
];

export function getMockSettings() {
  return mockSettings;
}

export function updateMockSetting(key, value) {
  mockSettings = mockSettings.map((s) => (s.key === key ? { ...s, value } : s));
  return mockSettings.find((s) => s.key === key) ?? null;
}
