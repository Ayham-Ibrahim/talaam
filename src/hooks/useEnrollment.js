import { useMutation } from '@tanstack/react-query';
import { enrollmentService } from '@/services';

export function useCreateEnrollment(courseId) {
  return useMutation({
    mutationFn: () => enrollmentService.createEnrollment(courseId),
  });
}
