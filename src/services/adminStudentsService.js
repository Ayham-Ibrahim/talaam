import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { searchMockStudents } from '@/mocks/adminStudents.mock';

/** Backs the admin's manual-booking student picker — admin-only per StudentPolicy::viewAny */
export const adminStudentsService = {
  async search(query) {
    if (config.useMocks) {
      await mockDelay(200);
      return searchMockStudents(query);
    }
    const { data } = await client.get(endpoints.students.search, { params: { search: query, per_page: 10 } });
    return data.data;
  },
};
