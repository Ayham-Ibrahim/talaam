import { useT } from '@/hooks/useT';

const TABS = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'individual', labelKey: 'filterIndividual' },
  { key: 'group', labelKey: 'filterGroup' },
  { key: 'training', labelKey: 'filterTraining' },
];

export function SessionsFilterTabs({ active, onChange }) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#F2F2F7] p-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex-1 rounded-lg px-4 py-3 text-sm font-bold transition-colors sm:text-base ${
            active === tab.key ? 'bg-primary text-white' : 'bg-white text-ink hover:bg-line/30'
          }`}
        >
          {t(`dashboard.categoryFilters.${tab.labelKey}`)}
        </button>
      ))}
    </div>
  );
}
