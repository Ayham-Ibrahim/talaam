import { Search } from 'lucide-react';
import { SmoothSelect } from './SmoothSelect';
import { useT } from '@/hooks/useT';

export function TeacherStudentsFilterBar({ subjects, filters, onChange }) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SmoothSelect
        className="min-w-[200px] flex-1"
        value={filters.type}
        onChange={(v) => onChange('type', v)}
        placeholder={t('dashboard.teacherStudents.packageTypeLabel')}
        options={[
          { value: 'individual', label: t('dashboard.teacherPackages.typeIndividual') },
          { value: 'group', label: t('dashboard.teacherPackages.typeGroup') },
          { value: 'training', label: t('dashboard.teacherPackages.typeTraining') },
        ]}
      />

      <SmoothSelect
        className="min-w-[200px] flex-1"
        value={filters.subject}
        onChange={(v) => onChange('subject', v)}
        placeholder={t('dashboard.teacherStudents.allSubjects')}
        options={subjects.map((subject) => ({ value: subject, label: subject }))}
      />

      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
        <Search size={16} className="shrink-0 text-ink-soft" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder={t('dashboard.teacherStudents.searchPlaceholder')}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
        />
      </div>
    </div>
  );
}
