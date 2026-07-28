import { CalendarDays } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { SESSION_TYPE_STYLES, SESSION_STATUS_STYLES } from '@/mocks/dashboard.mock';
import { useT } from '@/hooks/useT';

/** Wording for this list's status pill differs from the shared "تم الحضور" label used elsewhere */
const STATUS_LABELS = {
  upcoming: 'قادمة',
  attended: 'مكتملة',
  cancelled: 'ملغاة',
};

function formatDayName(iso) {
  return new Intl.DateTimeFormat('ar', { weekday: 'long' }).format(new Date(iso));
}

function formatShortDate(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function DaySessionRow({ session, onDetails }) {
  const t = useT();
  const typeStyle = SESSION_TYPE_STYLES[session.type];
  const status = session.status ?? 'upcoming';
  const statusStyle = SESSION_STATUS_STYLES[status];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="text-right">
        <div className="font-semibold text-ink">{session.packageTitle}</div>
      </div>

      <span className="font-bold" style={{ color: typeStyle.color }}>
        {typeStyle.label}
      </span>

      <span className="text-ink-soft">{session.subject}</span>

      <div className="text-right">
        <div className="font-semibold text-ink">{formatDayName(session.date)}</div>
        <div className="text-ink-soft">{formatShortDate(session.date)}</div>
      </div>

      <div className="text-right">
        <div className="font-semibold text-ink">
          {session.time} {session.period}
        </div>
      </div>

      <span
        className="rounded-pill px-3 py-1 text-xs font-bold"
        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
      >
        {STATUS_LABELS[status]}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onDetails?.(session)}
          className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-line/30"
        >
          {t('dashboard.details')}
        </button>
        <button
          type="button"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {t('dashboard.join')}
        </button>
      </div>
    </div>
  );
}

export function CalendarSessionsList({ dateLabel, sessions, onDetails }) {
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
            <DaySessionRow key={session.id} session={session} onDetails={onDetails} />
          ))}
        </div>
      )}
    </div>
  );
}
