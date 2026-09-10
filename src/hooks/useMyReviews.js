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

/**
 * After a student rates a teacher, the teacher's public profile must reflect it
 * — refresh any cached teacher reviews list, rating summary, or profile detail
 * (whichever teacher the review belongs to).
 */
function invalidateTeacherRatingViews(queryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.reviews.mine() });
  queryClient.invalidateQueries({
    predicate: (q) =>
      q.queryKey[0] === 'teachers' &&
      (q.queryKey[2] === 'reviews' || q.queryKey[2] === 'rating-summary' || q.queryKey[1] === 'detail'),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, rating, comment }) => reviewService.create(sessionId, { rating, comment }),
    onSuccess: () => invalidateTeacherRatingViews(queryClient),
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, rating, comment }) => reviewService.update(reviewId, { rating, comment }),
    onSuccess: () => invalidateTeacherRatingViews(queryClient),
  });
}
