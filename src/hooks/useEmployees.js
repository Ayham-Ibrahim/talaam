import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { employeesService } from '@/services/employeesService';

export function useEmployees(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.employees(filters),
    queryFn: () => employeesService.getEmployees(filters),
    keepPreviousData: true,
  });
}

export function useEmployee(id) {
  return useQuery({
    queryKey: queryKeys.admin.employeeDetail(id),
    queryFn: () => employeesService.getEmployee(id),
    enabled: id != null,
  });
}

export function usePayroll(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.payroll(filters),
    queryFn: () => employeesService.getPayroll(filters),
    keepPreviousData: true,
  });
}

export function usePayrollReport(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.payrollReport(filters),
    queryFn: () => employeesService.getPayrollReport(filters),
    keepPreviousData: true,
  });
}

export function usePayrollRates(month) {
  return useQuery({
    queryKey: queryKeys.admin.payrollRates(month),
    queryFn: () => employeesService.getPayrollRates(month),
    enabled: !!month,
  });
}

/** كل تعديل يمس الرواتب يُحدّث الموظفين والكشف والتقرير معاً (نفس البادئة في queryKeys) */
function usePayrollMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'payroll'] }),
  });
}

export function useSaveEmployee() {
  return usePayrollMutation(({ id, form }) =>
    id ? employeesService.updateEmployee(id, form) : employeesService.createEmployee(form),
  );
}

export function useDeleteEmployee() {
  return usePayrollMutation((id) => employeesService.deleteEmployee(id));
}

export function useAddAdjustment() {
  return usePayrollMutation(({ employeeId, ...payload }) => employeesService.addAdjustment(employeeId, payload));
}

export function useDeleteAdjustment() {
  return usePayrollMutation((id) => employeesService.deleteAdjustment(id));
}

export function useGeneratePayroll() {
  return usePayrollMutation(({ month, rates }) => employeesService.generatePayroll(month, rates));
}

export function useUpdatePayrollRates() {
  return usePayrollMutation(({ month, rates }) => employeesService.updatePayrollRates(month, rates));
}

export function useMarkSalaryPaid() {
  return usePayrollMutation(({ id, notes }) => employeesService.markSalaryPaid(id, notes));
}

export function useExportPayrollReport() {
  return useMutation({
    mutationFn: (filters) => employeesService.exportPayrollReport(filters),
  });
}

export function useExportPayroll() {
  return useMutation({
    mutationFn: (filters) => employeesService.exportPayroll(filters),
  });
}
