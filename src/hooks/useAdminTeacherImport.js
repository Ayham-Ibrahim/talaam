import { useMutation } from '@tanstack/react-query';
import { adminTeacherImportService } from '@/services/adminTeacherImportService';

export function useImportTeachers() {
  return useMutation({
    mutationFn: (file) => adminTeacherImportService.importTeachers(file),
  });
}
