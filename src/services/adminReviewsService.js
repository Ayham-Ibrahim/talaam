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
    isSeeded: raw.is_seeded,
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

  /** ميزة مؤقتة: رفع ملف Excel/CSV بتقييمات يدوية لمعلم — راجع ReviewImportService بالباك */
  async importForTeacher(teacherId, file) {
    if (config.useMocks) {
      await mockDelay(500);
      return { imported: 0, failed: 0, errors: [] };
    }
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await client.post(endpoints.teachers.importReviews(teacherId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return data.data;
  },

  async getSeededReviews(teacherId) {
    if (config.useMocks) {
      await mockDelay(300);
      return [];
    }
    const { data } = await client.get(endpoints.teachers.seededReviews(teacherId));
    return data.data.map(mapReview);
  },

  async deleteSeededReview(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return null;
    }
    await client.delete(endpoints.admin.deleteReview(id));
    return null;
  },
};
