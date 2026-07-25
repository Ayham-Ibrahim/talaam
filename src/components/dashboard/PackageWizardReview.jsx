import { SESSION_TYPE_LABELS, CURRICULUM_OPTIONS, SUBJECT_OPTIONS } from '@/lib/packageWizardOptions';
import { calculateStudentPrice, DEFAULT_MARGIN_PERCENT } from '@/lib/pricing';
import { SESSION_DURATION_MINUTES } from '@/mocks/teacherDashboard.mock';
import { useT } from '@/hooks/useT';

function SummaryField({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-sm text-ink-soft">{label}</div>
      <div className="mt-1 font-bold text-ink">{value}</div>
    </div>
  );
}

export function PackageWizardReview({ data, isPending, onSubmit, onBack }) {
  const t = useT();
  const curriculumLabel = CURRICULUM_OPTIONS.find((o) => o.value === data.curriculum)?.label ?? '—';
  const subjectLabel = SUBJECT_OPTIONS.find((o) => o.value === data.subject)?.label ?? '—';
  const teacherPrice = Number(data.teacherPrice);
  const { studentPrice, platformRevenue } = calculateStudentPrice(teacherPrice, DEFAULT_MARGIN_PERCENT);

  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:grid-cols-5">
        <SummaryField label={t('dashboard.addPackage.review.typeLabel')} value={SESSION_TYPE_LABELS[data.sessionType]} />
        <SummaryField label={t('dashboard.addPackage.review.curriculumLabel')} value={curriculumLabel} />
        <SummaryField label={t('dashboard.addPackage.review.subjectLabel')} value={subjectLabel} />
        <SummaryField
          label={t('dashboard.addPackage.review.sessionsCountLabel')}
          value={`${data.sessionsCount} ${t('dashboard.addPackage.review.sessionsUnit')}`}
        />
        <SummaryField
          label={t('dashboard.addPackage.review.durationLabel')}
          value={`${SESSION_DURATION_MINUTES} ${t('dashboard.addPackage.review.durationUnit')}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:grid-cols-3">
        <SummaryField label={t('dashboard.addPackage.review.teacherPriceLabel')} value={`$${teacherPrice}`} />
        <SummaryField label={t('dashboard.addPackage.review.platformMarginLabel')} value={`$${platformRevenue}`} />
        <SummaryField label={t('dashboard.addPackage.review.finalPriceLabel')} value={`$${studentPrice}`} />
      </div>

      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-line px-8 py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
        >
          {t('dashboard.addPackage.back')}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={onSubmit}
          className="rounded-xl border-2 border-primary bg-primary px-8 py-3 text-sm font-medium text-white transition-opacity hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? t('dashboard.addPackage.submitting') : t('dashboard.addPackage.submit')}
        </button>
      </div>
    </div>
  );
}
