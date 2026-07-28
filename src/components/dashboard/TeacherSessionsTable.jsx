import { useNavigate } from 'react-router-dom';
import { TEACHER_SESSION_TYPE_STYLES, TEACHER_SESSION_STATUS_STYLES } from '@/mocks/teacherDashboard.mock';
import { useT } from '@/hooks/useT';

export function TeacherSessionsTable({ sessions, onJoin }) {
  const t = useT();
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.teacherSessions.package')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherSessions.type')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherSessions.subject')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherSessions.date')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherSessions.time')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherSessions.status')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherSessions.action')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sessions.map((session, i) => {
            const typeStyle = TEACHER_SESSION_TYPE_STYLES[session.type];
            const statusStyle = TEACHER_SESSION_STATUS_STYLES[session.status];
            const canJoin = session.status === 'upcoming';
            return (
              <tr key={session.id} className={i % 2 === 1 ? 'bg-[#F7F8FD]' : ''}>
                <td className="px-4 py-4 text-right font-semibold text-ink">{session.packageTitle}</td>
                <td className="px-4 py-4 text-center font-semibold" style={{ color: typeStyle?.color }}>
                  {typeStyle?.label}
                </td>
                <td className="px-4 py-4 text-center text-ink-soft">{session.subject}</td>
                <td className="px-4 py-4 text-center text-ink">
                  <div className="font-semibold">{session.day}</div>
                  <div className="text-ink-soft">{session.date}</div>
                </td>
                <td className="px-4 py-4 text-center font-semibold text-ink">{session.time}</td>
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
