import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { filterMockPayouts, findMockPayout, updateMockPayout } from '@/mocks/adminPayouts.mock';

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

  /** تفاصيل كشف: الإجماليات + بنوده (جلسة/تسوية) — PayoutController::show */
  async getPayoutDetails(id) {
    if (config.useMocks) {
      await mockDelay(300);
      const payout = findMockPayout(id);
      return payout ? { ...payout, grossAmount: payout.totalAmount, deductions: 0, items: [] } : null;
    }
    const { data } = await client.get(endpoints.admin.payoutDetails(id));
    return data.data;
  },

  /** كشف لكل معلم بكل مستحقاته غير المصروفة حتى لحظة الضغط — PayoutController::generate، يُرجع { created } */
  async generatePayouts() {
    if (config.useMocks) {
      await mockDelay(400);
      return { created: 0 };
    }
    const { data } = await client.post(endpoints.admin.generatePayouts);
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

  /** PDF — متاح بحالتَي الكشف: غير مدفوع ومدفوع (PayoutController::downloadInvoice) */
  async downloadInvoice(id) {
    if (config.useMocks) {
      await mockDelay(400);
      return new Blob(['Demo mode — no real invoice available.'], { type: 'application/pdf' });
    }
    const { data } = await client.get(endpoints.admin.payoutInvoice(id), { responseType: 'blob' });
    return data;
  },

  /** Excel لكل المستحقات المطابقة للفلتر الحالي (كل المعلمين، أو حالة معيّنة) */
  async exportPayouts(filters = {}) {
    if (config.useMocks) {
      await mockDelay(500);
      return new Blob(['Demo mode — no real export available.'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }
    const { data } = await client.get(endpoints.admin.exportPayouts, { params: filters, responseType: 'blob' });
    return data;
  },
};
