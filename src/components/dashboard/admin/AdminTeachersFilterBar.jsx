import { ChevronLeft, Search } from 'lucide-react';
import { TEACHER_STATUS_STYLES, TEACHER_TYPE_LABELS } from '@/mocks/admin.mock';
import { useT } from '@/hooks/useT';

export function AdminTeachersFilterBar({ filters, onChange }) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
        <ChevronLeft size={16} className="shrink-0 text-ink-soft" />
        <select
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full appearance-none bg-transparent text-sm font-semibold text-ink outline-none"
        >
          <option value="">{t('dashboard.adminTeachers.allStatuses')}</option>
          {Object.entries(TEACHER_STATUS_STYLES).map(([value, style]) => (
            <option key={value} value={value}>
              {style.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
        <ChevronLeft size={16} className="shrink-0 text-ink-soft" />
        <select
          value={filters.type}
          onChange={(e) => onChange('type', e.target.value)}
          className="w-full appearance-none bg-transparent text-sm font-semibold text-ink outline-none"
        >
          <option value="">{t('dashboard.adminTeachers.allTypes')}</option>
          {Object.entries(TEACHER_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
        <Search size={16} className="shrink-0 text-ink-soft" />
        <input
          type="text"
          value={filters.q}
          onChange={(e) => onChange('q', e.target.value)}
          placeholder={t('dashboard.adminTeachers.searchPlaceholder')}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
        />
      </div>
    </div>
  );
}
