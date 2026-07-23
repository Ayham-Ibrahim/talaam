import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { filterMockPayouts, updateMockPayout, createMockPayout } from '@/mocks/adminPayouts.mock';

export const adminPayoutsService = {
  async getPayouts(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      const data = filterMockPayouts(filters);
      return { data, total: data.length };
    }
    const { data } = await client.get(endpoints.admin.payouts, { params: filters });
    return data;
  },

  async generatePayout(providerId) {
    if (config.useMocks) {
      await mockDelay(400);
      return createMockPayout(providerId);
    }
    const { data } = await client.post(endpoints.admin.generatePayout(providerId));
    return data;
  },

  async approvePayout(id) {
    if (config.useMocks) {
      await mockDelay(350);
      return updateMockPayout(id, { status: 'approved', approvedAt: new Date().toISOString().slice(0, 10) });
    }
    const { data } = await client.post(endpoints.admin.approvePayout(id));
    return data;
  },

  async markPayoutPaid(id) {
    if (config.useMocks) {
      await mockDelay(350);
      return updateMockPayout(id, { status: 'paid', paidAt: new Date().toISOString().slice(0, 10) });
    }
    const { data } = await client.post(endpoints.admin.markPayoutPaid(id));
    return data;
  },
};
