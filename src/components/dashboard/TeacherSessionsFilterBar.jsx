import { CalendarDays, Search } from 'lucide-react';
import { SmoothSelect } from './SmoothSelect';
import { useT } from '@/hooks/useT';

export function TeacherSessionsFilterBar({ statuses, subjects, filters, onChange }) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SmoothSelect
        className="min-w-[200px] flex-1"
        value={filters.status}
        onChange={(v) => onChange('status', v)}
        placeholder={t('dashboard.teacherSessions.allStatuses')}
        options={statuses}
      />

      <SmoothSelect
        className="min-w-[200px] flex-1"
        value={filters.subject}
        onChange={(v) => onChange('subject', v)}
        placeholder={t('dashboard.teacherSessions.allSubjects')}
        options={subjects.map((subject) => ({ value: subject, label: subject }))}
      />

      <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-[#E3E3E3] bg-white px-3 py-3">
        <CalendarDays size={16} className="shrink-0 text-primary" />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => onChange('date', e.target.value)}
          className="w-full bg-transparent text-sm text-ink outline-none"
        />
      </div>

      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
        <Search size={16} className="shrink-0 text-ink-soft" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder={t('dashboard.teacherSessions.searchPlaceholder')}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
        />
      </div>
    </div>
  );
}
