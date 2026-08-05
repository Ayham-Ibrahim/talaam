import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminListingsService } from '@/services/adminListingsService';
import { bookingService, enrollmentService } from '@/services';

export function useAdminListings(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.listings(filters),
    queryFn: () => adminListingsService.getListings(filters),
    keepPreviousData: true,
  });
}

export function useAdminListingDetail(id, kind) {
  return useQuery({
    queryKey: queryKeys.admin.listingDetail(id),
    queryFn: () => adminListingsService.getListingDetail(id, kind),
    enabled: !!id && !!kind,
  });
}

function useInvalidateListing(id) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview() });
    queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.admin.listingDetail(id) });
  };
}

export function useApproveListing(id, kind) {
  const invalidate = useInvalidateListing(id);
  return useMutation({
    mutationFn: ({ listingId, marginPercent }) => adminListingsService.approveListing(listingId, marginPercent, kind),
    onSuccess: invalidate,
  });
}

export function useRejectListing(id, kind) {
  const invalidate = useInvalidateListing(id);
  return useMutation({
    mutationFn: ({ listingId, reason }) => adminListingsService.rejectListing(listingId, reason, kind),
    onSuccess: invalidate,
  });
}

export function useDisableListing(id, kind) {
  const invalidate = useInvalidateListing(id);
  return useMutation({
    mutationFn: ({ listingId, reason }) => adminListingsService.disableListing(listingId, reason, kind),
    onSuccess: invalidate,
  });
}

/** Admin books a package on a student's behalf — mirrors CreateManualBookingRequest, always audit-logged on the backend */
export function useCreateManualBooking() {
  return useMutation({
    mutationFn: ({ packageId, payload }) => bookingService.createManualBooking(packageId, payload),
  });
}

/** Admin enrolls a student in a course on their behalf — mirrors CreateManualEnrollmentRequest */
export function useCreateManualEnrollment() {
  return useMutation({
    mutationFn: ({ courseId, payload }) => enrollmentService.createManualEnrollment(courseId, payload),
  });
}
