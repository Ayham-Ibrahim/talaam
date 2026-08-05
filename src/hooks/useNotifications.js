import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';

export function useNotifications(options = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationService.getNotifications(),
    enabled: isAuthenticated && options.enabled !== false,
  });
}

/** يُستطلَع كل دقيقة لتحديث شارة الجرس بلا حاجة لفتح القائمة */
export function useUnreadNotificationsCount() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
  };
}

export function useMarkNotificationRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onSuccess: invalidate,
  });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: invalidate,
  });
}
