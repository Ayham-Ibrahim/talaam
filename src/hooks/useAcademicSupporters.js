import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { academicSupporterService } from '@/services/academicSupporterService';

/** إدارة حسابات الداعمين الأكاديميين من لوحة الأدمن — قسم منفصل تماماً عن إدارة المعلمين. */
export function useAdminAcademicSupporters(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.academicSupporters(filters),
    queryFn: () => academicSupporterService.getAdminList(filters),
    keepPreviousData: true,
  });
}

export function useAdminAcademicSupporterDetail(id) {
  return useQuery({
    queryKey: queryKeys.admin.academicSupporterDetail(id),
    queryFn: () => academicSupporterService.getAdminDetail(id),
    enabled: !!id,
  });
}

export function useCreateAcademicSupporterAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => academicSupporterService.createAccount(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'academic-supporters'] }),
  });
}

function useInvalidateAcademicSupporter(id) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'academic-supporters'] });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.admin.academicSupporterDetail(id) });
  };
}

export function useAdminResetAcademicSupporterPassword() {
  return useMutation({
    mutationFn: ({ supporterId, password }) => academicSupporterService.resetPassword(supporterId, password),
  });
}

export function useSuspendAcademicSupporter(id) {
  const invalidate = useInvalidateAcademicSupporter(id);
  return useMutation({
    mutationFn: ({ supporterId, reason }) => academicSupporterService.suspend(supporterId, reason),
    onSuccess: invalidate,
  });
}

export function useReactivateAcademicSupporter(id) {
  const invalidate = useInvalidateAcademicSupporter(id);
  return useMutation({
    mutationFn: (supporterId) => academicSupporterService.reactivate(supporterId),
    onSuccess: invalidate,
  });
}

export function useDeleteAcademicSupporter() {
  const invalidate = useInvalidateAcademicSupporter();
  return useMutation({
    mutationFn: (supporterId) => academicSupporterService.deleteAccount(supporterId),
    onSuccess: invalidate,
  });
}

export function useAdminUpdateAcademicSupporterProfile(id) {
  const invalidate = useInvalidateAcademicSupporter(id);
  return useMutation({
    mutationFn: (payload) => academicSupporterService.updateProfile(id, payload),
    onSuccess: invalidate,
  });
}

export function useAdminApproveSupportPackage(supporterId) {
  const invalidate = useInvalidateAcademicSupporter(supporterId);
  return useMutation({
    mutationFn: (id) => academicSupporterService.approveSupportPackage(id),
    onSuccess: invalidate,
  });
}

export function useAdminRejectSupportPackage(supporterId) {
  const invalidate = useInvalidateAcademicSupporter(supporterId);
  return useMutation({
    mutationFn: ({ id, reason }) => academicSupporterService.rejectSupportPackage(id, reason),
    onSuccess: invalidate,
  });
}

export function useAdminCreateSupportPackage(supporterId) {
  const invalidate = useInvalidateAcademicSupporter(supporterId);
  return useMutation({
    mutationFn: (payload) => academicSupporterService.createSupportPackage(payload),
    onSuccess: invalidate,
  });
}

export function useAdminUpdateSupportPackage(supporterId) {
  const invalidate = useInvalidateAcademicSupporter(supporterId);
  return useMutation({
    mutationFn: ({ id, payload }) => academicSupporterService.updateSupportPackage(id, payload),
    onSuccess: invalidate,
  });
}

export function useAdminDisableSupportPackage(supporterId) {
  const invalidate = useInvalidateAcademicSupporter(supporterId);
  return useMutation({
    mutationFn: (id) => academicSupporterService.disableSupportPackage(id),
    onSuccess: invalidate,
  });
}

export function useAdminEnableSupportPackage(supporterId) {
  const invalidate = useInvalidateAcademicSupporter(supporterId);
  return useMutation({
    mutationFn: (id) => academicSupporterService.enableSupportPackage(id),
    onSuccess: invalidate,
  });
}
