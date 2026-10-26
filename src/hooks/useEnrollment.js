import { useMutation } from '@tanstack/react-query';
import { enrollmentService } from '@/services';

export function useCreateEnrollment(courseId) {
  return useMutation({
    mutationFn: (couponCode) => enrollmentService.createEnrollment(courseId, couponCode),
  });
}

export function useApplyEnrollmentCoupon() {
  return useMutation({
    mutationFn: ({ id, couponCode }) => enrollmentService.applyEnrollmentCoupon(id, couponCode),
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
