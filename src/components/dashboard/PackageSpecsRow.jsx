import { PACKAGE_TYPE_STYLES } from '@/mocks/dashboard.mock';
import { useT } from '@/hooks/useT';

function SpecBox({ label, value, valueColor }) {
  return (
    <div className="min-w-[130px] flex-1 rounded-2xl border border-line bg-white px-4 py-4 text-center">
      <div className="mb-2 text-sm text-ink-soft">{label}</div>
      <div className="font-bold" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
    </div>
  );
}

export function PackageSpecsRow({ pkg }) {
  const t = useT();
  const typeStyle = PACKAGE_TYPE_STYLES[pkg.type];

  return (
    <div className="flex flex-wrap gap-3">
      <SpecBox label={t('dashboard.subjectLabel')} value={pkg.subject} />
      <SpecBox label={t('dashboard.myPackages.curriculumLabel')} value={pkg.curriculum} />
      <SpecBox label={t('dashboard.myPackages.sessionTypeLabel')} value={typeStyle.label} valueColor={typeStyle.color} />
      <SpecBox label={t('dashboard.myPackages.sessionDuration')} value={`${pkg.durationMinutes} ${t('dashboard.minute')}`} />
      <SpecBox
        label={t('dashboard.myPackages.sessionsCount')}
        value={`${pkg.totalSessions} ${t('dashboard.myPackages.sessionsUnit')}`}
      />
    </div>
  );
}
