import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { studentAccountService } from '@/services/studentAccountService';
import { useAuth } from '@/hooks/useAuth';

/** يحدّث user.student.education_type المخزَّن فوراً كي يتوقف حارس التوجيه بلا إعادة تسجيل دخول */
export function useCompleteStudentProfile(id) {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (payload) => studentAccountService.completeProfile(id, payload),
    onSuccess: (_, payload) => updateUser({ student: { education_type: payload.education_type } }),
  });
}

/** يملأ نموذج تبويب "الإعدادات" — نفس مسار useCompleteStudentProfile لكن للتعديل اللاحق لا أول دخول */
export function useMyStudentProfile(id) {
  return useQuery({
    queryKey: queryKeys.students.myProfile(id),
    queryFn: () => studentAccountService.getMyProfile(id),
    enabled: !!id,
  });
}
