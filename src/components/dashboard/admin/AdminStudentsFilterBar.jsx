import { Search } from 'lucide-react';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { useT } from '@/hooks/useT';

const EDUCATION_TYPE_KEYS = ['school', 'university', 'training'];

export function AdminStudentsFilterBar({ filters, onChange }) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SmoothSelect
        className="min-w-[200px] flex-1"
        value={filters.educationType}
        onChange={(v) => onChange('educationType', v)}
        placeholder={t('dashboard.adminStudents.allEducationTypes')}
        options={EDUCATION_TYPE_KEYS.map((value) => ({ value, label: t(`dashboard.adminStudents.educationType.${value}`) }))}
      />

      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
        <Search size={16} className="shrink-0 text-ink-soft" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder={t('dashboard.adminStudents.searchPlaceholder')}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
        />
      </div>
    </div>
  );
}
