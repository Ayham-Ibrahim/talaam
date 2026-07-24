import { ChevronLeft, Plus, Search } from 'lucide-react';
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
        <div className="flex w-40 items-center gap-2 rounded-lg border border-[#E3E3E3] px-2 py-2.5">
          <ChevronLeft size={14} className="shrink-0 text-ink" />
          <select
            value={filters.status}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full appearance-none bg-transparent text-sm text-ink outline-none"
          >
            <option value="">{t('dashboard.teacherPackages.statusLabel')}</option>
            <option value="active">{t('dashboard.teacherPackages.statusActive')}</option>
          </select>
        </div>

        <div className="flex w-40 items-center gap-2 rounded-lg border border-[#E3E3E3] px-2 py-2.5">
          <ChevronLeft size={14} className="shrink-0 text-ink" />
          <select
            value={filters.type}
            onChange={(e) => onChange('type', e.target.value)}
            className="w-full appearance-none bg-transparent text-sm text-ink outline-none"
          >
            <option value="">{t('dashboard.teacherPackages.typeLabel')}</option>
            <option value="individual">{t('dashboard.teacherPackages.typeIndividual')}</option>
            <option value="group">{t('dashboard.teacherPackages.typeGroup')}</option>
            <option value="training">{t('dashboard.teacherPackages.typeTraining')}</option>
          </select>
        </div>

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
