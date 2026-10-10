import { useState } from 'react';
import { Star, Trash2, Upload, Download } from 'lucide-react';
import { ImportTeacherReviewsModal } from './ImportTeacherReviewsModal';
import { useSeededReviews, useDeleteSeededReview } from '@/hooks/useAdminSettings';
import { downloadReviewImportTemplate } from '@/lib/csvTemplate';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

/**
 * ميزة مؤقتة: إدخال تقييمات/مراجعات يدوياً لمعلم (رفع ملف Excel) بدل
 * الاعتماد على أي تقييم وهمي معروض بالواجهة — هذه التقييمات حقيقية في
 * قاعدة البيانات (نفس جدول reviews، تُحتسب ضمن rating_avg/reviews_count
 * فعلياً عبر ReviewObserver)، فقط بلا طالب حقيقي وراءها (student_id=null،
 * is_seeded=true)، فيمكن حذفها لاحقاً دون المساس بأي تقييم حقيقي.
 */
export function TeacherReviewsPanel({ teacherId, ratingAvg, reviewsCount }) {
  const t = useT();
  const [modalOpen, setModalOpen] = useState(false);
  const { data: seeded = [], isLoading } = useSeededReviews(teacherId);
  const deleteSeeded = useDeleteSeededReview(teacherId);

  return (
    <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-right text-base font-bold text-ink">{t('dashboard.adminTeacherDetail.reviewsTitle')}</h3>
        <span className="flex items-center gap-1 text-sm font-bold text-ink" dir="ltr">
          {Number(ratingAvg ?? 0).toFixed(2)}
          <Star size={14} className="fill-[#FFC94A] text-[#FFC94A]" />
          <span className="font-normal text-ink-soft">({reviewsCount ?? 0})</span>
        </span>
      </div>

      <p className="mt-1.5 text-right text-xs text-ink-soft">{t('dashboard.adminTeacherDetail.reviewsHint')}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Upload size={15} />
          {t('dashboard.adminTeacherDetail.reviewsUploadButton')}
        </button>
        <button
          type="button"
          onClick={downloadReviewImportTemplate}
          className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-line/30"
        >
          <Download size={15} />
          {t('dashboard.adminTeacherDetail.reviewsTemplateButton')}
        </button>
      </div>

      {!isLoading && seeded.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 border-t border-line/60 pt-4">
          {seeded.map((review) => (
            <li
              key={review.id}
              className="flex items-start justify-between gap-3 rounded-xl bg-[#FAFBFD] px-4 py-3"
            >
              <button
                type="button"
                disabled={deleteSeeded.isPending}
                onClick={() => {
                  if (window.confirm(t('dashboard.adminTeacherDetail.reviewsConfirmDelete'))) deleteSeeded.mutate(review.id);
                }}
                aria-label={t('dashboard.adminTeacherDetail.reviewsDelete')}
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-line/60 hover:text-accent-pink disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>
              <div className="min-w-0 flex-1 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm font-semibold text-ink">{review.studentName}</span>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-ink" dir="ltr">
                    {review.rating}
                    <Star size={11} className="fill-[#FFC94A] text-[#FFC94A]" />
                  </span>
                </div>
                {review.comment && <p className="mt-1 text-xs leading-relaxed text-ink-soft">{review.comment}</p>}
                <div className="mt-1 text-[11px] text-ink-soft/70">{formatDate(review.createdAt)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && <ImportTeacherReviewsModal teacherId={teacherId} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
