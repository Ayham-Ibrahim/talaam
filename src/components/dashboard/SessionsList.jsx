import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, EmptyState } from '@/components/ui';
import { getSessionTypeColor, SESSION_STATUS_STYLES, SESSION_STATUS_LABEL_KEYS } from '@/mocks/dashboard.mock';
import { RescheduleRequestModal } from './RescheduleRequestModal';
import { useCreateRescheduleRequest } from '@/hooks/useReschedule';
import { useJoinSession } from '@/hooks/useSessionJoin';
import { handleSessionJoin } from '@/lib/joinSession';
import { useT } from '@/hooks/useT';

/**
 * جدول بدل بطاقات متفرقة — عمود الإجراءات هو الأخير في الـ DOM عمداً، فيظهر
 * في أقصى يسار الصف (اتجاه RTL: أول عنصر بالـ DOM يظهر يميناً)، بنفس تعامل
 * TeacherSessionsTable في لوحة المعلم.
 */
function SessionRow({ session, isEven, onReschedule }) {
  const t = useT();
  const navigate = useNavigate();
  const joinSession = useJoinSession();
  const status = session.status ?? 'upcoming';
  const statusStyle = SESSION_STATUS_STYLES[status];

  return (
    <tr className={isEven ? 'bg-[#F7F8FD]' : ''}>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Avatar name={session.teacherName} src={session.teacherAvatar} size="sm" />
          <div className="text-right">
            <div className="font-semibold text-ink">{session.teacherName}</div>
            <div className="text-xs text-ink-soft">{session.subject}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="font-semibold" style={{ color: getSessionTypeColor(session.sessionType) }}>
          {session.sessionType}
        </span>
      </td>
      <td className="px-4 py-4 text-center text-ink">{session.packageTitle ?? '—'}</td>
      <td className="px-4 py-4 text-center text-ink">
        <div className="font-semibold">{session.day}</div>
        <div className="text-xs text-ink-soft">{session.date}</div>
      </td>
      <td className="px-4 py-4 text-center text-ink" dir="ltr">
        <div className="font-semibold">
          {session.time} {session.period}
        </div>
        <div className="text-xs text-ink-soft">
          {session.durationMinutes} {t('teacher.sessionMinutes')}
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <span
          className="rounded-pill px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
        >
          {t(SESSION_STATUS_LABEL_KEYS[status])}
        </span>
      </td>
      <td className="px-4 py-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {session.canJoin && (
            <button
              type="button"
              disabled={joinSession.isPending}
              onClick={() => handleSessionJoin(joinSession.mutateAsync, session.id)}
              className="rounded-xl border-2 border-primary bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {t('dashboard.join')}
            </button>
          )}
          {session.canReschedule && (
            <button
              type="button"
              onClick={() => onReschedule(session.id)}
              className="rounded-xl border border-primary bg-[#EDF0F5] px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10"
            >
              {t('dashboard.changeAppointment')}
            </button>
          )}
          {session.recordingUrl && (
            <a
              href={session.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-primary bg-[#EDF0F5] px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10"
            >
              {t('dashboard.watchRecording')}
            </a>
          )}
          {session.canCancel && (
            <button
              type="button"
              onClick={() => navigate('/contact')}
              title={t('dashboard.rescheduleModal.sessionNotice')}
              className="rounded-xl border border-[#FF383C] bg-[#FDF0F0] px-4 py-2 text-xs text-[#FF383C] hover:bg-[#FF383C]/10"
            >
              {t('dashboard.myPackages.cancel')}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function SessionsList({ sessions }) {
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

  if (sessions.length === 0) {
    return <EmptyState title={t('dashboard.sessionsPage.empty')} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {successMessage && (
        <div className="rounded-2xl bg-success-light px-4 py-3 text-sm font-medium text-success">{successMessage}</div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.sessionsTable.teacher')}</th>
              <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.sessionsTable.type')}</th>
              <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.sessionsTable.package')}</th>
              <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.sessionsTable.date')}</th>
              <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.sessionsTable.time')}</th>
              <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.sessionsTable.status')}</th>
              <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.sessionsTable.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sessions.map((session, i) => (
              <SessionRow
                key={session.id}
                session={session}
                isEven={i % 2 === 1}
                onReschedule={(id) => {
                  createRescheduleRequest.reset();
                  setReschedulingSessionId(id);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

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
