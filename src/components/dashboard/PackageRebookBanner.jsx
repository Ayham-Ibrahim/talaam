import { AlertTriangle } from 'lucide-react';
import { useT } from '@/hooks/useT';

export function PackageRebookBanner() {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#EDF0F5] px-6 py-4">
      <button
        type="button"
        className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover"
      >
        {t('dashboard.myPackages.rebook')}
      </button>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-primary">{t('dashboard.myPackages.lowSessionsWarning')}</span>
        <AlertTriangle size={28} className="fill-[#FFCD0F] text-[#1E1E1E]" />
      </div>
    </div>
  );
}
