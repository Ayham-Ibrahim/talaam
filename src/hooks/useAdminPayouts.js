import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminPayoutsService } from '@/services/adminPayoutsService';

export function useAdminPayouts(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.payouts(filters),
    queryFn: () => adminPayoutsService.getPayouts(filters),
    keepPreviousData: true,
  });
}

function useInvalidatePayouts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
}

export function useGeneratePayout() {
  const invalidate = useInvalidatePayouts();
  return useMutation({
    mutationFn: (providerId) => adminPayoutsService.generatePayout(providerId),
    onSuccess: invalidate,
  });
}

export function useApprovePayout() {
  const invalidate = useInvalidatePayouts();
  return useMutation({
    mutationFn: (id) => adminPayoutsService.approvePayout(id),
    onSuccess: invalidate,
  });
}

export function useMarkPayoutPaid() {
  const invalidate = useInvalidatePayouts();
  return useMutation({
    mutationFn: (id) => adminPayoutsService.markPayoutPaid(id),
    onSuccess: invalidate,
  });
}
