import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminSessionsService } from '@/services/adminSessionsService';

/** all: صفحة "كل الجلسات" — بدونه لا يُطلب شيء قبل توفّر teacherId/studentId */
export function useAdminSessions({ all = false, ...filters } = {}) {
  return useQuery({
    queryKey: queryKeys.admin.sessions(filters),
    queryFn: () => adminSessionsService.list(filters),
    placeholderData: keepPreviousData,
    enabled: all || Boolean(filters.teacherId || filters.studentId),
  });
}

export function useAdminRescheduleSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, scheduledAt, notes }) => adminSessionsService.reschedule(sessionId, { scheduledAt, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] });
      // أي طلب تغيير موعد معلّق على الجلسة يُغلق تلقائياً في الباك اند
      queryClient.invalidateQueries({ queryKey: ['admin', 'reschedule-requests'] });
    },
  });
}
