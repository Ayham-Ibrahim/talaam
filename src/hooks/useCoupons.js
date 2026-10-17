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

// كوبونات باقات الدعم الأكاديمي — الأدمن فقط. update/delete أدناه يستخدمان نفس
// couponService.update/remove (نفس Coupon model، نفس endpoints coupons/{id})، فقط invalidate يستهدف مفتاح الكاش الصحيح.
export function useSupportPackageCoupons(supportPackageId) {
  return useQuery({
    queryKey: queryKeys.coupons.supportPackageList(supportPackageId),
    queryFn: () => couponService.listForSupportPackage(supportPackageId),
    enabled: !!supportPackageId,
  });
}

function useInvalidateSupportPackageCoupons(supportPackageId) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.coupons.supportPackageList(supportPackageId) });
}

export function useCreateSupportPackageCoupon(supportPackageId) {
  const invalidate = useInvalidateSupportPackageCoupons(supportPackageId);
  return useMutation({
    mutationFn: (payload) => couponService.createForSupportPackage(supportPackageId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateSupportPackageCoupon(supportPackageId) {
  const invalidate = useInvalidateSupportPackageCoupons(supportPackageId);
  return useMutation({
    mutationFn: ({ id, ...payload }) => couponService.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteSupportPackageCoupon(supportPackageId) {
  const invalidate = useInvalidateSupportPackageCoupons(supportPackageId);
  return useMutation({
    mutationFn: (id) => couponService.remove(id),
    onSuccess: invalidate,
  });
}
