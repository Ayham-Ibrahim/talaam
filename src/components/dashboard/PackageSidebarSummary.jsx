import { useT } from '@/hooks/useT';

function StatRow({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-lg font-bold text-ink">{value}</span>
    </div>
  );
}

export function PackageSidebarSummary({ pkg }) {
  const t = useT();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pkg.usagePercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow-card">
      <div className="relative flex h-[180px] w-[180px] shrink-0 items-center justify-center">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id={`package-sidebar-progress-gradient-${pkg.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4B6898" />
              <stop offset="100%" stopColor="#C7D0DF" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#F5F5F5" strokeWidth="12" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={`url(#package-sidebar-progress-gradient-${pkg.id})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute text-3xl font-bold text-ink">{pkg.usagePercent}%</span>
      </div>
      <span className="-mt-4 text-sm text-ink-soft">{t('dashboard.usageRate')}</span>

      <div className="grid w-full grid-cols-1 gap-5">
        <StatRow label={t('dashboard.myPackages.total')} value={`${pkg.totalSessions} ${t('dashboard.myPackages.sessionsUnit')}`} />
        <StatRow
          label={t('dashboard.myPackages.used')}
          value={`${String(pkg.usedSessions).padStart(2, '0')} ${t('dashboard.myPackages.sessionUnit')}`}
        />
        <StatRow
          label={t('dashboard.myPackages.remaining')}
          value={`${String(pkg.remainingSessions).padStart(2, '0')} ${t('dashboard.myPackages.sessionUnit')}`}
        />
        <StatRow label={t('dashboard.myPackages.purchaseDate')} value={pkg.purchaseDate} />
        <StatRow label={t('dashboard.myPackages.expiryDate')} value={pkg.expiryDate} />
        <StatRow label={t('dashboard.myPackages.price')} value={`${pkg.price}$`} />
      </div>
    </div>
  );
}
