import { BookMarked, Crown } from 'lucide-react';
import { useT } from '@/hooks/useT';

/* DOM order renders right-to-left in this grid, so the last entry appears rightmost. */
const STAT_CONFIG = [
  { key: 'sessionsCount', valueKey: 'sessionsCount', icon: BookMarked, bg: '#FEF3EA', color: '#F74E28', hintKey: 'sessionsCountHint' },
  { key: 'pendingReview', valueKey: 'pendingReview', icon: Crown, bg: '#FDF8F0', color: '#FF8D28', hintKey: 'pendingReviewHint' },
  { key: 'activePackages', valueKey: 'activePackagesCount', icon: Crown, bg: '#F0FDF2', color: '#34C759', hintKey: 'activePackagesHint' },
  { key: 'totalPackages', valueKey: 'totalPackages', icon: Crown, bg: '#EDF0F5', color: '#4B6898', hintKey: 'totalPackagesHint' },
];

export function TeacherPackageStatsGrid({ stats }) {
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
              <div className="text-sm font-bold text-[#2D2D2D]">{t(`dashboard.teacherPackages.${stat.key}`)}</div>
              <div className="text-2xl font-bold text-[#2D2D2D]">{String(value).padStart(2, '0')}</div>
              <div className="text-sm text-ink-soft">{t(`dashboard.teacherPackages.${stat.hintKey}`)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
