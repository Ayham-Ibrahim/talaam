import { Star } from 'lucide-react';
import { Avatar, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useT } from '@/hooks/useT';

const ORANGE = '#F74E28';

/** 5 stars with fractional fill, in the design's orange */
function Stars({ value = 0, size = 16 }) {
  return (
    <span dir="ltr" className="inline-flex shrink-0" style={{ gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute left-0 top-0" style={{ color: ORANGE }} />
            <span
              className="absolute left-0 top-0 overflow-hidden"
              style={{ width: `${fill * 100}%`, height: size }}
            >
              <Star size={size} style={{ color: ORANGE, fill: ORANGE }} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function RatingBar({ star, percent }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-3.5 shrink-0 text-center text-lg font-medium text-[#333333]">{star}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#D9D9D9]">
        <div
          className="h-full rounded-full"
          style={{ width: `${percent}%`, background: ORANGE }}
        />
      </div>
    </div>
  );
}

function SummaryCard({ summary, t }) {
  const average = summary?.average ?? 0;
  const total = summary?.total ?? 0;

  return (
    <div className="shrink-0 rounded-3xl bg-white px-4 py-4 shadow-[0px_1px_5px_rgba(0,0,0,0.1)] sm:px-8 lg:w-[42%]">
      <h3 className="mb-3 text-end text-base font-bold text-[#2D2D2D]">{t('teacher.rating')}</h3>

      <div className="flex items-center justify-between gap-6">
        <div className="flex shrink-0 flex-col items-start gap-1.5">
          <span className="text-5xl font-bold leading-none text-[#333333]">{average}</span>
          <Stars value={average} size={16} />
          <span dir="ltr" className="text-lg text-[#333333]/60">
            {Number(total).toLocaleString('en-US')}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-[7px]">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar key={star} star={star} percent={summary?.distribution?.[star] ?? 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0px_1px_5px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-sm font-semibold text-[#2D2D2D]">{review.studentName}</span>
            <Stars value={review.rating} size={16} />
          </div>
          <Avatar name={review.studentName} src={review.studentAvatar} size="sm" />
        </div>
        {review.comment && (
          <p className="max-w-[320px] text-end text-xs leading-[22px] text-[#777777]">{review.comment}</p>
        )}
      </div>
    </div>
  );
}

export function RatingReviews({ summary, reviews, isLoading, isError, refetch }) {
  const t = useT();

  if (isError) {
    return (
      <div className="mt-8">
        <h3 className="mb-4 text-start font-bold text-ink">{t('teacher.rating')}</h3>
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8 flex flex-col gap-4 lg:flex-row">
        <Skeleton className="h-44 rounded-3xl lg:w-[42%]" />
        <Skeleton className="h-44 flex-1 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4 lg:flex-row">
      {/* Summary — right in RTL */}
      <SummaryCard summary={summary} t={t} />

      {/* Review cards — left in RTL */}
      <div className="flex flex-1 flex-col gap-2.5">
        {reviews.length === 0 ? (
          <EmptyState title={t('teacher.reviewsEmpty')} />
        ) : (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </div>
    </div>
  );
}
