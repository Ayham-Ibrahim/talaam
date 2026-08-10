import { useMutation } from '@tanstack/react-query';
import { profileService } from '@/services/profileService';
import { useAuth } from '@/hooks/useAuth';

/**
 * يحدّث user.avatar/user.avatar_path المخزَّن فوراً بعد الرفع بلا إعادة تسجيل
 * دخول. يُحدَّث الحقلان فقط عمداً — UserResource لا يحمّل teacher/student
 * (whenLoaded)، فدمج الرد كاملاً كان سيمسح user.teacherType الموجود بالفعل.
 */
export function useUploadAvatar() {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (file) => profileService.uploadAvatar(file),
    onSuccess: (data) => updateUser({ avatar_path: data.avatar_path, avatar: data.avatar_path }),
  });
}

/** يحدّث بيانات الحساب الأساسية (اسم/هاتف/واتساب/جنس/منطقة زمنية) فوراً في المتجر بلا إعادة تسجيل دخول */
export function useUpdateProfile() {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (payload) => profileService.updateProfile(payload),
    onSuccess: (data) =>
      updateUser({ name: data.name, phone: data.phone, timezone: data.timezone, timezone_auto: data.timezone_auto }),
  });
}

/** لا يُحدّث المتجر — الباك يُبطل كل الجلسات الأخرى فقط، الجلسة الحالية تبقى صالحة بلا أي تغيير محلي */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (payload) => profileService.updatePassword(payload),
  });
}

/**
 * تُستدعى صامتة مرة واحدة عند تحميل التطبيق (App.jsx) — الباك يتجاهلها بهدوء
 * إن كان المستخدم قد ثبَّت منطقته الزمنية يدوياً من الإعدادات، فلا تأثير سلبياً لاستدعائها دائماً.
 */
export function useSyncTimezone() {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (timezone) => profileService.syncTimezone(timezone),
    onSuccess: (data) => {
      if (data?.timezone) updateUser({ timezone: data.timezone, timezone_auto: data.timezone_auto });
    },
  });
}
