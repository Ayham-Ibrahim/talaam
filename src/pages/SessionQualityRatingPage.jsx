import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Star } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SessionQualityInfo } from '@/components/sessionQuality/SessionQualityInfo';
import { ApiErrorList, ErrorState, Skeleton } from '@/components/ui';
import { useSessionQualityForStudent, useSubmitSessionQuality } from '@/hooks/useSessionQuality';
import { useT } from '@/hooks/useT';

/** نفس ترتيب SessionQualityRating::CRITERIA بالباك — كل معيار من 1 إلى 5 */
export const SESSION_QUALITY_CRITERIA = [
  { field: 'audio_video_quality', key: 'audioVideoQuality' },
  { field: 'connection_stability', key: 'connectionStability' },
  { field: 'teaching_quality', key: 'teachingQuality' },
  { field: 'overall_rating', key: 'overallRating' },
  { field: 'benefit_level', key: 'benefitLevel' },
];

const EMPTY = Object.fromEntries(SESSION_QUALITY_CRITERIA.map((c) => [c.field, 0]));

function StarInput({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n}`}
          onClick={() => onChange(n)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star size={26} className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-line'} />
        </button>
      ))}
    </div>
  );
}

/**
 * صفحة تقييم جودة الجلسة للطالب — تصله برابط بإشعار انتهاء الجلسة (أو من معلمه). التقييم
 * يظهر لإدارة المنصة فقط. إعادة الإرسال تعدّل التقييم السابق.
 */
export function SessionQualityRatingPage() {
  const t = useT();
  const { token } = useParams();
  const { data, isLoading, isError, error, refetch } = useSessionQualityForStudent(token);
  const submit = useSubmitSessionQuality(token);
  const [values, setValues] = useState(EMPTY);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!data?.rating) return;
    setValues(Object.fromEntries(SESSION_QUALITY_CRITERIA.map((c) => [c.field, data.rating[c.key] ?? 0])));
    setComment(data.rating.comment ?? '');
  }, [data?.rating]);

  const complete = SESSION_QUALITY_CRITERIA.every((c) => values[c.field] > 0);

  const handleSubmit = () => {
    if (!complete) return;
    submit.mutate({ ...values, comment: comment.trim() || null }, { onSuccess: () => setSubmitted(true) });
  };

  // 403/422 من الباك (ليس طالباً بهذه الجلسة، أو لم تنتهِ بعد) — رسالته واضحة بذاتها
  const blockedMessage = isError && [403, 404, 422].includes(error?.status) ? error.message : null;

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('sessionQuality.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('sessionQuality.subtitle')}</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-80 rounded-2xl" />
        ) : isError ? (
          blockedMessage ? (
            <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-soft shadow-card">{blockedMessage}</div>
          ) : (
            <ErrorState onRetry={refetch} />
          )
        ) : submitted ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-10 text-center shadow-card">
            <CheckCircle2 size={48} className="text-success" />
            <h2 className="text-lg font-bold text-ink">{t('sessionQuality.thanksTitle')}</h2>
            <p className="text-sm text-ink-soft">{t('sessionQuality.thanksHint')}</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <SessionQualityInfo info={data.session} />
            </div>

            <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-card">
              {data.rating && <p className="text-right text-xs text-ink-soft">{t('sessionQuality.alreadyRated')}</p>}
              {SESSION_QUALITY_CRITERIA.map((c) => (
                <div key={c.field} className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-4 last:border-0 last:pb-0">
                  <span className="text-sm font-semibold text-ink">{t(`sessionQuality.criteria.${c.key}`)}</span>
                  <StarInput
                    label={t(`sessionQuality.criteria.${c.key}`)}
                    value={values[c.field]}
                    onChange={(n) => setValues((prev) => ({ ...prev, [c.field]: n }))}
                  />
                </div>
              ))}

              <label className="flex flex-col gap-1.5 text-right">
                <span className="text-sm font-semibold text-ink">{t('sessionQuality.commentLabel')}</span>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('sessionQuality.commentPlaceholder')}
                  className="w-full resize-none rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>

              {submit.isError && <ApiErrorList error={submit.error} />}

              <button
                type="button"
                disabled={!complete || submit.isPending}
                onClick={handleSubmit}
                className="self-start rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {submit.isPending ? t('sessionQuality.submitting') : t('sessionQuality.submit')}
              </button>
              {!complete && <p className="text-right text-xs text-ink-soft">{t('sessionQuality.allRequired')}</p>}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
