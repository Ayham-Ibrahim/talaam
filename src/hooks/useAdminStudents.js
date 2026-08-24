import { useMutation, useQuery } from '@tanstack/react-query';
import { adminStudentsService } from '@/services/adminStudentsService';

export function useAdminStudentSearch(query) {
  return useQuery({
    queryKey: ['admin', 'students-search', query],
    queryFn: () => adminStudentsService.search(query),
    enabled: query.trim().length > 1,
  });
}

export function useAdminStudentsList(filters = {}) {
  return useQuery({
    queryKey: ['admin', 'students-list', filters],
    queryFn: () => adminStudentsService.list(filters),
    keepPreviousData: true,
  });
}

export function useAdminResetStudentPassword() {
  return useMutation({
    mutationFn: ({ studentId, password }) => adminStudentsService.resetPassword(studentId, password),
  });
}
