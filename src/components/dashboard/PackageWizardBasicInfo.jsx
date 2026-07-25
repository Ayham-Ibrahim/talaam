import { useState } from 'react';
import { GraduationCap, Users, User } from 'lucide-react';
import { SmoothSelect } from './SmoothSelect';
import { CURRICULUM_OPTIONS, SUBJECT_OPTIONS } from '@/lib/packageWizardOptions';
import { useT } from '@/hooks/useT';

/* DOM order renders right-to-left, so the last entry lands selected/rightmost by default. */
const ALL_SESSION_TYPES = [
  { key: 'individual', icon: User, bg: '#F0FAFD', color: '#6BCEEE' },
  { key: 'group', icon: Users, bg: '#FEEDEA', color: '#F74E28' },
  { key: 'training', icon: GraduationCap, bg: '#F7E6EE', color: '#B00852' },
];

/* Training centers only ever offer courses; individual teachers only ever offer packages —
   matches the backend rule that a provider's type determines packages vs. courses, never both. */
function sessionTypesFor(teacherType) {
  if (teacherType === 'training_center') return ALL_SESSION_TYPES.filter((t) => t.key === 'training');
  return ALL_SESSION_TYPES.filter((t) => t.key !== 'training');
}

export function PackageWizardBasicInfo({ data, onChange, teacherType, onNext }) {
  const t = useT();
  const [touched, setTouched] = useState(false);
  const sessionTypes = sessionTypesFor(teacherType);

  const isValid = data.curriculum !== '' && data.subject !== '' && Number(data.sessionsCount) > 0;

  const handleNext = () => {
    setTouched(true);
    if (!isValid) return;
    onNext();
  };

  return (
    <div className="mt-8 flex flex-col items-end gap-6">
      <h3 className="w-full text-right text-base font-bold text-ink">{t('dashboard.addPackage.sessionTypeLabel')}</h3>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {sessionTypes.map((type) => {
          const Icon = type.icon;
          const selected = data.sessionType === type.key;
          return (
            <button
              key={type.key}
              type="button"
              onClick={() => onChange({ sessionType: type.key })}
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
          label={t('dashboard.addPackage.curriculumLabel')}
          value={data.curriculum}
          onChange={(v) => onChange({ curriculum: v })}
          options={CURRICULUM_OPTIONS}
          placeholder={t('dashboard.addPackage.selectPlaceholder')}
        />
        <SmoothSelect
          label={t('dashboard.addPackage.subjectLabel')}
          value={data.subject}
          onChange={(v) => onChange({ subject: v })}
          options={SUBJECT_OPTIONS}
          placeholder={t('dashboard.addPackage.selectPlaceholder')}
        />
      </div>

      <div className="flex w-full flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-primary">{t('dashboard.addPackage.sessionsCountLabel')}</label>
        <input
          type="number"
          min="1"
          value={data.sessionsCount}
          onChange={(e) => onChange({ sessionsCount: e.target.value })}
          placeholder={t('dashboard.addPackage.sessionsCountPlaceholder')}
          className={`w-full rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none ${
            touched && !(Number(data.sessionsCount) > 0) ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
          }`}
        />
      </div>

      <div className="flex w-full flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-primary">{t('dashboard.addPackage.descriptionLabel')}</label>
        <div className="w-full rounded-lg border border-[#E3E3E3] px-3 py-2.5">
          <textarea
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value.slice(0, 100) })}
            placeholder={t('dashboard.addPackage.descriptionPlaceholder')}
            rows={4}
            className="w-full resize-none bg-transparent text-right text-sm text-ink outline-none placeholder:text-[#AEAEB2]"
          />
          <div className="text-left text-xs text-[#AEAEB2]">{data.description.length}/100</div>
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
