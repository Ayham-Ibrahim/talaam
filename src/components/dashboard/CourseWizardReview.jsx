import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { COURSE_LEVEL_LABELS, COURSE_DELIVERY_MODE_LABELS } from '@/mocks/teacherCourses.mock';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

/** Maps CreateCourseRequest field paths (incl. Laravel's dot-notation for array items) to readable labels. */
const COURSE_FIELD_LABELS = {
  title: 'العنوان',
  course_field_id: 'المجال',
  subject_id: 'المادة',
  level: 'المستوى',
  delivery_mode: 'نمط التقديم',
  location: 'الموقع',
  description: 'الوصف',
  curriculum_ids: 'المناهج',
  start_date: 'تاريخ البدء',
  end_date: 'تاريخ الانتهاء',
  total_sessions: 'عدد الجلسات',
  max_seats: 'عدد المقاعد',
  schedules: 'الجدولة',
  provider_price: 'السعر',
  pricing_mode: 'نمط التسعير',
  total_hours: 'عدد الساعات',
  certificate_type: 'نوع الشهادة',
  certificate_issuer: 'جهة إصدار الشهادة',
  certificate_requirements: 'متطلبات الشهادة',
  prerequisites: 'المتطلبات المسبقة',
  cancellation_policy: 'سياسة الإلغاء',
};

const SCHEDULE_SUBFIELD_LABELS = { day_of_week: 'اليوم', start_time: 'وقت البدء', end_time: 'وقت الانتهاء' };

function courseErrorLabel(path) {
  if (COURSE_FIELD_LABELS[path]) return COURSE_FIELD_LABELS[path];

  const scheduleMatch = path.match(/^schedules\.(\d+)(?:\.(.+))?$/);
  if (scheduleMatch) {
    const [, index, sub] = scheduleMatch;
    return `الجدولة #${Number(index) + 1}${sub ? ` - ${SCHEDULE_SUBFIELD_LABELS[sub] ?? sub}` : ''}`;
  }

  const curriculumMatch = path.match(/^curriculum_ids\.(\d+)$/);
  if (curriculumMatch) return `المناهج #${Number(curriculumMatch[1]) + 1}`;

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

export function CourseWizardReview({ data, isPending, error, onSubmit, onBack }) {
  const t = useT();
  const { data: courseFields = [] } = useTaxonomyList('course_fields');

  const courseFieldLabel = courseFields.find((f) => f.id === Number(data.course_field_id))?.name_ar ?? '—';

  return (
    <div className="mt-8 flex flex-col gap-6">
      {error && <ApiErrorList error={error} labelFor={courseErrorLabel} />}

      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:grid-cols-4">
        <SummaryField label={t('dashboard.addCourse.courseFieldLabel')} value={courseFieldLabel} />
        <SummaryField label={t('dashboard.addCourse.levelLabel')} value={COURSE_LEVEL_LABELS[data.level]} />
        <SummaryField label={t('dashboard.addCourse.deliveryModeLabel')} value={COURSE_DELIVERY_MODE_LABELS[data.delivery_mode]} />
        <SummaryField
          label={t('dashboard.addCourse.totalSessionsLabel')}
          value={`${data.total_sessions} ${t('dashboard.addPackage.review.sessionsUnit')}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:grid-cols-3">
        <SummaryField label={t('dashboard.addCourse.startDateLabel')} value={data.start_date} />
        <SummaryField label={t('dashboard.addCourse.endDateLabel')} value={data.end_date} />
        <SummaryField label={t('dashboard.addCourse.maxSeatsLabel')} value={data.max_seats} />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:grid-cols-2">
        <SummaryField
          label={t(data.pricing_mode === 'hourly' ? 'dashboard.addCourse.priceLabelHourly' : 'dashboard.addCourse.priceLabel')}
          value={`$${data.provider_price}`}
        />
        {data.pricing_mode === 'hourly' && (
          <SummaryField label={t('dashboard.addCourse.totalHoursLabel')} value={data.total_hours} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:grid-cols-5">
        <SummaryField label={t('dashboard.addCourse.hasCertificateLabel')} value={t(data.has_certificate ? 'dashboard.addCourse.yes' : 'dashboard.addCourse.no')} />
        <SummaryField label={t('dashboard.addCourse.requiresLaptopLabel')} value={t(data.requires_laptop ? 'dashboard.addCourse.yes' : 'dashboard.addCourse.no')} />
        <SummaryField label={t('dashboard.addCourse.materialsIncludedLabel')} value={t(data.materials_included ? 'dashboard.addCourse.yes' : 'dashboard.addCourse.no')} />
        <SummaryField label={t('dashboard.addCourse.hasPracticalExercisesLabel')} value={t(data.has_practical_exercises ? 'dashboard.addCourse.yes' : 'dashboard.addCourse.no')} />
        <SummaryField label={t('dashboard.addCourse.sessionsRecordedLabel')} value={t(data.sessions_recorded ? 'dashboard.addCourse.yes' : 'dashboard.addCourse.no')} />
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
          {isPending ? t('dashboard.addPackage.saving') : t('dashboard.addPackage.saveDraft')}
        </button>
      </div>
    </div>
  );
}
