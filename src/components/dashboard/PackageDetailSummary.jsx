import { Crown } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useT } from '@/hooks/useT';

export function PackageDetailSummary({ pkg }) {
  const t = useT();
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pkg.usagePercent / 100) * circumference;

  return (
    <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-white p-5 shadow-card">
      {/* Title + teacher */}
      <div className="flex flex-col items-end gap-3">
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

      {/* Donut */}
      <div className="relative flex h-[100px] w-[100px] shrink-0 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#F5F5F5" strokeWidth="9" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#4B6898"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute text-lg font-bold text-ink">{pkg.usagePercent}%</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-xs text-primary">{t('dashboard.myPackages.remaining')}</div>
          <div className="font-semibold text-ink">
            {String(pkg.remainingSessions).padStart(2, '0')} {t('dashboard.myPackages.sessionUnit')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-primary">{t('dashboard.myPackages.used')}</div>
          <div className="font-semibold text-ink">
            {String(pkg.usedSessions).padStart(2, '0')} {t('dashboard.myPackages.sessionUnit')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-primary">{t('dashboard.myPackages.total')}</div>
          <div className="font-semibold text-ink">
            {pkg.totalSessions} {t('dashboard.myPackages.sessionsUnit')}
          </div>
        </div>
      </div>

      {/* Dates + price */}
      <div className="flex flex-col items-end gap-1.5 text-sm text-ink">
        <span>
          {t('dashboard.myPackages.purchaseDate')} : {pkg.purchaseDate}
        </span>
        <span>
          {t('dashboard.myPackages.expiryDate')} : {pkg.expiryDate}
        </span>
        <span className="font-bold">
          {t('dashboard.myPackages.price')} : ${pkg.price}
        </span>
      </div>
    </div>
  );
}
