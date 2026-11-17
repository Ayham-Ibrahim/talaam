import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'my-reschedule-requests'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.calendarSessions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacherCalendarSessions() });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'package-details'] });
      // جلسات لوحة المعلم صفوف خام (snake_case) — إعادة الجلب تكفي لإظهار الحالة الجديدة
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacherSessions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacherSessionDetails(sessionId) });
    },
  });
}

/**
 * ما ينتظر تصرّف الطالب/المعلم — بطاقة اللوحة الرئيسية، والشريط أعلى اللوحة، ورقم "الجلسات".
 * تحت ['dashboard'] عمداً: الرد على طلب أو اقتراح تعويضية يُحدّثه تلقائياً. يُعاد كل دقيقة
 * كي يظهر طلب وصل للتو ويختفي ما انتهت مهلته دون تحديث الصفحة.
 */
export function usePendingActions(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'pending-actions'],
    queryFn: () => rescheduleService.pendingActions(),
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** "طلباتي": طلبات تغيير الموعد/التعويض التي أرسلها المستخدم وحالة كل منها */
export function useMyRescheduleRequests(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'my-reschedule-requests'],
    queryFn: () => rescheduleService.myRequests(),
    enabled,
    staleTime: 30_000,
  });
}

/** اقتراح موعد جلسة تعويضية (غياب المعلم) — يُرسل للطرف الآخر */
export function useCreateMakeupRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, proposedScheduledAt, reason }) =>
      rescheduleService.createMakeupRequest(sessionId, { proposedScheduledAt, reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });
}

/** رد الطرف الآخر (قبول/رفض) — القبول يغيّر موعد الجلسة، فتُعاد كل قوائم الجلسات */
export function useRespondRescheduleRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, accept }) => rescheduleService.respond(requestId, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
