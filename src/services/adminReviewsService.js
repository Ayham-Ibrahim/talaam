import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { filterMockAdminReviews, updateMockReview } from '@/mocks/adminReviews.mock';

export const adminReviewsService = {
  async getReviews(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      const data = filterMockAdminReviews(filters);
      return { data, total: data.length };
    }
    const { data } = await client.get(endpoints.admin.reviews, { params: filters });
    return data;
  },

  async hideReview(id, reason) {
    if (config.useMocks) {
      await mockDelay(350);
      return updateMockReview(id, { isHidden: true, hiddenReason: reason });
    }
    const { data } = await client.post(endpoints.admin.hideReview(id), { reason });
    return data;
  },

  async unhideReview(id) {
    if (config.useMocks) {
      await mockDelay(350);
      return updateMockReview(id, { isHidden: false, hiddenReason: null });
    }
    const { data } = await client.post(endpoints.admin.unhideReview(id));
    return data;
  },
};
