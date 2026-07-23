import { useMutation } from '@tanstack/react-query';
import { adminStudentImportService } from '@/services/adminStudentImportService';

export function useImportStudents() {
  return useMutation({
    mutationFn: (file) => adminStudentImportService.importStudents(file),
  });
}
