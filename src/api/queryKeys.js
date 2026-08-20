/**
 * Centralized React Query keys.
 * Keeping them here prevents cache-key typos and makes
 * invalidation predictable across the app.
 */
export const queryKeys = {
  teachers: {
    all: ['teachers'],
    list: (filters) => ['teachers', 'list', filters],
    featured: () => ['teachers', 'featured'],
    detail: (id) => ['teachers', 'detail', id],
    packages: (id) => ['teachers', id, 'packages'],
    courses: (id) => ['teachers', id, 'courses'],
    reviews: (id) => ['teachers', id, 'reviews'],
    availabilitySlots: (id) => ['teachers', id, 'availability-slots'],
    ratingSummary: (id) => ['teachers', id, 'rating-summary'],
  },
  meta: {
    filters: () => ['meta', 'filters'],
    stats: () => ['meta', 'stats'],
  },
  taxonomy: (type) => ['taxonomy', type],
  bookings: {
    list: (filters) => ['bookings', 'list', filters],
  },
  favorites: {
    list: () => ['favorites', 'list'],
  },
  reviews: {
    mine: () => ['reviews', 'mine'],
  },
  students: {
    myProfile: (id) => ['students', 'my-profile', id],
  },
  notifications: {
    list: () => ['notifications', 'list'],
    unreadCount: () => ['notifications', 'unread-count'],
  },
  dashboard: {
    student: () => ['dashboard', 'student'],
    teacher: () => ['dashboard', 'teacher'],
    calendarSessions: () => ['dashboard', 'calendar-sessions'],
    teacherCalendarSessions: () => ['dashboard', 'teacher-calendar-sessions'],
    sessions: (params = {}) => ['dashboard', 'sessions', params],
    invoices: () => ['dashboard', 'invoices'],
    packagesList: () => ['dashboard', 'packages-list'],
    teacherPackagesList: () => ['dashboard', 'teacher-packages-list'],
    teacherPackageDetail: (id) => ['dashboard', 'teacher-package-detail', id],
    teacherCoursesList: () => ['dashboard', 'teacher-courses-list'],
    teacherSessions: () => ['dashboard', 'teacher-sessions'],
    teacherSessionDetails: (id) => ['dashboard', 'teacher-session-details', id],
    teacherStudents: () => ['dashboard', 'teacher-students'],
    teacherStudentDetails: (id) => ['dashboard', 'teacher-student-details', id],
    packageDetails: (id) => ['dashboard', 'package-details', id],
  },
  admin: {
    overview: () => ['admin', 'overview'],
    teachers: (filters) => ['admin', 'teachers', filters],
    teacherDetail: (id) => ['admin', 'teacher-detail', id],
    listings: (filters) => ['admin', 'listings', filters],
    listingDetail: (id) => ['admin', 'listing-detail', id],
    complaints: (filters) => ['admin', 'complaints', filters],
    complaintDetail: (id) => ['admin', 'complaint-detail', id],
    rescheduleRequests: (filters) => ['admin', 'reschedule-requests', filters],
    taxonomy: (type) => ['admin', 'taxonomy', type],
    payouts: (filters) => ['admin', 'payouts', filters],
    settings: () => ['admin', 'settings'],
    auditLog: (filters) => ['admin', 'audit-log', filters],
    reviews: (filters) => ['admin', 'reviews', filters],
  },
};
