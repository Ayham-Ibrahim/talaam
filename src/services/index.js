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
