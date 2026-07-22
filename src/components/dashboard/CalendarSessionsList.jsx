import { CalendarDays } from 'lucide-react';
import { Avatar, Button, EmptyState } from '@/components/ui';
import { SESSION_TYPE_STYLES } from '@/mocks/dashboard.mock';
import { useT } from '@/hooks/useT';

function DaySessionRow({ session }) {
  const t = useT();
  const typeStyle = SESSION_TYPE_STYLES[session.type];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-2">
        {session.canReschedule && (
          <button
            type="button"
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.changeAppointment')}
          </button>
        )}
        <Button size="sm" className="!rounded-xl">
          {t('dashboard.join')}
        </Button>
      </div>

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

        <span className="rounded-pill bg-[#E3F1FD] px-3 py-1 text-xs font-bold text-primary">
          {t('dashboard.statusUpcoming')}
        </span>

        <span className="h-8 w-px bg-line" />

        <span className="font-bold" style={{ color: typeStyle.color }}>
          {typeStyle.label}
        </span>
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

export function CalendarSessionsList({ dateLabel, sessions }) {
  const t = useT();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h3 className="flex items-center gap-2 font-bold text-ink">
          {t('dashboard.sessionsFor')} {dateLabel}
          <CalendarDays size={20} className="text-primary" />
        </h3>
      </div>

      {sessions.length === 0 ? (
        <EmptyState title={t('dashboard.noSessionsForDay')} />
      ) : (
        <div className="divide-y divide-line">
          {sessions.map((session) => (
            <DaySessionRow key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
