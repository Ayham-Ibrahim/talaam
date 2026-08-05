/**
 * إشعارات داخل التطبيق — تعكس أنواع الإشعارات الحقيقية الوحيدة التي يرسلها
 * الباك عبر NotificationService (قناة database): TeacherVerificationReviewed،
 * TeacherInvited، StudentImported، SessionReminder.
 */
let mockNotifications = [
  {
    id: 'n1',
    type: 'TeacherVerificationReviewed',
    data: { approved: true, reason: null },
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'n2',
    type: 'SessionReminder',
    data: { class_session_id: 501, scheduled_at: new Date(Date.now() + 1000 * 60 * 60).toISOString() },
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'n3',
    type: 'TeacherVerificationReviewed',
    data: { approved: false, reason: 'الوثائق غير مكتملة' },
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
  },
];

export function listMockNotifications() {
  return [...mockNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function countMockUnread() {
  return mockNotifications.filter((n) => !n.readAt).length;
}

export function markMockNotificationRead(id) {
  mockNotifications = mockNotifications.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
  return mockNotifications.find((n) => n.id === id);
}

export function markAllMockNotificationsRead() {
  mockNotifications = mockNotifications.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() }));
}
