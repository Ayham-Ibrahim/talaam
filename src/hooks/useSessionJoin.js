import { useMutation } from '@tanstack/react-query';
import { classSessionService } from '@/services';

/**
 * Verifies the BBB meeting is actually joinable before returning a URL —
 * see classSessionService.join for why this can't be a plain window.open().
 */
export function useJoinSession() {
  return useMutation({
    mutationFn: (sessionId) => classSessionService.join(sessionId),
  });
}
