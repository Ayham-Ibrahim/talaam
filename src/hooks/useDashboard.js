import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { dashboardService } from '@/services';

export function useStudentDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.student(),
    queryFn: () => dashboardService.getStudentDashboard(),
  });
}

export function useTeacherDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.teacher(),
    queryFn: () => dashboardService.getTeacherDashboard(),
  });
}

export function useTeacherPackagesList() {
  return useQuery({
    queryKey: queryKeys.dashboard.teacherPackagesList(),
    queryFn: () => dashboardService.getTeacherPackagesList(),
  });
}

export function useCreateTeacherPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => dashboardService.createTeacherPackage(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacherPackagesList() }),
  });
}

/** يجلب الباقة كاملة (منهج/مرحلة/جدول) — سطر القائمة لا يحمل هذه العلاقات */
export function useTeacherPackage(id) {
  return useQuery({
    queryKey: queryKeys.dashboard.teacherPackageDetail(id),
    queryFn: () => dashboardService.getTeacherPackage(id),
    enabled: !!id,
  });
}

/** الباك يرفض التعديل خارج حالة المسودة (PackageService::updateDraft) */
export function useUpdateTeacherPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => dashboardService.updateTeacherPackage(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacherPackagesList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacherPackageDetail(id) });
    },
  });
}

/** draft → pending_approval — a separate, explicit action from creating the draft (mirrors POST /packages/{id}/submit) */
export function useSubmitTeacherPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => dashboardService.submitTeacherPackage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacherPackagesList() }),
  });
}

export function useTeacherCoursesList() {
  return useQuery({
    queryKey: queryKeys.dashboard.teacherCoursesList(),
    queryFn: () => dashboardService.getTeacherCoursesList(),
  });
}

export function useCreateTeacherCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => dashboardService.createTeacherCourse(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacherCoursesList() }),
  });
}

export function useSubmitTeacherCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => dashboardService.submitTeacherCourse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacherCoursesList() }),
  });
}

export function useTeacherSessions() {
  return useQuery({
    queryKey: queryKeys.dashboard.teacherSessions(),
    queryFn: () => dashboardService.getTeacherSessions(),
  });
}

export function useTeacherSessionDetails(id) {
  return useQuery({
    queryKey: queryKeys.dashboard.teacherSessionDetails(id),
    queryFn: () => dashboardService.getTeacherSessionDetails(id),
    enabled: !!id,
  });
}

export function useTeacherStudents() {
  return useQuery({
    queryKey: queryKeys.dashboard.teacherStudents(),
    queryFn: () => dashboardService.getTeacherStudents(),
  });
}

export function useTeacherStudentDetails(id) {
  return useQuery({
    queryKey: queryKeys.dashboard.teacherStudentDetails(id),
    queryFn: () => dashboardService.getTeacherStudentDetails(id),
    enabled: !!id,
  });
}

export function useCalendarSessions() {
  return useQuery({
    queryKey: queryKeys.dashboard.calendarSessions(),
    queryFn: () => dashboardService.getCalendarSessions(),
  });
}

export function useTeacherCalendarSessions() {
  return useQuery({
    queryKey: queryKeys.dashboard.teacherCalendarSessions(),
    queryFn: () => dashboardService.getTeacherCalendarSessions(),
  });
}

export function useSessions(params = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.sessions(params),
    queryFn: () => dashboardService.getSessions(params),
    keepPreviousData: true,
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.dashboard.invoices(),
    queryFn: () => dashboardService.getInvoices(),
  });
}

export function usePackagesList() {
  return useQuery({
    queryKey: queryKeys.dashboard.packagesList(),
    queryFn: () => dashboardService.getPackagesList(),
  });
}

export function usePackageDetails(id) {
  return useQuery({
    queryKey: queryKeys.dashboard.packageDetails(id),
    queryFn: () => dashboardService.getPackageDetails(id),
    enabled: !!id,
  });
}
