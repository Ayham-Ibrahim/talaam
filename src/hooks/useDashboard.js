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

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.dashboard.sessions(),
    queryFn: () => dashboardService.getSessions(),
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
