import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { reportsService } from '@/services/reportsService';

export function useTeacherSessionsReport(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.teacherSessionsReport(filters),
    queryFn: () => reportsService.getTeacherSessionsReport(filters),
    keepPreviousData: true,
  });
}

export function useExportTeacherSessionsReport() {
  return useMutation({
    mutationFn: (filters) => reportsService.exportTeacherSessionsReport(filters),
  });
}
