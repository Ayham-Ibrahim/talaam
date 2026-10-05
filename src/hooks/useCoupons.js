import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { couponService } from '@/services/couponService';

export function usePackageCoupons(packageId) {
  return useQuery({
    queryKey: queryKeys.coupons.list(packageId),
    queryFn: () => couponService.list(packageId),
    enabled: !!packageId,
  });
}

function useInvalidateCoupons(packageId) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.coupons.list(packageId) });
}

export function useCreateCoupon(packageId) {
  const invalidate = useInvalidateCoupons(packageId);
  return useMutation({
    mutationFn: (payload) => couponService.create(packageId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateCoupon(packageId) {
  const invalidate = useInvalidateCoupons(packageId);
  return useMutation({
    mutationFn: ({ id, ...payload }) => couponService.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteCoupon(packageId) {
  const invalidate = useInvalidateCoupons(packageId);
  return useMutation({
    mutationFn: (id) => couponService.remove(id),
    onSuccess: invalidate,
  });
}
