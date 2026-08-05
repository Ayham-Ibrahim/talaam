import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** رفع صورة شخصية للمستخدم الحالي بصرف النظر عن دوره (ProfileController::uploadAvatar) */
export const profileService = {
  async uploadAvatar(file) {
    if (config.useMocks) {
      await mockDelay(400);
      return { avatar_path: URL.createObjectURL(file) };
    }
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await client.post(endpoints.profile.uploadAvatar, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
};
