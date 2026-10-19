import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminSessionsService } from '@/services/adminSessionsService';

export function useAdminSessions(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.sessions(filters),
    queryFn: () => adminSessionsService.list(filters),
    placeholderData: keepPreviousData,
    enabled: Boolean(filters.teacherId || filters.studentId),
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
