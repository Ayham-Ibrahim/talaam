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

export function useAcademicSupportFinanceReport(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.academicSupportFinanceReport(filters),
    queryFn: () => reportsService.getAcademicSupportFinanceReport(filters),
    keepPreviousData: true,
  });
}

export function useExportAcademicSupportFinanceReport() {
  return useMutation({
    mutationFn: (filters) => reportsService.exportAcademicSupportFinanceReport(filters),
  });
}

export function usePlatformNetProfitReport(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.platformNetProfitReport(filters),
    queryFn: () => reportsService.getPlatformNetProfitReport(filters),
    keepPreviousData: true,
  });
}

export function useExportPlatformNetProfitReport() {
  return useMutation({
    mutationFn: (filters) => reportsService.exportPlatformNetProfitReport(filters),
  });
}

export function useStudentsReport(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.studentsReport(filters),
    queryFn: () => reportsService.getStudentsReport(filters),
    keepPreviousData: true,
  });
}

export function useExportStudentsReport() {
  return useMutation({
    mutationFn: (filters) => reportsService.exportStudentsReport(filters),
  });
}

export function useStudentsLocationReport(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.studentsLocationReport(filters),
    queryFn: () => reportsService.getStudentsLocationReport(filters),
    keepPreviousData: true,
  });
}

export function useStudentsLocationStudents(filters = {}, page = 1, enabled = true) {
  return useQuery({
    queryKey: queryKeys.admin.studentsLocationStudents(filters, page),
    queryFn: () => reportsService.getStudentsLocationStudents(filters, page),
    keepPreviousData: true,
    enabled,
  });
}

export function useExportStudentsLocationReport() {
  return useMutation({
    mutationFn: (filters) => reportsService.exportStudentsLocationReport(filters),
  });
}
