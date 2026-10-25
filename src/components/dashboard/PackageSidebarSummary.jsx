import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';

function StatRow({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-lg font-bold text-ink">{value}</span>
    </div>
  );
}

/** الدورة لا تُستهلك كرصيد جلسات كالباقة — تُعرض جلساتها المنتهية والقادمة وتواريخها بدل "نسبة الاستخدام" */
function CourseSidebarSummary({ pkg }) {
  const t = useT();
  const sessions = (n) => `${String(n).padStart(2, '0')} ${t('dashboard.myPackages.sessionUnit')}`;
  const rows = [
    [t('dashboard.myPackages.total'), `${pkg.totalSessions} ${t('dashboard.myPackages.sessionsUnit')}`],
    [t('dashboard.myPackages.courseEndedSessions'), sessions(pkg.endedSessions)],
    [t('dashboard.myPackages.courseUpcomingSessions'), sessions(pkg.upcomingSessions)],
    [t('dashboard.myPackages.enrollmentDate'), pkg.purchaseDate],
    pkg.courseStartDate && [t('dashboard.myPackages.courseStartDate'), pkg.courseStartDate],
    pkg.courseEndDate && [t('dashboard.myPackages.courseEndDate'), pkg.courseEndDate],
    [t('dashboard.myPackages.price'), `${pkg.price} د.إ`],
  ].filter(Boolean);

  // قائمة "عنوان ← قيمة" بمحاذاة ثابتة: العنوان يميناً والقيمة يساراً
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <dl className="divide-y divide-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <dt className="text-sm text-ink-soft">{label}</dt>
            <dd className="text-sm font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function PackageSidebarSummary({ pkg }) {
  if (pkg.type === 'course') return <CourseSidebarSummary pkg={pkg} />;
  return <PackageUsageSummary pkg={pkg} />;
}

function PackageUsageSummary({ pkg }) {
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
              <stop offset="100%" stopColor="#6BCEEE" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#F5F5F5" strokeWidth="12" />
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={`url(#package-sidebar-progress-gradient-${pkg.id})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
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
        <StatRow label={t('dashboard.myPackages.price')} value={`${pkg.price} د.إ`} />
      </div>
    </div>
  );
}
