import { useMutation } from '@tanstack/react-query';
import { rescheduleService } from '@/services';

export function useCreateRescheduleRequest() {
  return useMutation({
    mutationFn: ({ sessionId, proposedScheduledAt, reason }) =>
      rescheduleService.createRequest(sessionId, { proposedScheduledAt, reason }),
  });
}
