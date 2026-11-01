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

export function usePayoutDetails(id) {
  return useQuery({
    queryKey: queryKeys.admin.payoutDetails(id),
    queryFn: () => adminPayoutsService.getPayoutDetails(id),
    enabled: id != null,
  });
}

function useInvalidatePayouts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
}

export function useGeneratePayouts() {
  const invalidate = useInvalidatePayouts();
  return useMutation({
    mutationFn: () => adminPayoutsService.generatePayouts(),
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

export function useDownloadPayoutInvoice() {
  return useMutation({
    mutationFn: (id) => adminPayoutsService.downloadInvoice(id),
  });
}

export function useExportPayouts() {
  return useMutation({
    mutationFn: (filters) => adminPayoutsService.exportPayouts(filters),
  });
}
