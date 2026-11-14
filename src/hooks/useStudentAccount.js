import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { authService } from '@/services/authService';
import { studentAccountService } from '@/services/studentAccountService';
import { useAuth } from '@/hooks/useAuth';

/** يحدّث user.student.education_type المخزَّن فوراً كي يتوقف حارس التوجيه بلا إعادة تسجيل دخول */
export function useCompleteStudentProfile(id) {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (payload) => studentAccountService.completeProfile(id, payload),
    onSuccess: (_, payload) =>
      updateUser({
        student: {
          education_type: payload.education_type,
          country_id: payload.country_id ?? null,
          region_id: payload.region_id ?? null,
        },
      }),
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

/**
 * موقع الطالب الحالي من الخادم لا من الجلسة المخزّنة — جلسة سُجّلت قبل إضافة الموقع
 * لا تحمل country_id أصلاً، وقد يكون أمر students:match-regions ملأه منذ ذلك الحين.
 */
export function useMyLocationStatus(enabled) {
  const { updateUser } = useAuth();
  return useQuery({
    queryKey: ['me', 'location-status'],
    queryFn: async () => {
      const me = await authService.me();
      const location = { country_id: me?.student?.country_id ?? null, region_id: me?.student?.region_id ?? null };
      updateUser({ student: location });
      return location;
    },
    enabled,
    staleTime: Infinity,
  });
}

export function useUpdateMyLocation() {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (location) => studentAccountService.updateLocation(location),
    onSuccess: (_, location) => updateUser({ student: { region_id: null, ...location } }),
  });
}
