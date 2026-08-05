import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/**
 * إجراءات المعلم على حسابه الخاص أثناء إكمال الملف الشخصي: تحديث البيانات،
 * رفع وثائق التوثيق، ثم إرسال الطلب للمراجعة (TeacherService::updateProfile/
 * submitForVerification). لا مقابل مباشر في وضع المحاكاة — هذه الشاشة مبنية
 * مباشرة ضد الباك الحقيقي فقط.
 */
export const teacherAccountService = {
  async getMyTeacher(id) {
    if (config.useMocks) {
      await mockDelay(200);
      return null;
    }
    const { data } = await client.get(endpoints.teachers.detail(id));
    return data.data;
  },

  async updateProfile(id, payload) {
    if (config.useMocks) {
      await mockDelay(300);
      return payload;
    }
    const { data } = await client.put(endpoints.teachers.update(id), payload);
    return data.data;
  },

  async uploadDocument(id, type, file) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: Date.now(), type, status: 'pending' };
    }
    const form = new FormData();
    form.append('type', type);
    form.append('file', file);
    const { data } = await client.post(endpoints.teachers.uploadDocument(id), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async submitForVerification(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return true;
    }
    const { data } = await client.post(endpoints.teachers.submitForVerification(id));
    return data.data;
  },
};
