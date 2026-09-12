import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useAdminStudentDetail(id) {
  return useQuery({
    queryKey: ['admin', 'student-detail', id],
    queryFn: () => adminStudentsService.getDetail(id),
    enabled: !!id,
  });
}

/** يبطل كلاً من كاش صفحة التفاصيل وقائمة الطلاب — نفس نمط useInvalidateTeacher في useAdmin.js */
function useInvalidateStudent(id) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'students-list'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['admin', 'student-detail', id] });
  };
}

export function useAdminUpdateStudentProfile(id) {
  const invalidate = useInvalidateStudent(id);
  return useMutation({
    mutationFn: (payload) => adminStudentsService.updateProfile(id, payload),
    onSuccess: invalidate,
  });
}

export function useAdminUploadStudentAvatar(id) {
  const invalidate = useInvalidateStudent(id);
  return useMutation({
    mutationFn: (file) => adminStudentsService.uploadAvatar(id, file),
    onSuccess: invalidate,
  });
}

export function useAdminDeleteStudentAvatar(id) {
  const invalidate = useInvalidateStudent(id);
  return useMutation({
    mutationFn: () => adminStudentsService.deleteAvatar(id),
    onSuccess: invalidate,
  });
}
