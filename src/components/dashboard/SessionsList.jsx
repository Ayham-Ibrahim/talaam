import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, EmptyState } from '@/components/ui';
import { getSessionTypeColor, SESSION_STATUS_STYLES, SESSION_STATUS_LABEL_KEYS } from '@/mocks/dashboard.mock';
import { RescheduleRequestModal } from './RescheduleRequestModal';
import { useCreateRescheduleRequest } from '@/hooks/useReschedule';
import { SessionJoinButton } from './SessionJoinButton';
import { SessionAttachmentsModal } from './SessionAttachmentsModal';
import { RescheduleResponseModal } from './RescheduleResponseModal';
import { MakeupRequestModal } from './MakeupRequestModal';
import { useNow } from '@/hooks/useNow';
import { isSessionRowJoinable } from '@/services';
import { useT } from '@/hooks/useT';

/**
 * جدول بدل بطاقات متفرقة — عمود الإجراءات هو الأخير في الـ DOM عمداً، فيظهر
 * في أقصى يسار الصف (اتجاه RTL: أول عنصر بالـ DOM يظهر يميناً)، بنفس تعامل
 * TeacherSessionsTable في لوحة المعلم.
 */
function SessionRow({ session, isEven, onReschedule, onShowAttachments, onRespond, onRequestMakeup }) {
  const t = useT();
  const navigate = useNavigate();
  const now = useNow();
  // بلا joinWindow (حجز غير فعّال، بيانات mock) يبقى على canJoin المحسوبة عند الجلب
  const canJoin = session.joinWindow ? isSessionRowJoinable(session, now) : session.canJoin;
  const status = session.status ?? 'upcoming';
  const statusStyle = SESSION_STATUS_STYLES[status];

  return (
    <tr className={isEven ? 'bg-[#F7F8FD]' : ''}>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-start gap-2">
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
      <td className="px-4 py-4 text-center font-semibold text-ink">{session.packageTitle ?? '—'}</td>
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
        {session.paymentDeadline && (
          <div className="mt-1 text-[11px] text-[#B7791F]">
            {t('dashboard.payBefore')} {session.paymentDeadline}
          </div>
        )}
      </td>
      <td className="px-4 py-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* الدفع يتم من بطاقة "باقات بانتظار الدفع" في الرئيسية (PendingPaymentsCard) */}
          {status === 'pending_payment' && (
            <button
              type="button"
              onClick={() => navigate('/dashboard/student')}
              className="rounded-xl border border-[#D48806] bg-[#D48806] px-4 py-2 text-xs font-medium text-white hover:opacity-90"
            >
              {t('dashboard.completePayment')}
            </button>
          )}
          {canJoin && (
            <SessionJoinButton
              session={session}
              className="inline-flex items-center justify-center rounded-xl border border-primary bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {t('dashboard.join')}
            </SessionJoinButton>
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
          {session.awaitingMyResponse && (
            <button
              type="button"
              onClick={() => onRespond(session)}
              className="rounded-xl border border-[#FF8D28] bg-[#FDF8F0] px-4 py-2 text-xs font-bold text-[#FF8D28] hover:bg-[#FF8D28]/10"
            >
              {t('dashboard.rescheduleResponse.button')}
            </button>
          )}
          {session.canRequestMakeup && (
            <button
              type="button"
              onClick={() => onRequestMakeup(session)}
              className="rounded-xl border border-primary bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-hover"
            >
              {t('dashboard.makeupRequest.button')}
            </button>
          )}
          {session.canViewAttachments && (
            <button
              type="button"
              onClick={() => onShowAttachments(session)}
              className="rounded-xl border border-primary bg-[#EDF0F5] px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10"
            >
              {t('dashboard.sessionAttachments.button')}
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
  const [attachmentsSession, setAttachmentsSession] = useState(null);
  const [respondingSession, setRespondingSession] = useState(null);
  const [makeupSession, setMakeupSession] = useState(null);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  };
  const createRescheduleRequest = useCreateRescheduleRequest();
  const activeSession = sessions.find((session) => session.id === reschedulingSessionId) ?? null;

  const handleConfirmReschedule = ({ proposedScheduledAt, reason }) => {
    createRescheduleRequest.mutate(
      { sessionId: reschedulingSessionId, proposedScheduledAt, reason },
      {
        onSuccess: (result) => {
          setReschedulingSessionId(null);
          setSuccessMessage(result?.message || t('dashboard.rescheduleModal.success'));
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
                onShowAttachments={setAttachmentsSession}
                onRespond={setRespondingSession}
                onRequestMakeup={setMakeupSession}
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

      {attachmentsSession && (
        <SessionAttachmentsModal
          sessionId={attachmentsSession.id}
          canUpload={attachmentsSession.canUploadAttachments}
          onClose={() => setAttachmentsSession(null)}
        />
      )}

      {respondingSession && (
        <RescheduleResponseModal
          request={respondingSession.pendingRescheduleRequest}
          onClose={() => setRespondingSession(null)}
          onDone={(message) => {
            setRespondingSession(null);
            showSuccess(message);
          }}
        />
      )}

      {makeupSession && (
        <MakeupRequestModal
          sessionId={makeupSession.id}
          missedScheduledAt={makeupSession.scheduledAt}
          onClose={() => setMakeupSession(null)}
          onDone={(message) => {
            setMakeupSession(null);
            showSuccess(message);
          }}
        />
      )}
    </div>
  );
}
