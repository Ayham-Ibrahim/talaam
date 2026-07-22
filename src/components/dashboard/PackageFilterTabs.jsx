import { useT } from '@/hooks/useT';

const TABS = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'active', labelKey: 'filterActive' },
  { key: 'course', labelKey: 'filterCourses' },
  { key: 'expired', labelKey: 'filterExpired' },
];

export function PackageFilterTabs({ active, onChange }) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-2xl px-6 py-3 text-sm font-bold transition-colors sm:text-base ${
            active === tab.key
              ? 'bg-primary text-white'
              : 'border border-line bg-white text-ink hover:bg-line/30'
          }`}
        >
          {t(`dashboard.myPackages.${tab.labelKey}`)}
        </button>
      ))}
    </div>
  );
}
