import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEACHER_SESSION_STATUS_STYLES } from '@/mocks/teacherDashboard.mock';
import { formatDateTime } from '@/lib/formatters';
import { canJoinSession, canRequestTeacherReschedule, teacherSessionDisplayStatus } from '@/services';
import { useNow } from '@/hooks/useNow';
import { useT } from '@/hooks/useT';
import { SessionJoinButton } from './SessionJoinButton';
import { CopyRatingLinkButton } from './CopyRatingLinkButton';
import { SessionAttachmentsModal } from './SessionAttachmentsModal';
import { RescheduleResponseModal } from './RescheduleResponseModal';
import { MakeupRequestModal } from './MakeupRequestModal';

export function TeacherSessionsTable({ sessions, onPostpone, onRespondDone }) {
  const t = useT();
  const navigate = useNavigate();
  const now = useNow();
  const [attachmentsSessionId, setAttachmentsSessionId] = useState(null);
  const [respondingRequest, setRespondingRequest] = useState(null);
  const [makeupSession, setMakeupSession] = useState(null);

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[920px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.teacherSessions.package')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherSessions.date')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherSessions.status')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherSessions.action')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sessions.map((session, i) => {
            const statusStyle = TEACHER_SESSION_STATUS_STYLES[teacherSessionDisplayStatus(session)];
            const title = session.booking?.package?.title ?? session.course?.title ?? '—';
            // نفس نافذة الانضمام في الباك اند (قبل الموعد بخمس دقائق حتى نهايته) — كان الزر
            // يظهر دائماً لأي جلسة scheduled ثم يرفضه الباك اند 422 قبل موعدها.
            const canJoin = canJoinSession(session, session.join_url_teacher, now);
            return (
              <tr key={session.id} className={i % 2 === 1 ? 'bg-[#F7F8FD]' : ''}>
                <td className="px-4 py-4 text-right font-semibold text-ink">{title}</td>
                <td className="px-4 py-4 text-center text-ink" dir="ltr">
                  {formatDateTime(session.scheduled_at)}
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className="rounded-pill px-4 py-1.5 text-xs font-medium"
                    style={{ backgroundColor: statusStyle?.bg, color: statusStyle?.color }}
                  >
                    {statusStyle?.label}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/teacher/sessions/${session.id}`)}
                      className="rounded-xl border border-primary bg-[#EDF0F5] px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10"
                    >
                      {t('dashboard.teacherSessions.details')}
                    </button>
                    {/* الطالب اقترح موعداً جديداً وينتظر رد المعلم (المسار التلقائي) */}
                    {session.pending_reschedule_request?.awaiting_my_response && (
                      <button
                        type="button"
                        onClick={() => setRespondingRequest(session.pending_reschedule_request)}
                        className="rounded-xl border border-[#FF8D28] bg-[#FDF8F0] px-4 py-2 text-xs font-bold text-[#FF8D28] hover:bg-[#FF8D28]/10"
                      >
                        {t('dashboard.rescheduleResponse.button')}
                      </button>
                    )}
                    {/* جلسة فائتة غاب عنها المعلم — يقترح موعد التعويضية والطالب يوافق */}
                    {session.can_request_makeup && (
                      <button
                        type="button"
                        onClick={() => setMakeupSession(session)}
                        className="rounded-xl border border-primary bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-hover"
                      >
                        {t('dashboard.makeupRequest.button')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setAttachmentsSessionId(session.id)}
                      className="rounded-xl border border-primary bg-[#EDF0F5] px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10"
                    >
                      {t('dashboard.sessionAttachments.button')}
                    </button>
                    {canJoin && (
                      <SessionJoinButton
                        session={session}
                        className="inline-flex items-center justify-center rounded-xl border border-primary bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                      >
                        {t('dashboard.teacherSessions.join')}
                      </SessionJoinButton>
                    )}
                    {/* بعد بدء الجلسة ودخول المعلم والطالب — الباك يرسل المسار حينها فقط */}
                    <CopyRatingLinkButton path={session.quality_rating_path} compact />
                    {onPostpone && canRequestTeacherReschedule(session) && (
                      <button
                        type="button"
                        onClick={() => onPostpone(session)}
                        className="rounded-xl border border-[#FF8D28] bg-[#FDF8F0] px-4 py-2 text-xs font-medium text-[#FF8D28] hover:bg-[#FF8D28]/10"
                      >
                        {t('dashboard.teacherSessions.postpone')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {attachmentsSessionId && (
        <SessionAttachmentsModal sessionId={attachmentsSessionId} onClose={() => setAttachmentsSessionId(null)} />
      )}

      {respondingRequest && (
        <RescheduleResponseModal
          request={respondingRequest}
          onClose={() => setRespondingRequest(null)}
          onDone={(message) => {
            setRespondingRequest(null);
            onRespondDone?.(message);
          }}
        />
      )}

      {makeupSession && (
        <MakeupRequestModal
          sessionId={makeupSession.id}
          missedScheduledAt={makeupSession.scheduled_at}
          onClose={() => setMakeupSession(null)}
          onDone={(message) => {
            setMakeupSession(null);
            onRespondDone?.(message);
          }}
        />
      )}
    </div>
  );
}
