import { useQuery } from '@tanstack/react-query';
import { adminStudentsService } from '@/services/adminStudentsService';

export function useAdminStudentSearch(query) {
  return useQuery({
    queryKey: ['admin', 'students-search', query],
    queryFn: () => adminStudentsService.search(query),
    enabled: query.trim().length > 1,
  });
}
