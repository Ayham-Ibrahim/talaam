import { Crown, Medal } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useT } from '@/hooks/useT';

export function PackageWidget({ pkg }) {
  const t = useT();
  const percent = pkg?.usagePercent ?? 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex h-full flex-col items-center rounded-2xl bg-white px-6 py-4 shadow-card">
      <h3 className="flex w-full items-center justify-end gap-2 border-b border-line pb-4 font-bold text-ink">
        {t('dashboard.packagesTitle')}
        <Crown size={20} className="text-primary" />
      </h3>

      {pkg && (
        <div className="mt-4 flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-purple/10">
              <Medal size={20} className="text-accent-purple" />
            </div>
            <div className="text-right">
              <div className="font-bold text-ink">{pkg.packageTitle}</div>
              <div className="text-sm text-ink-soft">
                {pkg.durationMinutes} {t('teacher.sessionMinutes')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="font-bold text-ink">{pkg.teacherName}</div>
              <div className="text-sm text-ink-soft">{pkg.subject}</div>
            </div>
            <Avatar name={pkg.teacherName} src={pkg.teacherAvatar} size="sm" className="!h-[42px] !w-[42px]" />
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3">
        <div className="relative flex h-[181px] w-[181px] items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id="package-progress-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4B6898" />
                <stop offset="100%" stopColor="#C7D0DF" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#F5F5F5" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="url(#package-progress-gradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute flex flex-col items-center gap-1">
            <span className="text-[32px] font-bold leading-tight text-[#0A0A0A]">{percent}%</span>
            <span className="text-sm font-medium text-[#737373]">{t('dashboard.usageRate')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#AEAEB2]" />
          <span className="h-3.5 w-3.5 rounded-full bg-primary" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#AEAEB2]" />
        </div>
      </div>
    </div>
  );
}
