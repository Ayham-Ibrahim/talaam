import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { sessionAttachmentService } from '@/services/sessionAttachmentService';

export function useSessionAttachments(sessionId) {
  return useQuery({
    queryKey: queryKeys.sessionAttachments(sessionId),
    queryFn: () => sessionAttachmentService.list(sessionId),
    enabled: Boolean(sessionId),
    // download_url موقّع لـ30 دقيقة — إعادة الجلب كل 20 دقيقة تُبقي الروابط صالحة لصفحة مفتوحة طويلاً
    staleTime: 60_000,
    refetchInterval: 20 * 60_000,
  });
}

export function useUploadSessionAttachment(sessionId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => sessionAttachmentService.upload(sessionId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sessionAttachments(sessionId) }),
  });
}

export function useDeleteSessionAttachment(sessionId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId) => sessionAttachmentService.remove(attachmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sessionAttachments(sessionId) }),
  });
}
