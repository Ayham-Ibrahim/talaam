import { Star, Clock4, Crown, GraduationCap } from 'lucide-react';
import { useT } from '@/hooks/useT';

/* DOM order renders right-to-left in this grid, so the last entry appears rightmost. */
const STAT_CONFIG = [
  { key: 'totalStudents', icon: GraduationCap, bg: '#EDF0F5', color: '#4B6898', valueKey: 'totalStudents', hintKey: 'totalStudentsHint' },
  { key: 'activePackages', icon: Crown, bg: '#F0FAFD', color: '#6BCEEE', valueKey: 'activePackagesCount', hintKey: 'activePackagesHint' },
  { key: 'teachingHours', icon: Clock4, bg: '#F7E6EE', color: '#B00852', valueKey: 'teachingHours', hintKey: 'teachingHoursHint' },
  { key: 'averageRating', icon: Star, bg: '#FEF3EA', color: '#FF8D28', valueKey: 'averageRating', hintKey: 'averageRatingHint' },
];

export function TeacherStatsGrid({ stats }) {
  const t = useT();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_CONFIG.map((stat) => {
        const Icon = stat.icon;
        const rawValue = stats?.[stat.valueKey] ?? 0;
        const value = stat.key === 'averageRating' ? rawValue : String(rawValue).padStart(2, '0');
        return (
          <div key={stat.key} className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
            <div
              className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl"
              style={{ background: stat.bg }}
            >
              <Icon size={28} style={{ color: stat.color }} />
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#2D2D2D]">{t(`dashboard.teacherStats.${stat.key}`)}</div>
              <div className="text-2xl font-bold text-[#2D2D2D]">{value}</div>
              <div className="text-sm text-ink-soft">{t(`dashboard.teacherStats.${stat.hintKey}`)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
