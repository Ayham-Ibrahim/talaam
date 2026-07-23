import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminListingsService } from '@/services/adminListingsService';

export function useAdminListings(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.listings(filters),
    queryFn: () => adminListingsService.getListings(filters),
    keepPreviousData: true,
  });
}

export function useAdminListingDetail(id) {
  return useQuery({
    queryKey: queryKeys.admin.listingDetail(id),
    queryFn: () => adminListingsService.getListingDetail(id),
    enabled: !!id,
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

export function useApproveListing(id) {
  const invalidate = useInvalidateListing(id);
  return useMutation({
    mutationFn: ({ listingId, marginPercent }) => adminListingsService.approveListing(listingId, marginPercent),
    onSuccess: invalidate,
  });
}

export function useRejectListing(id) {
  const invalidate = useInvalidateListing(id);
  return useMutation({
    mutationFn: ({ listingId, reason }) => adminListingsService.rejectListing(listingId, reason),
    onSuccess: invalidate,
  });
}

export function useDisableListing(id) {
  const invalidate = useInvalidateListing(id);
  return useMutation({
    mutationFn: ({ listingId, reason }) => adminListingsService.disableListing(listingId, reason),
    onSuccess: invalidate,
  });
}
