import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { mockTeachers, filterMockTeachers } from '@/mocks/teachers.mock';

/**
 * Teacher service — the ONLY module that knows how teacher data is fetched.
 * Each method returns mock data or a real API call based on config.useMocks.
 * Components/hooks never care which; the return shape is identical.
 */
export const teacherService = {
  async getTeachers(filters = {}) {
    if (config.useMocks) {
      await mockDelay();
      const data = filterMockTeachers(mockTeachers, filters);
      return { data, total: data.length };
    }
    const { data } = await client.get(endpoints.teachers.list, { params: filters });
    return data;
  },

  async getFeatured() {
    if (config.useMocks) {
      await mockDelay();
      return mockTeachers.slice(0, 5);
    }
    const { data } = await client.get(endpoints.teachers.featured);
    return data;
  },

  async getTeacherById(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return mockTeachers.find((t) => t.id === Number(id)) ?? null;
    }
    const { data } = await client.get(endpoints.teachers.detail(id));
    return data;
  },
};
