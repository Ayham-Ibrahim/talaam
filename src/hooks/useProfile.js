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
