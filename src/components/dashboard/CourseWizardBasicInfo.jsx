import { useState } from 'react';
import { SmoothSelect } from './SmoothSelect';
import { MultiSelectChips } from './MultiSelectChips';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { COURSE_LEVEL_LABELS, COURSE_DELIVERY_MODE_LABELS } from '@/mocks/teacherCourses.mock';
import { useT } from '@/hooks/useT';

const LEVEL_OPTIONS = Object.entries(COURSE_LEVEL_LABELS).map(([value, label]) => ({ value, label }));
const DELIVERY_MODE_OPTIONS = Object.entries(COURSE_DELIVERY_MODE_LABELS).map(([value, label]) => ({ value, label }));

export function CourseWizardBasicInfo({ data, onChange, onNext }) {
  const t = useT();
  const [touched, setTouched] = useState(false);

  const { data: courseFields = [] } = useTaxonomyList('course_fields');
  const { data: subjects = [] } = useTaxonomyList('subjects');
  const { data: curricula = [] } = useTaxonomyList('curricula');

  const courseFieldOptions = courseFields.map((f) => ({ value: f.id, label: f.name_ar }));
  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name_ar }));
  const curriculumOptions = curricula.map((c) => ({ value: c.id, label: c.name_ar }));

  const showLocation = data.delivery_mode === 'onsite' || data.delivery_mode === 'hybrid';
  const isValid = data.title.trim() !== '' && data.course_field_id !== '';

  const handleNext = () => {
    setTouched(true);
    if (!isValid) return;
    onNext();
  };

  return (
    <div className="mt-8 flex flex-col items-end gap-6">
      <div className="flex w-full flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-primary">{t('dashboard.addCourse.titleLabel')}</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={t('dashboard.addCourse.titlePlaceholder')}
          className={`w-full rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none ${
            touched && data.title.trim() === '' ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
          }`}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <SmoothSelect
          label={t('dashboard.addCourse.courseFieldLabel')}
          value={data.course_field_id}
          onChange={(v) => onChange({ course_field_id: v })}
          options={courseFieldOptions}
          placeholder={t('dashboard.addPackage.selectPlaceholder')}
        />
        <SmoothSelect
          label={t('dashboard.addCourse.subjectLabel')}
          value={data.subject_id}
          onChange={(v) => onChange({ subject_id: v })}
          options={subjectOptions}
          placeholder={t('dashboard.addPackage.selectPlaceholder')}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <SmoothSelect
          label={t('dashboard.addCourse.levelLabel')}
          value={data.level}
          onChange={(v) => onChange({ level: v })}
          options={LEVEL_OPTIONS}
          placeholder={t('dashboard.addPackage.selectPlaceholder')}
        />
        <SmoothSelect
          label={t('dashboard.addCourse.deliveryModeLabel')}
          value={data.delivery_mode}
          onChange={(v) => onChange({ delivery_mode: v })}
          options={DELIVERY_MODE_OPTIONS}
          placeholder={t('dashboard.addPackage.selectPlaceholder')}
        />
      </div>

      {showLocation && (
        <div className="flex w-full flex-col items-start gap-1.5">
          <label className="text-sm font-semibold text-primary">{t('dashboard.addCourse.locationLabel')}</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder={t('dashboard.addCourse.locationPlaceholder')}
            className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3 py-3 text-right text-sm text-ink placeholder:text-[#AEAEB2] focus:border-primary focus:outline-none"
          />
        </div>
      )}

      <MultiSelectChips
        label={t('dashboard.addPackage.curriculumLabel')}
        values={data.curriculum_ids}
        onChange={(v) => onChange({ curriculum_ids: v })}
        options={curriculumOptions}
        placeholder={t('dashboard.addPackage.selectPlaceholder')}
        max={20}
      />

      <div className="flex w-full flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-primary">{t('dashboard.addPackage.descriptionLabel')}</label>
        <div className="w-full rounded-lg border border-[#E3E3E3] px-3 py-2.5">
          <textarea
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value.slice(0, 2000) })}
            placeholder={t('dashboard.addPackage.descriptionPlaceholder')}
            rows={4}
            className="w-full resize-none bg-transparent text-right text-sm text-ink outline-none placeholder:text-[#AEAEB2]"
          />
          <div className="text-left text-xs text-[#AEAEB2]">{data.description.length}/2000</div>
        </div>
      </div>

      <div className="flex w-full">
        <button
          type="button"
          onClick={handleNext}
          className="ml-auto rounded-xl border-2 border-primary bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {t('dashboard.addPackage.next')}
        </button>
      </div>
    </div>
  );
}
