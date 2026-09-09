import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminService } from '@/services/adminService';

/** يُستطلَع كل دقيقة — نفس البيانات تغذّي النقاط الحمراء على شريط تنقّل الأدمن (ريثما تُستبدَل بإشعارات Firebase لحظية) */
export function useAdminOverview() {
  return useQuery({
    queryKey: queryKeys.admin.overview(),
    queryFn: () => adminService.getOverview(),
    refetchInterval: 60000,
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

export function useCreateTeacherAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminService.createTeacherAccount(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'teachers'] }),
  });
}

export function useCreateStudentAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminService.createStudentAccount(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'students-list'] }),
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

export function useDeleteTeacher() {
  const invalidate = useInvalidateTeacher();
  return useMutation({
    mutationFn: (teacherId) => adminService.deleteTeacher(teacherId),
    onSuccess: invalidate,
  });
}

export function useAdminResetTeacherPassword() {
  return useMutation({
    mutationFn: ({ teacherId, password }) => adminService.resetTeacherPassword(teacherId, password),
  });
}

export function useDocumentDownloadUrl() {
  return useMutation({
    mutationFn: (documentId) => adminService.getDocumentDownloadUrl(documentId),
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

/**
 * إكمال ملف المعلم واعتماده من الأدمن دون انتظاره — نفس مسارات
 * teacherAccountService التي يستخدمها المعلم لنفسه، لكن بمفاتيح كاش الأدمن
 * (queryKeys.admin.teacherDetail) بدل myTeacherKey، وبلا أي أثر جانبي على
 * حالة مصادقة الأدمن نفسه (خلاف useMyTeacher المخصَّص لجلسة المعلم فقط).
 */
export function useAdminUpdateTeacherProfile(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: (payload) => adminService.updateTeacherProfile(id, payload),
    onSuccess: invalidate,
  });
}

export function useAdminUploadDocument(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: ({ type, file }) => adminService.uploadTeacherDocument(id, type, file),
    onSuccess: invalidate,
  });
}

export function useAdminSubmitForVerification(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: () => adminService.submitTeacherForVerification(id),
    onSuccess: invalidate,
  });
}

export function useAdminUploadTeacherAvatar(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: (file) => adminService.uploadTeacherAvatar(id, file),
    onSuccess: invalidate,
  });
}

export function useAdminDeleteTeacherAvatar(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: () => adminService.deleteTeacherAvatar(id),
    onSuccess: invalidate,
  });
}

export function useAdminAddVideo(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: (payload) => adminService.addTeacherVideo(id, payload),
    onSuccess: invalidate,
  });
}

export function useAdminRemoveVideo(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: (videoId) => adminService.removeTeacherVideo(videoId),
    onSuccess: invalidate,
  });
}

export function useAdminAddFaq(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: (payload) => adminService.addTeacherFaq(id, payload),
    onSuccess: invalidate,
  });
}

export function useAdminRemoveFaq(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: (faqId) => adminService.removeTeacherFaq(faqId),
    onSuccess: invalidate,
  });
}

export function useAdminAddExperience(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: (payload) => adminService.addTeacherExperience(id, payload),
    onSuccess: invalidate,
  });
}

export function useAdminRemoveExperience(id) {
  const invalidate = useInvalidateTeacher(id);
  return useMutation({
    mutationFn: (experienceId) => adminService.removeTeacherExperience(experienceId),
    onSuccess: invalidate,
  });
}
