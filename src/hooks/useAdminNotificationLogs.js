import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminNotificationLogsService } from '@/services/adminNotificationLogsService';

export function useAdminNotificationLogs(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.notificationLogs(filters),
    queryFn: () => adminNotificationLogsService.getLogs(filters),
    keepPreviousData: true,
  });
}
