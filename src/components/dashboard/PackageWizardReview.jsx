import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

const SESSION_FORMAT_LABELS = { individual: 'فردية', group: 'جماعية' };
const WEEKDAY_LABELS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** Maps CreatePackageRequest/UpdatePackageRequest field paths to readable labels. */
const PACKAGE_FIELD_LABELS = {
  title: 'العنوان',
  subject_id: 'المادة',
  session_format: 'نوع الجلسات',
  capacity: 'السعة',
  curriculum_ids: 'المناهج',
  stage_ids: 'المراحل',
  sessions_count: 'عدد الجلسات',
  discount_percent: 'نسبة الخصم',
  description: 'الوصف',
  schedules: 'الجدولة',
  teacher_price: 'السعر',
  status: 'حالة الباقة',
};

const SCHEDULE_SUBFIELD_LABELS = { day_of_week: 'اليوم', date: 'التاريخ', start_time: 'وقت البدء' };

function packageErrorLabel(path) {
  if (PACKAGE_FIELD_LABELS[path]) return PACKAGE_FIELD_LABELS[path];

  const scheduleMatch = path.match(/^schedules\.(\d+)(?:\.(.+))?$/);
  if (scheduleMatch) {
    const [, index, sub] = scheduleMatch;
    return `الجدولة #${Number(index) + 1}${sub ? ` - ${SCHEDULE_SUBFIELD_LABELS[sub] ?? sub}` : ''}`;
  }

  const curriculumMatch = path.match(/^curriculum_ids\.(\d+)$/);
  if (curriculumMatch) return `المناهج #${Number(curriculumMatch[1]) + 1}`;

  const stageMatch = path.match(/^stage_ids\.(\d+)$/);
  if (stageMatch) return `المراحل #${Number(stageMatch[1]) + 1}`;

  return path;
}

function SummaryField({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-sm text-ink-soft">{label}</div>
      <div className="mt-1 font-bold text-ink">{value}</div>
    </div>
  );
}

export function PackageWizardReview({ data, isPending, error, onSubmit, onBack, readOnly, onClose }) {
  const t = useT();
  const { data: subjects = [] } = useTaxonomyList('subjects');
  const { data: curricula = [] } = useTaxonomyList('curricula');

  const subjectLabel = subjects.find((s) => s.id === Number(data.subject_id))?.name_ar ?? '—';
  const curriculumLabels = curricula.filter((c) => data.curriculum_ids.includes(c.id)).map((c) => c.name_ar);

  return (
    <div className="mt-8 flex flex-col gap-6">
      {error && <ApiErrorList error={error} labelFor={packageErrorLabel} />}

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:grid-cols-3">
        <SummaryField label={t('dashboard.addPackage.review.typeLabel')} value={SESSION_FORMAT_LABELS[data.session_format]} />
        <SummaryField label={t('dashboard.addPackage.review.subjectLabel')} value={subjectLabel} />
        <SummaryField
          label={t('dashboard.addPackage.review.sessionsCountLabel')}
          value={`${data.sessions_count} ${t('dashboard.addPackage.review.sessionsUnit')}`}
        />
      </div>

      {curriculumLabels.length > 0 && (
        <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card">
          <div className="text-sm text-ink-soft">{t('dashboard.addPackage.review.curriculumLabel')}</div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {curriculumLabels.map((label) => (
              <span key={label} className="rounded-pill bg-primary-light px-3 py-1 text-xs font-medium text-primary">
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.schedules.length > 0 && (
        <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card">
          <div className="text-center text-sm text-ink-soft">{t('dashboard.addPackage.review.scheduleLabel')}</div>
          <div className="mt-2 flex flex-col items-center gap-1">
            {data.schedules.map((s, i) =>
              data.session_format === 'individual' ? (
                <span key={i} className="text-sm font-semibold text-ink">
                  {WEEKDAY_LABELS[s.day_of_week]}
                </span>
              ) : (
                <span key={i} className="text-sm font-semibold text-ink" dir="ltr">
                  {s.date} — {s.start_time}
                </span>
              )
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card">
        <SummaryField label={t('dashboard.addPackage.review.teacherPriceLabel')} value={`$${data.teacher_price}`} />
      </div>

      <div className="flex w-full items-center justify-between">
        {readOnly ? (
          <button
            type="button"
            onClick={onClose}
            className="mr-auto rounded-xl border border-line px-8 py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.teacherPackages.close')}
          </button>
        ) : (
          <>
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
              {isPending ? t('dashboard.addPackage.saving') : t('dashboard.addPackage.saveDraft')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
