import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminSettingsService } from '@/services/adminSettingsService';
import { adminAuditLogService } from '@/services/adminAuditLogService';
import { adminReviewsService } from '@/services/adminReviewsService';

export function useAdminSettings() {
  return useQuery({
    queryKey: queryKeys.admin.settings(),
    queryFn: () => adminSettingsService.getSettings(),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }) => adminSettingsService.updateSetting(key, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings() }),
  });
}

export function useAdminAuditLog(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.auditLog(filters),
    queryFn: () => adminAuditLogService.getAuditLog(filters),
    keepPreviousData: true,
  });
}

export function useAdminReviews(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.reviews(filters),
    queryFn: () => adminReviewsService.getReviews(filters),
    keepPreviousData: true,
  });
}

function useInvalidateReviews() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
}

export function useHideReview() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: ({ id, reason }) => adminReviewsService.hideReview(id, reason),
    onSuccess: invalidate,
  });
}

export function useUnhideReview() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: (id) => adminReviewsService.unhideReview(id),
    onSuccess: invalidate,
  });
}

/** ميزة مؤقتة: رفع تقييمات يدوية لمعلم من لوحة الأدمن — راجع ReviewImportService بالباك */
export function useImportTeacherReviews(teacherId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => adminReviewsService.importForTeacher(teacherId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.seededReviews(teacherId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.teacherDetail(teacherId) });
    },
  });
}

export function useSeededReviews(teacherId) {
  return useQuery({
    queryKey: queryKeys.admin.seededReviews(teacherId),
    queryFn: () => adminReviewsService.getSeededReviews(teacherId),
    enabled: !!teacherId,
  });
}

export function useDeleteSeededReview(teacherId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminReviewsService.deleteSeededReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.seededReviews(teacherId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.teacherDetail(teacherId) });
    },
  });
}
