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
import { SessionJoinButton } from './SessionJoinButton';
import { useNow } from '@/hooks/useNow';
import { isSessionRowJoinable } from '@/services';
import { useT } from '@/hooks/useT';

// شبكة أعمدة ثابتة بالترتيب الطبيعي (RTL) كي تتطابق الأعمدة بين الترويسة وكل الصفوف:
// المعلم ← الحالة ← التاريخ ← الوقت ← العدّاد ← الإجراءات
const ROW_GRID_COLS =
  'md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.6fr)]';

function SessionRow({ session, showType, onReschedule }) {
  const t = useT();
  const navigate = useNavigate();
  const now = useNow();
  // بلا joinWindow (حجز غير فعّال، بيانات mock) يبقى على canJoin المحسوبة عند الجلب
  const canJoin = session.joinWindow ? isSessionRowJoinable(session, now) : session.canJoin;
  const status = session.status ?? 'upcoming';
  const statusStyle = SESSION_STATUS_STYLES[status];

  const actions = (
    <>
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
      {canJoin && (
        <SessionJoinButton
          session={session}
          className="inline-flex items-center justify-center rounded-xl border border-primary bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {t('dashboard.join')}
        </SessionJoinButton>
      )}
      {session.recordingUrl && (
        <a
          href={session.recordingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-primary bg-[#EDF0F5] px-4 py-2.5 text-sm text-primary hover:bg-primary/10"
        >
          {t('dashboard.watchRecording')}
        </a>
      )}
    </>
  );

  return (
    <div className={`grid grid-cols-2 items-center gap-x-4 gap-y-3 py-4 text-sm ${ROW_GRID_COLS}`}>
      <div className="col-span-2 flex min-w-0 items-center gap-2 md:col-span-1">
        <Avatar name={session.teacherName} src={session.teacherAvatar} size="md" />
        <div className="min-w-0 text-start">
          <div className="truncate font-semibold text-ink">{session.teacherName}</div>
          <div className="truncate text-ink-soft">{session.subject}</div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-1">
        <span
          className="rounded-pill px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
        >
          {t(SESSION_STATUS_LABEL_KEYS[status])}
        </span>
        {showType && (
          <span className="text-xs font-semibold" style={{ color: getSessionTypeColor(session.sessionType) }}>
            {session.sessionType}
          </span>
        )}
      </div>

      <div className="text-start">
        <div className="font-semibold text-ink">{session.day}</div>
        <div className="text-ink-soft">{session.date}</div>
      </div>

      <div className="text-start">
        <div className="font-semibold text-ink">
          {session.time} {session.period}
        </div>
        <div className="text-ink-soft">
          {session.durationMinutes} {t('teacher.sessionMinutes')}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {session.countdown && (
          <>
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
          </>
        )}
      </div>

      <div className="col-span-2 flex flex-wrap items-center justify-start gap-2 md:col-span-1">{actions}</div>
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
          <div className={`hidden gap-x-4 pt-4 pb-3 text-sm font-bold text-ink md:grid ${ROW_GRID_COLS}`}>
            <div className="text-start">{t('dashboard.myPackages.colTeacher')}</div>
            <div className="text-start">{t('dashboard.myPackages.colStatus')}</div>
            <div className="text-start">{t('dashboard.myPackages.colDate')}</div>
            <div className="text-start">{t('dashboard.myPackages.colTime')}</div>
            <div className="text-start">{t('dashboard.myPackages.colCountdown')}</div>
            <div className="text-start">{t('dashboard.myPackages.colActions')}</div>
          </div>
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
