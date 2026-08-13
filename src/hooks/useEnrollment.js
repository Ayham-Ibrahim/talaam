import { useMutation } from '@tanstack/react-query';
import { enrollmentService } from '@/services';

export function useCreateEnrollment(courseId) {
  return useMutation({
    mutationFn: () => enrollmentService.createEnrollment(courseId),
  });
}

export function useCheckoutEnrollment() {
  return useMutation({
    mutationFn: (enrollmentId) => enrollmentService.checkoutEnrollment(enrollmentId),
  });
}

export function useDownloadEnrollmentInvoice() {
  return useMutation({
    mutationFn: (enrollmentId) => enrollmentService.downloadInvoice(enrollmentId),
  });
}
