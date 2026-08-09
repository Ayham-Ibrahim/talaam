import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** إجراءات المستخدم الحالي على حسابه الخاص، بصرف النظر عن دوره (ProfileController) */
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

  async updateProfile(payload) {
    if (config.useMocks) {
      await mockDelay(300);
      return payload;
    }
    const { data } = await client.put(endpoints.profile.update, payload);
    return data.data;
  },

  async updatePassword(payload) {
    if (config.useMocks) {
      await mockDelay(300);
      return null;
    }
    const { data } = await client.put(endpoints.profile.updatePassword, payload);
    return data.data;
  },
};
