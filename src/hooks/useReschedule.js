import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { rescheduleService } from '@/services';

function markPendingSession(session, sessionId) {
  if (!session || session.id !== sessionId) return session;

  return {
    ...session,
    status: 'reschedule_pending',
    canReschedule: false,
    hasPendingRescheduleRequest: true,
    pendingRescheduleRequestCreatedAt: new Date().toISOString(),
  };
}

export function useCreateRescheduleRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, proposedScheduledAt, reason }) =>
      rescheduleService.createRequest(sessionId, { proposedScheduledAt, reason }),
    onSuccess: (_, { sessionId }) => {
      queryClient.setQueriesData({ queryKey: ['dashboard', 'sessions'] }, (current) =>
        current && Array.isArray(current.data)
          ? { ...current, data: current.data.map((session) => markPendingSession(session, sessionId)) }
          : current,
      );

      queryClient.setQueryData(queryKeys.dashboard.calendarSessions(), (current) =>
        Array.isArray(current) ? current.map((session) => markPendingSession(session, sessionId)) : current,
      );

      queryClient.setQueryData(queryKeys.dashboard.teacherCalendarSessions(), (current) =>
        Array.isArray(current) ? current.map((session) => markPendingSession(session, sessionId)) : current,
      );

      queryClient.setQueriesData({ queryKey: ['dashboard', 'package-details'] }, (current) =>
        current && Array.isArray(current.sessions)
          ? { ...current, sessions: current.sessions.map((session) => markPendingSession(session, sessionId)) }
          : current,
      );

      queryClient.invalidateQueries({ queryKey: ['dashboard', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.calendarSessions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacherCalendarSessions() });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'package-details'] });
    },
  });
}
