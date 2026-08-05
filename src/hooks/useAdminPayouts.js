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
    mutationFn: (payload) => adminPayoutsService.generatePayout(payload),
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
    mutationFn: ({ id, transferReference }) => adminPayoutsService.markPayoutPaid(id, transferReference),
    onSuccess: invalidate,
  });
}
