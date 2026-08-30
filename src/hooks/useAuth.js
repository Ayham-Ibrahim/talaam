import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store';

/** Current session — components read auth state through this, never the store directly */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateUser = useAuthStore((s) => s.updateUser);
  return { user, isAuthenticated, updateUser };
}

export function useLogin() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: ({ email, password }) => authService.login({ email, password }),
    onSuccess: (data, variables) => {
      login({ user: data.user, token: data.token }, variables.rememberMe);
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    // نُبطل توكن الخادم أولاً بينما هو ما زال في المتجر؛ لو فشل النداء (شبكة
    // أو توكن منتهٍ) نبتلع الخطأ ونُكمل الخروج المحلي على أي حال — best-effort.
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch {
        /* ignore — الخروج المحلي أدناه هو ما يهمّ فعلياً */
      }
    },
    // نجح النداء أو فشل: امسح الجلسة محلياً + كل كاش الاستعلامات (بيانات الطالب
    // المخزَّنة) ثم وجّه صراحةً للصفحة العامة. لا نعتمد على إعادة تصيير
    // ProtectedRoute وحدها — التوجيه فوري ومحدَّد. أي فتح لاحق لصفحة محمية
    // يعيد ProtectedRoute توجيهه إلى /login لأن isAuthenticated أصبح false.
    onSettled: () => {
      clearSession();
      queryClient.clear();
      navigate('/', { replace: true });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email) => authService.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload) => authService.resetPassword(payload),
  });
}
