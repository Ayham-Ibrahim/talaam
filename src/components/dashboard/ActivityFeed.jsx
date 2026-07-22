import { Activity, BookOpen, Star, XCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { useT } from '@/hooks/useT';

const ACTIVITY_STYLES = {
  review: { icon: Star, bg: '#FFFFDD', color: '#FFCC00' },
  invoice: { icon: BookOpen, bg: '#DDF2FF', color: '#00C0E8' },
  cancel: { icon: XCircle, bg: '#FFDEDD', color: '#FF383C' },
};

export function ActivityFeed({ activities }) {
  const t = useT();

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white px-8 py-4 shadow-card">
      <h3 className="flex items-center gap-2 self-end border-b border-line pb-4 font-bold text-ink">
        {t('dashboard.activityTitle')}
        <Activity size={20} className="text-primary" />
      </h3>

      {activities.length === 0 ? (
        <EmptyState title={t('dashboard.noActivities')} />
      ) : (
        <div className="divide-y divide-[#F2F2F7]">
          {activities.map((activity) => {
            const style = ACTIVITY_STYLES[activity.type] ?? ACTIVITY_STYLES.invoice;
            const Icon = style.icon;
            return (
              <div key={activity.id} className="flex items-center justify-end gap-3 py-4">
                <p className="text-right text-sm font-semibold text-ink">{activity.text}</p>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ background: style.bg }}
                >
                  <Icon size={18} style={{ color: style.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
