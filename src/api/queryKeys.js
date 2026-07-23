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
    reviews: (id) => ['teachers', id, 'reviews'],
    availability: (id, date) => ['teachers', id, 'availability', date],
    ratingSummary: (id) => ['teachers', id, 'rating-summary'],
  },
  meta: {
    filters: () => ['meta', 'filters'],
    stats: () => ['meta', 'stats'],
  },
  dashboard: {
    student: () => ['dashboard', 'student'],
    calendarSessions: () => ['dashboard', 'calendar-sessions'],
    sessions: () => ['dashboard', 'sessions'],
    invoices: () => ['dashboard', 'invoices'],
    packagesList: () => ['dashboard', 'packages-list'],
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
