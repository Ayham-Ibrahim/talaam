import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { disconnectEcho } from '@/lib/echo';
import { useAuthStore } from '@/store';
import { trackMetaEvent } from '@/lib/metaPixel';
import { gtmSignUp } from '@/lib/gtm';

/** Current session — components read auth state through this, never the store directly */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateUser = useAuthStore((s) => s.updateUser);
  return { user, isAuthenticated, updateUser };
}

/**
 * user المخزَّن يُلتقط مرة واحدة عند الدخول — أي تعديل يتم من خارج هذا الجهاز (الأدمن
 * يغيّر المنطقة الزمنية أو الاسم، أو المستخدم نفسه من جهاز آخر) لا يصل إليه أبداً، فتُعرَض
 * مثلاً أوقات الجلسات بمنطقة قديمة. نجلب /auth/me عند فتح التطبيق وعند العودة إليه وندمجه
 * فوق النسخة المخزّنة. المفتاح يحمل id المستخدم كي لا تُدمج استجابة حساب سابق (تبديل أخ).
 *
 * قوائم الجلسات تُنسَّق أوقاتها نصاً لحظة الجلب (accountTimeZone في services) وتُخزَّن هكذا
 * في الكاش، فتغيّر المنطقة وحده لا يعيد عرضها — نُبطل الاستعلامات عند تغيّرها فتُجلب بالمنطقة الجديدة.
 */
export function useSyncCurrentUser() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { data } = useQuery({
    queryKey: ['me', userId],
    queryFn: () => authService.me(),
    enabled: userId != null,
    refetchOnWindowFocus: true,
    retry: false,
  });

  useEffect(() => {
    const current = useAuthStore.getState().user;
    if (!data || data.id !== current?.id) return;
    const timezoneChanged = data.timezone !== current.timezone;
    updateUser(data);
    if (timezoneChanged) {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== 'me' });
    }
  }, [data, updateUser, queryClient]);
}

/** الباك اند يُنشئ الحساب ويُعيد توكناً صالحاً فوراً (نفس شكل استجابة login) — دخول تلقائي بلا خطوة تسجيل دخول منفصلة بعد التسجيل */
export function useRegisterStudent() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (payload) => authService.registerStudent(payload),
    onSuccess: (data) => {
      login({ user: data.user, token: data.token }, true);
      // نفس event_id الذي يرسله السيرفر (Conversions API) — Meta تُبقي حدثاً واحداً
      trackMetaEvent('CompleteRegistration', { content_name: 'student', status: true }, `registration_${data.user.id}`);
      gtmSignUp();
    },
  });
}

/** نفس منطق useRegisterStudent — دخول تلقائي فوراً بعد إنشاء حساب المعلم، بلا خطوة تسجيل دخول منفصلة */
export function useRegisterTeacher() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (payload) => authService.registerTeacher(payload),
    onSuccess: (data) => {
      login({ user: data.user, token: data.token }, true);
    },
  });
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
      disconnectEcho();
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
