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
    packagesList: () => ['dashboard', 'packages-list'],
    packageDetails: (id) => ['dashboard', 'package-details', id],
  },
};
