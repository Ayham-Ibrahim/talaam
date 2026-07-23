import { Crown } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useT } from '@/hooks/useT';

export function PackageDetailSummary({ pkg }) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-start justify-between gap-6 rounded-2xl bg-white p-6 shadow-card">
      {/* Title + teacher (right) */}
      <div className="flex shrink-0 flex-col items-end gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink">{pkg.packageTitle}</span>
          <Crown size={20} className="text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm font-semibold text-ink">{pkg.teacherName}</div>
            <div className="text-xs text-ink-soft">{pkg.subject}</div>
          </div>
          <Avatar name={pkg.teacherName} src={pkg.teacherAvatar} size="sm" className="!h-[54px] !w-[54px]" />
        </div>
      </div>

      {/* Description (fills remaining width, to the left) */}
      <div className="min-w-[240px] flex-1 text-right">
        <h3 className="mb-3 font-bold text-ink">{t('dashboard.myPackages.description')}</h3>
        <p className="text-sm leading-7 text-ink-soft">{pkg.description}</p>
      </div>
    </div>
  );
}
