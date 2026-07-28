import { UserRound } from 'lucide-react';
import { useT } from '@/hooks/useT';

/* DOM order renders right-to-left in this grid, so the last entry appears rightmost. */
const STAT_CONFIG = [
  { key: 'training', valueKey: 'training' },
  { key: 'group', valueKey: 'group' },
  { key: 'individual', valueKey: 'individual' },
  { key: 'total', valueKey: 'total' },
];

export function TeacherStudentStatsGrid({ stats }) {
  const t = useT();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_CONFIG.map((stat) => {
        const value = stats?.[stat.valueKey] ?? 0;
        return (
          <div key={stat.key} className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl" style={{ background: '#EDF0F5' }}>
              <UserRound size={28} style={{ color: '#4B6898' }} />
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#2D2D2D]">{t(`dashboard.teacherStudents.${stat.key}`)}</div>
              <div className="text-2xl font-bold text-[#2D2D2D]">{String(value).padStart(2, '0')}</div>
              <div className="text-sm text-ink-soft">{t('dashboard.teacherStudents.unit')}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
