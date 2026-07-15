import { Star } from 'lucide-react';
import { Avatar, EmptyState, ErrorState, Skeleton, StarRating } from '@/components/ui';
import { formatNumber } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

function RatingBar({ star, percent }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-soft">
      <span className="w-3 text-center">{star}</span>
      <Star size={12} className="fill-star text-star" />
      <div className="h-1.5 flex-1 rounded-full bg-line/60">
        <div className="h-full rounded-full bg-star" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function RatingReviews({ summary, reviews, isLoading, isError, refetch }) {
  const t = useT();

  if (isError) {
    return (
      <div className="mt-8">
        <h3 className="mb-4 text-right font-bold text-ink">{t('teacher.rating')}</h3>
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="mb-4 text-right font-bold text-ink">{t('teacher.rating')}</h3>
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-right font-bold text-ink">{t('teacher.rating')}</h3>

      <div className="flex flex-col-reverse items-center gap-6 rounded-2xl bg-white p-5 shadow-card sm:flex-row">
        <div className="w-full flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar key={star} star={star} percent={summary?.distribution?.[star] ?? 0} />
          ))}
        </div>
        <div className="shrink-0 text-center">
          <div className="text-4xl font-bold text-ink">{summary?.average ?? 0}</div>
          <StarRating value={summary?.average ?? 0} showValue={false} size={18} className="mt-1 justify-center" />
          <div className="mt-1 text-xs text-ink-soft">
            {formatNumber(summary?.total ?? 0)} {t('teacher.reviews')}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {reviews.length === 0 ? (
          <EmptyState title={t('teacher.reviewsEmpty')} />
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-center justify-between">
                <StarRating value={review.rating} showValue={false} size={14} />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{review.studentName}</span>
                  <Avatar name={review.studentName} src={review.studentAvatar} size="sm" />
                </div>
              </div>
              <p className="mt-2 text-right text-sm text-ink-soft">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
