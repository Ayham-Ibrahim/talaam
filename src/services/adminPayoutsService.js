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
    return { data: data.data, total: data.meta?.total ?? data.data.length };
  },

  async generatePayout({ teacherId, periodStart, periodEnd }) {
    if (config.useMocks) {
      await mockDelay(400);
      return createMockPayout(teacherId);
    }
    const { data } = await client.post(endpoints.admin.generatePayout(teacherId), {
      period_start: periodStart,
      period_end: periodEnd,
    });
    return data.data;
  },

  async approvePayout(id) {
    if (config.useMocks) {
      await mockDelay(350);
      return updateMockPayout(id, { status: 'approved', approvedAt: new Date().toISOString().slice(0, 10) });
    }
    const { data } = await client.post(endpoints.admin.approvePayout(id));
    return data.data;
  },

  async markPayoutPaid(id, transferReference) {
    if (config.useMocks) {
      await mockDelay(350);
      return updateMockPayout(id, { status: 'paid', paidAt: new Date().toISOString().slice(0, 10) });
    }
    const { data } = await client.post(endpoints.admin.markPayoutPaid(id), { transfer_reference: transferReference });
    return data.data;
  },
};
