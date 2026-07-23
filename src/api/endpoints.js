/**
 * ALL backend endpoint paths live here — one source of truth.
 * When the backend routes change, this is the only file to touch.
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  teachers: {
    list: '/teachers',
    featured: '/teachers/featured',
    detail: (id) => `/teachers/${id}`,
    packages: (id) => `/teachers/${id}/packages`,
    reviews: (id) => `/teachers/${id}/reviews`,
    availability: (id) => `/teachers/${id}/availability`,
    ratingSummary: (id) => `/teachers/${id}/rating-summary`,
  },
  bookings: {
    create: '/bookings',
    checkout: (id) => `/bookings/${id}/checkout`,
  },
  meta: {
    filters: '/meta/filters',
    stats: '/meta/stats',
  },
  dashboard: {
    student: '/dashboard/student',
    calendarSessions: '/dashboard/student/calendar-sessions',
    sessions: '/dashboard/student/sessions',
    invoices: '/dashboard/student/invoices',
    packagesList: '/dashboard/student/packages',
    packageDetails: (id) => `/dashboard/student/packages/${id}`,
  },
};
