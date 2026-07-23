import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { dashboardService } from '@/services';

export function useStudentDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.student(),
    queryFn: () => dashboardService.getStudentDashboard(),
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
