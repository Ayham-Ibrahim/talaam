import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

const REVIEW_FIELD_LABELS = { rating: 'التقييم', comment: 'التعليق' };
const reviewErrorLabel = (path) => REVIEW_FIELD_LABELS[path] ?? path;

/** Interactive 1–5 star picker — StarRating in @/components/ui is a read-only display, not an input */
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center justify-center gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n}`}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star size={28} className={n <= (hovered || value) ? 'fill-star text-star' : 'text-line'} />
        </button>
      ))}
    </div>
  );
}

/**
 * Shared create/edit shell — used both for a fresh review (sessionId set, reviewId null)
 * and editing an existing one (reviewId set, initialRating/initialComment prefilled).
 */
export function ReviewFormModal({ title, initialRating = 0, initialComment = '', isPending, error, onSubmit, onClose }) {
  const t = useT();
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [touched, setTouched] = useState(false);

  const isValid = rating >= 1 && rating <= 5;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('studentReviews.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{title}</h3>
          <span className="w-8" />
        </div>

        {error && <ApiErrorList error={error} labelFor={reviewErrorLabel} className="mb-4" />}

        <div className="flex flex-col items-center gap-2">
          <StarPicker value={rating} onChange={setRating} />
          {touched && !isValid && <span className="text-xs text-accent-pink">{t('studentReviews.ratingRequired')}</span>}
        </div>

        <label className="mt-4 flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('studentReviews.commentLabel')}</span>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('studentReviews.commentPlaceholder')}
            maxLength={2000}
            className="w-full resize-none rounded-btn border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="text-left text-xs text-ink-soft/70">{comment.length}/2000</div>
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('studentReviews.cancel')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? t('studentReviews.saving') : t('studentReviews.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
