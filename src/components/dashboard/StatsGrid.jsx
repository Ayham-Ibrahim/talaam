import { BookMarked, CalendarClock, Clock4, Wallet } from 'lucide-react';
import { useT } from '@/hooks/useT';

const STAT_CONFIG = [
  { key: 'totalPaid', icon: Wallet, bg: '#FEEDEA', color: '#F74E28', valueKey: 'totalPaid', hintKey: 'totalPaidHint' },
  { key: 'totalPackages', icon: BookMarked, bg: '#F7E6EE', color: '#B00852', valueKey: 'totalPackages', hintKey: 'totalPackagesHint' },
  { key: 'learningHours', icon: Clock4, bg: '#F0FAFD', color: '#6BCEEE', valueKey: 'learningHours', hintKey: 'learningHoursHint' },
  {
    key: 'upcomingSessions',
    icon: CalendarClock,
    bg: '#EDF0F5',
    color: '#4B6898',
    valueKey: 'upcomingSessionsCount',
    hintKey: 'upcomingSessionsHint',
  },
];

export function StatsGrid({ stats }) {
  const t = useT();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_CONFIG.map((stat) => {
        const Icon = stat.icon;
        const value = stats?.[stat.valueKey] ?? 0;
        return (
          <div key={stat.key} className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
            <div
              className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl"
              style={{ background: stat.bg }}
            >
              <Icon size={28} style={{ color: stat.color }} />
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#2D2D2D]">{t(`dashboard.stats.${stat.key}`)}</div>
              <div className="text-2xl font-bold text-[#2D2D2D]">{String(value).padStart(2, '0')}</div>
              <div className="text-sm text-ink-soft">{t(`dashboard.stats.${stat.hintKey}`)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
