import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '@/api/queryKeys';
import { siblingService } from '@/services/siblingService';
import { useAuthStore } from '@/store';

/** حسابات العائلة لمبدّل الحسابات وقسم "إخوتي" — للطالب فقط */
export function useSiblingFamily({ enabled = true } = {}) {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery({
    queryKey: queryKeys.siblings.family(),
    queryFn: () => siblingService.family(),
    enabled: enabled && role === 'student',
  });
}

export function useAddSibling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => siblingService.add(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.siblings.family() }),
  });
}

/**
 * يبدّل الجلسة إلى حساب آخر من العائلة: يستبدل التوكن والمستخدم المخزَّنين (بنفس
 * مكان التخزين local/session الحالي) ويمسح كل كاش الاستعلامات — بيانات الحجوزات
 * والجلسات المخزَّنة تخص الحساب السابق ولا يجوز أن تظهر للحساب الجديد.
 */
export function useSwitchAccount() {
  const login = useAuthStore((s) => s.login);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userId) => siblingService.switchTo(userId),
    onSuccess: ({ user, token }) => {
      let rememberMe = true;
      try {
        rememberMe = !!localStorage.getItem('taalam-auth');
      } catch {
        /* تخزين غير متاح — نُبقي الافتراضي */
      }
      queryClient.clear();
      login({ user, token }, rememberMe);
      navigate('/dashboard/student', { replace: true });
    },
  });
}
