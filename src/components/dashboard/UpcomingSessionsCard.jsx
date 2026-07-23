import { CalendarDays } from 'lucide-react';
import { Avatar, Button, EmptyState } from '@/components/ui';
import { getSessionTypeColor } from '@/mocks/dashboard.mock';
import { useT } from '@/hooks/useT';

function SessionRow({ session }) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <Button variant="outline" size="sm" className="!rounded-xl !border-2">
        {t('dashboard.join')}
      </Button>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-4 text-sm">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="font-bold text-[#B00852]">{String(session.countdown.days).padStart(2, '0')}</div>
            <div className="text-ink-soft">{t('dashboard.day')}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[#B00852]">{String(session.countdown.hours).padStart(2, '0')}</div>
            <div className="text-ink-soft">{t('dashboard.hour')}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[#B00852]">{String(session.countdown.minutes).padStart(2, '0')}</div>
            <div className="text-ink-soft">{t('dashboard.minute')}</div>
          </div>
        </div>

        <span className="h-8 w-px bg-line" />

        <div className="text-right">
          <div className="font-semibold text-ink">
            {session.time} {session.period}
          </div>
          <div className="text-ink-soft">
            {session.durationMinutes} {t('teacher.sessionMinutes')}
          </div>
        </div>

        <span className="h-8 w-px bg-line" />

        <div className="text-right">
          <div className="font-semibold text-ink">{session.day}</div>
          <div className="text-ink-soft">{session.date}</div>
        </div>

        <span className="h-8 w-px bg-line" />

        <div className="font-semibold" style={{ color: getSessionTypeColor(session.sessionType) }}>
          {session.sessionType}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="font-semibold text-ink">{session.teacherName}</div>
          <div className="text-sm text-ink-soft">{session.subject}</div>
        </div>
        <Avatar name={session.teacherName} src={session.teacherAvatar} size="md" />
      </div>
    </div>
  );
}

export function UpcomingSessionsCard({ sessions }) {
  const t = useT();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h3 className="flex items-center gap-2 font-bold text-ink">
          {t('dashboard.upcomingSessionsTitle')}
          <CalendarDays size={20} className="text-primary" />
        </h3>
        <button type="button" className="text-sm font-bold text-primary hover:underline">
          {t('dashboard.viewAll')}
        </button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState title={t('dashboard.noUpcomingSessions')} />
      ) : (
        <div className="divide-y divide-line">
          {sessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
