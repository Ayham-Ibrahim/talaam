import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminService } from '@/services/adminService';

export function useAdminOverview() {
  return useQuery({
    queryKey: queryKeys.admin.overview(),
    queryFn: () => adminService.getOverview(),
  });
}

export function useAdminTeachers(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.teachers(filters),
    queryFn: () => adminService.getTeachers(filters),
    keepPreviousData: true,
  });
}

export function useAdminTeacherDetail(id) {
  return useQuery({
    queryKey: queryKeys.admin.teacherDetail(id),
    queryFn: () => adminService.getTeacherDetail(id),
    enabled: !!id,
  });
}

/** Invalidates every query a teacher status/document/badge change could affect */
function useInvalidateTeacher(id) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview() });
    queryClient.invalidateQueries({ queryKey: ['admin', 'teachers'] });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.admin.teacherDetail(id) });
  };
}

export function useApproveTeacher(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: (teacherId) => adminService.approveTeacher(teacherId),
    onSuccess: invalidate,
  });
}

export function useRejectTeacher(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: ({ teacherId, reason }) => adminService.rejectTeacher(teacherId, reason),
    onSuccess: invalidate,
  });
}

export function useSuspendTeacher(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: ({ teacherId, reason }) => adminService.suspendTeacher(teacherId, reason),
    onSuccess: invalidate,
  });
}

export function useReactivateTeacher(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: (teacherId) => adminService.reactivateTeacher(teacherId),
    onSuccess: invalidate,
  });
}

export function useApproveDocument(teacherId) {
  const invalidate = useInvalidateTeacher(teacherId);
  return useMutation({
    mutationFn: (documentId) => adminService.approveDocument(documentId),
    onSuccess: invalidate,
  });
}

export function useRejectDocument(teacherId) {
  const invalidate = useInvalidateTeacher(teacherId);
  return useMutation({
    mutationFn: ({ documentId, reason }) => adminService.rejectDocument(documentId, reason),
    onSuccess: invalidate,
  });
}

export function useGrantBadge(teacherId) {
  const invalidate = useInvalidateTeacher(teacherId);
  return useMutation({
    mutationFn: (badgeId) => adminService.grantBadge(teacherId, badgeId),
    onSuccess: invalidate,
  });
}

export function useRevokeBadge(teacherId) {
  const invalidate = useInvalidateTeacher(teacherId);
  return useMutation({
    mutationFn: (awardId) => adminService.revokeBadge(awardId),
    onSuccess: invalidate,
  });
}
