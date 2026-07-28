import { Filter, RotateCcw } from 'lucide-react';
import { SmoothSelect } from './SmoothSelect';
import { useT } from '@/hooks/useT';

function FilterSelect({ label, value, onChange, options }) {
  const t = useT();
  return (
    <SmoothSelect
      className="w-full max-w-[250px]"
      label={label}
      value={value}
      onChange={onChange}
      placeholder={t('dashboard.selectPlaceholder')}
      options={options.map((opt) => ({ value: opt, label: opt }))}
    />
  );
}

export function CalendarFilterBar({ filters, onChange, onApply, onReset }) {
  const t = useT();

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <h3 className="mb-4 flex items-center justify-end gap-2 font-bold text-primary">
        {t('dashboard.filterTitle')}
        <Filter size={20} />
      </h3>

      <div className="flex flex-wrap items-end justify-center gap-4">
        <FilterSelect
          label={t('dashboard.subjectLabel')}
          value={filters.subject}
          onChange={(v) => onChange('subject', v)}
          options={['اللغة الانكليزية', 'الرياضيات']}
        />
        <FilterSelect
          label={t('dashboard.statusLabel')}
          value={filters.status}
          onChange={(v) => onChange('status', v)}
          options={['قادمة', 'منتهية', 'ملغاة']}
        />
        <FilterSelect
          label={t('dashboard.languageLabel')}
          value={filters.language}
          onChange={(v) => onChange('language', v)}
          options={['عربي', 'انكليزي']}
        />

        <div className="flex shrink-0 items-center gap-4 pb-3">
          <button
            type="button"
            onClick={onApply}
            className="rounded-2xl bg-primary px-6 py-3 text-sm text-white hover:bg-primary-hover"
          >
            {t('dashboard.applyFilters')}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <RotateCcw size={16} />
            {t('dashboard.resetFilters')}
          </button>
        </div>
      </div>
    </div>
  );
}
