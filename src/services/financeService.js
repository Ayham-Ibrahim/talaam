import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** الصفحات المالية المشتركة بين الأدمن والمحاسب (BookingPolicy::viewAny/view تشمل المحاسب). */
export const financeService = {
  async getBookings({ status } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return { data: [], total: 0 };
    }
    const { data } = await client.get(endpoints.bookings.list, {
      params: { status: status || undefined, per_page: 100 },
    });
    return { data: data.data ?? [], total: data.meta?.total ?? (data.data ?? []).length };
  },
};
