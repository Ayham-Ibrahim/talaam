import { useNavigate } from 'react-router-dom';
import { TEACHER_SESSION_STATUS_STYLES } from '@/mocks/teacherDashboard.mock';
import { formatDateTime } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function TeacherSessionsTable({ sessions, onJoin }) {
  const t = useT();
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[820px] text-sm">
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
            const statusStyle = TEACHER_SESSION_STATUS_STYLES[session.status];
            const title = session.booking?.package?.title ?? session.course?.title ?? '—';
            const canJoin = (session.status === 'scheduled' || session.status === 'active') && session.join_url_teacher;
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
                    {canJoin && (
                      <button
                        type="button"
                        onClick={() => onJoin?.(session)}
                        className="rounded-xl border-2 border-primary bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-hover"
                      >
                        {t('dashboard.teacherSessions.join')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
