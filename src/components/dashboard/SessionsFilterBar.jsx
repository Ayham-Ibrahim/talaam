import { ChevronLeft, Search } from 'lucide-react';
import { useT } from '@/hooks/useT';

export function SessionsFilterBar({ statuses, subjects, filters, onChange }) {
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
          <option value="">{t('dashboard.sessionsPage.allStatuses')}</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
        <ChevronLeft size={16} className="shrink-0 text-ink-soft" />
        <select
          value={filters.subject}
          onChange={(e) => onChange('subject', e.target.value)}
          className="w-full appearance-none bg-transparent text-sm font-semibold text-ink outline-none"
        >
          <option value="">{t('dashboard.sessionsPage.allSubjects')}</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
        <Search size={16} className="shrink-0 text-ink-soft" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder={t('dashboard.sessionsPage.searchPlaceholder')}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
        />
      </div>
    </div>
  );
}
