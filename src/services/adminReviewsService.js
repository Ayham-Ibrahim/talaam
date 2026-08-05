import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { filterMockAdminReviews, updateMockReview } from '@/mocks/adminReviews.mock';

/** Mirrors AdminReviewResource — no per-review subject is exposed by the backend (would need a deep booking/enrollment→package/course join), left undefined rather than fabricated. */
function mapReview(raw) {
  return {
    id: raw.id,
    studentName: raw.student_name,
    teacherName: raw.teacher_name,
    subjectName: undefined,
    rating: raw.rating,
    comment: raw.comment,
    createdAt: raw.created_at,
    isHidden: raw.is_hidden,
    hiddenReason: raw.hidden_reason,
  };
}

export const adminReviewsService = {
  async getReviews(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      const data = filterMockAdminReviews(filters);
      return { data, total: data.length };
    }
    const params = {
      is_hidden: filters.visibility === 'hidden' ? true : filters.visibility === 'visible' ? false : undefined,
    };
    const { data } = await client.get(endpoints.admin.reviews, { params });
    const items = data.data.map(mapReview);
    return { data: items, total: data.meta?.total ?? items.length };
  },

  async hideReview(id, reason) {
    if (config.useMocks) {
      await mockDelay(350);
      return updateMockReview(id, { isHidden: true, hiddenReason: reason });
    }
    const { data } = await client.post(endpoints.admin.hideReview(id), { reason });
    return mapReview(data.data);
  },

  async unhideReview(id) {
    if (config.useMocks) {
      await mockDelay(350);
      return updateMockReview(id, { isHidden: false, hiddenReason: null });
    }
    const { data } = await client.post(endpoints.admin.unhideReview(id));
    return mapReview(data.data);
  },
};
