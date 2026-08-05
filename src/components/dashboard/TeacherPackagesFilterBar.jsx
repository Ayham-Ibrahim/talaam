import { Plus, Search } from 'lucide-react';
import { SmoothSelect } from './SmoothSelect';
import { TEACHER_PACKAGE_STATUS_STYLES } from '@/mocks/teacherDashboard.mock';
import { useT } from '@/hooks/useT';

export function TeacherPackagesFilterBar({ filters, onChange, onCreate }) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <button
        type="button"
        onClick={onCreate}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-hover"
      >
        {t('dashboard.teacherPackages.createPackage')}
        <Plus size={20} />
      </button>

      <div className="flex flex-wrap items-center gap-4">
        <SmoothSelect
          className="w-44"
          value={filters.status}
          onChange={(v) => onChange('status', v)}
          placeholder={t('dashboard.teacherPackages.statusLabel')}
          options={Object.entries(TEACHER_PACKAGE_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label }))}
        />

        <SmoothSelect
          className="w-40"
          value={filters.type}
          onChange={(v) => onChange('type', v)}
          placeholder={t('dashboard.teacherPackages.typeLabel')}
          options={[
            { value: 'individual', label: t('dashboard.teacherPackages.typeIndividual') },
            { value: 'group', label: t('dashboard.teacherPackages.typeGroup') },
          ]}
        />

        <div className="flex w-[380px] items-center gap-2 rounded-lg border border-[#F2F2F7] bg-white px-3.5 py-3">
          <Search size={18} className="shrink-0 text-[#8E8E93]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            placeholder={t('dashboard.teacherPackages.searchPlaceholder')}
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-[#8E8E93]"
          />
        </div>
      </div>
    </div>
  );
}
