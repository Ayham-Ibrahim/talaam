import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { reviewService } from '@/services';
import { useAuth } from '@/hooks/useAuth';

/** تقييمات الطالب الحالي — الباك يتطلب تسجيل دخول أصلاً */
export function useMyReviews() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.reviews.mine(),
    queryFn: () => reviewService.getMine(),
    enabled: isAuthenticated,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, rating, comment }) => reviewService.create(sessionId, { rating, comment }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.reviews.mine() }),
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, rating, comment }) => reviewService.update(reviewId, { rating, comment }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.reviews.mine() }),
  });
}
