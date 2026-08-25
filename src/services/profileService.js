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

  /** يعيد الحساب للصورة الافتراضية (أحرف الاسم الأولى) — آمنة التكرار حتى لو لم تكن هناك صورة أصلاً */
  async deleteAvatar() {
    if (config.useMocks) {
      await mockDelay(300);
      return { avatar_path: null };
    }
    const { data } = await client.delete(endpoints.profile.deleteAvatar);
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

  /** استدعاء صامت من الفرونت — الباك يتجاهله بهدوء إن كان المستخدم قد ثبَّت منطقته يدوياً (timezone_auto=false) */
  async syncTimezone(timezone) {
    if (config.useMocks) {
      await mockDelay(100);
      return null;
    }
    const { data } = await client.put(endpoints.profile.syncTimezone, { timezone });
    return data.data;
  },
};
