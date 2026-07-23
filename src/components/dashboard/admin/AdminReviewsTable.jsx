import { Eye, EyeOff } from 'lucide-react';
import { StarRating } from '@/components/ui';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function AdminReviewsTable({ reviews, onHide, onUnhide, isActing }) {
  const t = useT();

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {review.isHidden ? (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => onUnhide(review.id)}
                  className="flex items-center gap-1.5 rounded-pill bg-success-light px-3 py-1.5 text-xs font-bold text-success hover:opacity-80 disabled:opacity-50"
                >
                  <Eye size={14} />
                  {t('dashboard.adminReviews.unhide')}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => onHide(review)}
                  className="flex items-center gap-1.5 rounded-pill border border-accent-pink px-3 py-1.5 text-xs font-bold text-accent-pink hover:bg-accent-pink/5 disabled:opacity-50"
                >
                  <EyeOff size={14} />
                  {t('dashboard.adminReviews.hide')}
                </button>
              )}
              {review.isHidden && (
                <span className="rounded-pill bg-[#F2F2F7] px-3 py-1 text-xs font-bold text-ink-soft">
                  {t('dashboard.adminReviews.hiddenBadge')}
                </span>
              )}
            </div>

            <div className="text-right">
              <div className="font-semibold text-ink">
                {review.studentName} ← {review.teacherName}
              </div>
              <div className="text-xs text-ink-soft">
                {review.subjectName} · {formatDate(review.createdAt)}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end">
            <StarRating value={review.rating} />
          </div>

          <p className="mt-2 text-right text-sm text-ink-soft">{review.comment}</p>

          {review.isHidden && review.hiddenReason && (
            <p className="mt-3 rounded-xl bg-accent-pink/10 p-3 text-right text-xs text-ink">
              {t('dashboard.adminReviews.hiddenReasonLabel')}: {review.hiddenReason}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
