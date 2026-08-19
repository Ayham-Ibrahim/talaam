import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Avatar, EmptyState } from '@/components/ui';
import {
  getSessionTypeColor,
  SESSION_STATUS_STYLES,
  SESSION_STATUS_LABEL_KEYS,
} from '@/mocks/dashboard.mock';
import { RescheduleRequestModal } from './RescheduleRequestModal';
import { useCreateRescheduleRequest } from '@/hooks/useReschedule';
import { useJoinSession } from '@/hooks/useSessionJoin';
import { handleSessionJoin } from '@/lib/joinSession';
import { useT } from '@/hooks/useT';

function SessionRow({ session, showType, onReschedule }) {
  const t = useT();
  const navigate = useNavigate();
  const joinSession = useJoinSession();
  const status = session.status ?? 'upcoming';
  const statusStyle = SESSION_STATUS_STYLES[status];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-2">
        {session.canCancel && (
          <button
            type="button"
            onClick={() => navigate('/contact')}
            title={t('dashboard.rescheduleModal.sessionNotice')}
            className="rounded-xl border border-[#FF383C] bg-[#FDF0F0] px-4 py-2.5 text-sm text-[#FF383C] hover:bg-[#FF383C]/10"
          >
            {t('dashboard.myPackages.cancel')}
          </button>
        )}
        {session.canReschedule && (
          <button
            type="button"
            onClick={() => onReschedule(session.id)}
            className="rounded-xl border border-primary bg-[#EDF0F5] px-4 py-2.5 text-sm text-primary hover:bg-primary/10"
          >
            {t('dashboard.changeAppointment')}
          </button>
        )}
        {session.canJoin && (
          <button
            type="button"
            disabled={joinSession.isPending}
            onClick={() => handleSessionJoin(joinSession.mutateAsync, session.id)}
            className="rounded-xl border-2 border-primary bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {t('dashboard.join')}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-4 text-sm">
        {session.countdown && (
          <>
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
          </>
        )}

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

        <span
          className="rounded-pill px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
        >
          {t(SESSION_STATUS_LABEL_KEYS[status])}
        </span>

        {showType && (
          <>
            <span className="h-8 w-px bg-line" />
            <span className="font-semibold" style={{ color: getSessionTypeColor(session.sessionType) }}>
              {session.sessionType}
            </span>
          </>
        )}
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

export function PackageSessionsList({ sessions, showType = true }) {
  const t = useT();
  const [reschedulingSessionId, setReschedulingSessionId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const createRescheduleRequest = useCreateRescheduleRequest();
  const activeSession = sessions.find((session) => session.id === reschedulingSessionId) ?? null;

  const handleConfirmReschedule = ({ proposedScheduledAt, reason }) => {
    createRescheduleRequest.mutate(
      { sessionId: reschedulingSessionId, proposedScheduledAt, reason },
      {
        onSuccess: () => {
          setReschedulingSessionId(null);
          setSuccessMessage(t('dashboard.rescheduleModal.success'));
          setTimeout(() => setSuccessMessage(''), 4000);
        },
      }
    );
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h3 className="flex items-center gap-2 font-bold text-ink">
          {t('dashboard.myPackages.sessionsTitle')}
          <CalendarDays size={20} className="text-primary" />
        </h3>
      </div>

      {successMessage && (
        <div className="mt-4 rounded-2xl bg-success-light px-4 py-3 text-sm font-medium text-success">{successMessage}</div>
      )}

      {sessions.length === 0 ? (
        <EmptyState title={t('dashboard.myPackages.noSessions')} />
      ) : (
        <div className="divide-y divide-line">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              showType={showType}
              onReschedule={(id) => {
                createRescheduleRequest.reset();
                setReschedulingSessionId(id);
              }}
            />
          ))}
        </div>
      )}

      {reschedulingSessionId && (
        <RescheduleRequestModal
          isPending={createRescheduleRequest.isPending}
          error={createRescheduleRequest.error}
          currentScheduledAt={activeSession?.scheduled_at ?? activeSession?.scheduledAt ?? null}
          onConfirm={handleConfirmReschedule}
          onClose={() => setReschedulingSessionId(null)}
        />
      )}
    </div>
  );
}
