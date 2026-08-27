import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherAccountService } from '@/services/teacherAccountService';
import { useAuth } from '@/hooks/useAuth';

const myTeacherKey = (id) => ['teachers', 'my-detail', id];

/**
 * status المخزَّن في user (localStorage) يُحدَّث فقط صراحةً عبر updateUser —
 * فلو غيّر الأدمن حالة المعلم (اعتماد/رفض/تعليق) من جلسة أخرى، تبقى شاشة هذا
 * المعلم عالقة على الحالة القديمة (ProtectedRoute وهذه الصفحة كلاهما يقرأان
 * user.teacher.status) حتى يُعيد تسجيل الدخول يدوياً. بدل تسجيل خروجه قسراً،
 * نزامن الحالة الحقيقية تلقائياً كل مرة يصل فيها رد فعلي من الباك.
 */
export function useMyTeacher(id) {
  const { updateUser } = useAuth();
  const query = useQuery({
    queryKey: myTeacherKey(id),
    queryFn: () => teacherAccountService.getMyTeacher(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    // بينما الحساب بانتظار المراجعة تحديداً: فحص دوري خفيف كي يرى المعلم قرار
    // الأدمن بلا حتى الحاجة للتبديل بين التبويبات؛ يتوقف فوراً بعد أي قرار.
    refetchInterval: (q) => (q.state.data?.status === 'pending_verification' ? 20000 : false),
  });
  const status = query.data?.status;

  useEffect(() => {
    if (status) updateUser({ teacher: { status } });
  }, [status, updateUser]);

  return query;
}

export function useUpdateMyTeacherProfile(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => teacherAccountService.updateProfile(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myTeacherKey(id) }),
  });
}

export function useUploadVerificationDocument(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, file }) => teacherAccountService.uploadDocument(id, type, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myTeacherKey(id) }),
  });
}

/** ينقل status من active_unverified إلى pending_verification — يحدّث user المخزَّن كي يتوقف حارس التوجيه فوراً بلا إعادة تسجيل دخول */
export function useSubmitForVerification(id) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: () => teacherAccountService.submitForVerification(id),
    onSuccess: () => {
      updateUser({ teacher: { status: 'pending_verification' } });
      queryClient.invalidateQueries({ queryKey: myTeacherKey(id) });
    },
  });
}
