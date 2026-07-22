import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import {
  mockPackages,
  mockReviews,
  mockRatingSummary,
  buildMockAvailability,
  mockFilters,
  mockStats,
} from '@/mocks/data.mock';
import {
  mockDashboardStats,
  mockUpcomingSessions,
  mockCurrentPackage,
  mockActivities,
  mockCalendarSessions,
  mockPackagesList,
  mockPackageSessions,
} from '@/mocks/dashboard.mock';

export const packageService = {
  async getByTeacher(teacherId) {
    if (config.useMocks) {
      await mockDelay();
      return mockPackages.filter((p) => p.teacherId === Number(teacherId));
    }
    const { data } = await client.get(endpoints.teachers.packages(teacherId));
    return data;
  },
};

export const reviewService = {
  async getByTeacher(teacherId) {
    if (config.useMocks) {
      await mockDelay();
      return mockReviews.filter((r) => r.teacherId === Number(teacherId));
    }
    const { data } = await client.get(endpoints.teachers.reviews(teacherId));
    return data;
  },

  async getRatingSummary(teacherId) {
    if (config.useMocks) {
      await mockDelay(250);
      return mockRatingSummary;
    }
    const { data } = await client.get(endpoints.teachers.ratingSummary(teacherId));
    return data;
  },
};

export const bookingService = {
  async getAvailability(teacherId, date) {
    if (config.useMocks) {
      await mockDelay(250);
      return buildMockAvailability(teacherId, date);
    }
    const { data } = await client.get(endpoints.teachers.availability(teacherId), {
      params: { date },
    });
    return data;
  },

  async createBooking(payload) {
    if (config.useMocks) {
      await mockDelay(500);
      return { id: Math.floor(Math.random() * 100000), status: 'pending_payment', ...payload };
    }
    const { data } = await client.post(endpoints.bookings.create, payload);
    return data;
  },
};

export const metaService = {
  async getFilters() {
    if (config.useMocks) {
      await mockDelay(200);
      return mockFilters;
    }
    const { data } = await client.get(endpoints.meta.filters);
    return data;
  },

  async getStats() {
    if (config.useMocks) {
      await mockDelay(200);
      return mockStats;
    }
    const { data } = await client.get(endpoints.meta.stats);
    return data;
  },
};

export const dashboardService = {
  async getStudentDashboard() {
    if (config.useMocks) {
      await mockDelay(300);
      return {
        stats: mockDashboardStats,
        upcomingSessions: mockUpcomingSessions,
        currentPackage: mockCurrentPackage,
        activities: mockActivities,
      };
    }
    const { data } = await client.get(endpoints.dashboard.student);
    return data;
  },

  async getCalendarSessions() {
    if (config.useMocks) {
      await mockDelay(300);
      return mockCalendarSessions;
    }
    const { data } = await client.get(endpoints.dashboard.calendarSessions);
    return data;
  },

  async getPackagesList() {
    if (config.useMocks) {
      await mockDelay(300);
      return mockPackagesList;
    }
    const { data } = await client.get(endpoints.dashboard.packagesList);
    return data;
  },

  async getPackageDetails(id) {
    if (config.useMocks) {
      await mockDelay(300);
      const pkg = mockPackagesList.find((p) => p.id === Number(id));
      return { package: pkg ?? null, sessions: mockPackageSessions[Number(id)] ?? [] };
    }
    const { data } = await client.get(endpoints.dashboard.packageDetails(id));
    return data;
  },
};
