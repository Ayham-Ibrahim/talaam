import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherAccountService } from '@/services/teacherAccountService';
import { useAuth } from '@/hooks/useAuth';

const myTeacherKey = (id) => ['teachers', 'my-detail', id];

export function useMyTeacher(id) {
  return useQuery({
    queryKey: myTeacherKey(id),
    queryFn: () => teacherAccountService.getMyTeacher(id),
    enabled: !!id,
  });
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
