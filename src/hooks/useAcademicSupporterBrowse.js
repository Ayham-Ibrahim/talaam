import { useInfiniteQuery, useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { academicSupporterService } from '@/services/academicSupporterService';

const RESULTS_PER_PAGE = 12;

/** تصفّح الداعمين الأكاديميين — حصراً داخل لوحة الطالب الجامعي (راجع التحقق المزدوج في الكنترولر بالباك اند). */
export function useInfiniteAcademicSupporters(filters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.academicSupporters.infiniteList(filters),
    queryFn: ({ pageParam }) => academicSupporterService.search({ ...filters, page: pageParam, per_page: RESULTS_PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.currentPage < lastPage.lastPage ? lastPage.currentPage + 1 : undefined),
  });
}

export function useAcademicSupporterProfile(id) {
  return useQuery({
    queryKey: queryKeys.academicSupporters.detail(id),
    queryFn: () => academicSupporterService.getPublicProfile(id),
    enabled: !!id,
  });
}

export function usePurchaseSupportPackage() {
  return useMutation({
    mutationFn: ({ supportPackageId, couponCode }) => academicSupporterService.purchasePackage(supportPackageId, couponCode),
  });
}

/** اشتراكات الطالب الجامعي بباقات الدعم الأكاديمي — تُعرَض بتاب "الباقات" إلى جانب باقات المعلمين العادية (تب منفصل) */
export function useMySupportPackagePurchases(enabled = true) {
  return useQuery({
    queryKey: queryKeys.supportPackagePurchases.myList(),
    queryFn: () => academicSupporterService.getMyPurchases(),
    enabled,
  });
}

export function useSupportPackagePurchaseDetail(id) {
  return useQuery({
    queryKey: queryKeys.supportPackagePurchases.detail(id),
    queryFn: () => academicSupporterService.getPurchaseDetail(id),
    enabled: !!id,
    refetchInterval: (query) => (query.state.data?.status === 'pending_payment' ? 2000 : false),
  });
}
