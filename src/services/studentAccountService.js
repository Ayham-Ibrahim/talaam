import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** الطالب على ملفه الخاص (StudentController::update/show) — إكمال أول دخول أو تعديل لاحق من الإعدادات، نفس المسار في الحالتين */
export const studentAccountService = {
  async completeProfile(id, payload) {
    if (config.useMocks) {
      await mockDelay(300);
      return payload;
    }
    const { data } = await client.put(endpoints.students.update(id), payload);
    return data.data;
  },

  /** يملأ نموذج الإعدادات — StudentProfileResource يعيد الأسماء والمعرّفات معاً (الأخيرة لازمة لتعبئة القوائم المنسدلة) */
  async getMyProfile(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return null;
    }
    const { data } = await client.get(endpoints.students.detail(id));
    return data.data;
  },
};
