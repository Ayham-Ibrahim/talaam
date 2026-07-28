import { Search } from 'lucide-react';
import { SmoothSelect } from './SmoothSelect';
import { useT } from '@/hooks/useT';

export function InvoicesFilterBar({ statuses, subjects, filters, onChange }) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SmoothSelect
        className="min-w-[200px] flex-1"
        value={filters.status}
        onChange={(v) => onChange('status', v)}
        placeholder={t('dashboard.invoices.allStatuses')}
        options={statuses}
      />

      <SmoothSelect
        className="min-w-[200px] flex-1"
        value={filters.subject}
        onChange={(v) => onChange('subject', v)}
        placeholder={t('dashboard.invoices.allSubjects')}
        options={subjects.map((subject) => ({ value: subject, label: subject }))}
      />

      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
        <Search size={16} className="shrink-0 text-ink-soft" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder={t('dashboard.invoices.searchPlaceholder')}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
        />
      </div>
    </div>
  );
}
