import { useState } from 'react';
import { Users, User } from 'lucide-react';
import { SmoothSelect } from './SmoothSelect';
import { MultiSelectChips } from './MultiSelectChips';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { useT } from '@/hooks/useT';

/* Training centers never reach this wizard at all (they get their own course wizard) —
   so the only two real session_format values the backend accepts apply here. */
const SESSION_TYPES = [
  { key: 'individual', icon: User, bg: '#F0FAFD', color: '#6BCEEE' },
  { key: 'group', icon: Users, bg: '#FEEDEA', color: '#F74E28' },
];

export function PackageWizardBasicInfo({ data, onChange, onNext }) {
  const t = useT();
  const [touched, setTouched] = useState(false);

  const { data: subjects = [] } = useTaxonomyList('subjects');
  const { data: curricula = [] } = useTaxonomyList('curricula');
  const { data: stages = [] } = useTaxonomyList('stages');

  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name_ar }));
  const curriculumOptions = curricula.map((c) => ({ value: c.id, label: c.name_ar }));
  const stageOptions = stages.map((s) => ({ value: s.id, label: s.name_ar }));

  const isGroup = data.session_format === 'group';
  const capacityValid = isGroup ? Number(data.capacity) >= 2 : true;
  const isValid =
    data.title.trim() !== '' &&
    data.subject_id !== '' &&
    Number(data.sessions_count) > 0 &&
    capacityValid;

  const handleNext = () => {
    setTouched(true);
    if (!isValid) return;
    onNext();
  };

  const selectSessionFormat = (format) => {
    if (format === data.session_format) return;
    // الجدول له شكل مختلف تماماً بين الفردية (day_of_week فقط) والجماعية (date+start_time) — لا يصح نقله بين الاثنين
    onChange({
      session_format: format,
      capacity: format === 'individual' ? '1' : data.capacity === '1' ? '' : data.capacity,
      schedules: [],
    });
  };

  return (
    <div className="mt-8 flex flex-col items-end gap-6">
      <div className="flex w-full flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-primary">{t('dashboard.addPackage.titleLabel')}</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={t('dashboard.addPackage.titlePlaceholder')}
          className={`w-full rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none ${
            touched && data.title.trim() === '' ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
          }`}
        />
      </div>

      <h3 className="w-full text-right text-base font-bold text-ink">{t('dashboard.addPackage.sessionTypeLabel')}</h3>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {SESSION_TYPES.map((type) => {
          const Icon = type.icon;
          const selected = data.session_format === type.key;
          return (
            <button
              key={type.key}
              type="button"
              onClick={() => selectSessionFormat(type.key)}
              className="relative flex flex-col items-center gap-2 rounded-2xl border border-[#F2F2F7] bg-white p-4 pt-8 text-center shadow-card transition-colors"
            >
              <span
                className={`absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  selected ? 'border-primary' : 'border-[#626262]'
                }`}
              >
                {selected && <span className="h-3 w-3 rounded-full bg-primary" />}
              </span>

              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-xl" style={{ background: type.bg }}>
                <Icon size={30} style={{ color: type.color }} />
              </div>

              <h4 className="font-bold text-[#2D2D2D]">{t(`dashboard.addPackage.sessionTypes.${type.key}.title`)}</h4>
              <p className="text-sm text-ink-soft">{t(`dashboard.addPackage.sessionTypes.${type.key}.desc`)}</p>
              <span className="rounded-pill px-3 py-1 text-sm" style={{ background: type.bg, color: type.color }}>
                {t(`dashboard.addPackage.sessionTypes.${type.key}.badge`)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <SmoothSelect
          label={t('dashboard.addPackage.subjectLabel')}
          value={data.subject_id}
          onChange={(v) => onChange({ subject_id: v })}
          options={subjectOptions}
          placeholder={t('dashboard.addPackage.selectPlaceholder')}
        />

        <div className="flex flex-col items-start gap-1.5">
          <label className="text-sm font-semibold text-primary">{t('dashboard.addPackage.capacityLabel')}</label>
          <input
            type="number"
            min={isGroup ? 2 : 1}
            disabled={!isGroup}
            value={data.capacity}
            onChange={(e) => onChange({ capacity: e.target.value })}
            className={`w-full rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink disabled:bg-[#F7F8FA] disabled:text-ink-soft focus:outline-none ${
              touched && !capacityValid ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
            }`}
          />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <MultiSelectChips
          label={t('dashboard.addPackage.curriculumLabel')}
          values={data.curriculum_ids}
          onChange={(v) => onChange({ curriculum_ids: v })}
          options={curriculumOptions}
          placeholder={t('dashboard.addPackage.selectPlaceholder')}
        />
        <MultiSelectChips
          label={t('dashboard.addPackage.stageLabel')}
          values={data.stage_ids}
          onChange={(v) => onChange({ stage_ids: v })}
          options={stageOptions}
          placeholder={t('dashboard.addPackage.selectPlaceholder')}
        />
      </div>

      <div className="flex flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-primary">{t('dashboard.addPackage.sessionsCountLabel')}</label>
        <input
          type="number"
          min="1"
          value={data.sessions_count}
          onChange={(e) => onChange({ sessions_count: e.target.value })}
          placeholder={t('dashboard.addPackage.sessionsCountPlaceholder')}
          className={`w-full rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none sm:w-1/3 ${
            touched && !(Number(data.sessions_count) > 0) ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
          }`}
        />
      </div>

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
