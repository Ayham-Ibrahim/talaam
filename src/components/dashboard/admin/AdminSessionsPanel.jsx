import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { AdminRescheduleSessionModal } from './AdminRescheduleSessionModal';
import { TEACHER_SESSION_STATUS_STYLES } from '@/mocks/teacherDashboard.mock';
import { formatDateTime } from '@/lib/formatters';
import { useAdminSessions } from '@/hooks/useAdminSessions';
import { useT } from '@/hooks/useT';

const STATUS_FILTERS = ['upcoming', 'attended', 'cancelled', 'all'];
const PER_PAGE = 10;

const ATTENDANCE_STYLES = {
  joined: { bg: '#F0FDF3', color: '#34C759' },
  notJoined: { bg: '#FDEFF2', color: '#B00852' },
  notJoinedYet: { bg: '#F2F2F7', color: '#6B7280' },
};

/** جلسات لم يكن الانضمام إليها متاحاً أصلاً — لا معنى لعرض حضور فيها */
const NO_ATTENDANCE_STATUSES = ['cancelled', 'suspended'];

/**
 * الحضور مُشتق من سجل الانضمام (زر "انضم" عبر المنصة) فقط: دخل → حضر، لم يدخل وقد
 * انتهت الجلسة → لم يحضر، لم يدخل والجلسة جارية → لم يدخل بعد، قبل موعدها → لا شيء.
 */
function attendanceState(session, log) {
  if (log) return 'joined';
  const startsAt = session.scheduledAt ? new Date(session.scheduledAt).getTime() : NaN;
  if (!Number.isFinite(startsAt) || Date.now() < startsAt) return null;
  return Date.now() > startsAt + (session.durationMin ?? 0) * 60_000 ? 'notJoined' : 'notJoinedYet';
}

function AttendanceBadge({ state, joinedAt, t }) {
  const style = ATTENDANCE_STYLES[state];
  return (
    <span
      className="rounded-pill px-3 py-1 text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.color }}
      title={joinedAt ? `${t('dashboard.adminSessions.attendance.joinedAt')}: ${formatDateTime(joinedAt)}` : undefined}
    >
      {t(`dashboard.adminSessions.attendance.${state}`)}
    </span>
  );
}

function AttendanceCell({ session, studentId, t }) {
  // بلا رابط انضمام لم يكن الدخول ممكناً، وقبل بدء التسجيل لا سجل أصلاً — كلاهما ليس غياباً
  if (NO_ATTENDANCE_STATUSES.includes(session.status) || !session.hasJoinLink || !session.joinTracked) {
    return <span className="text-xs text-ink-soft">—</span>;
  }

  const teacherLog = session.joinLogs.find((log) => log.role === 'teacher');
  const students = studentId
    ? session.students.filter((s) => String(s.studentId) === String(studentId))
    : session.students;

  const rows = [
    { key: 'teacher', label: t('dashboard.adminSessions.attendance.teacher'), log: teacherLog },
    ...students.map((s) => ({
      key: `student-${s.studentId}`,
      label: s.name,
      log: session.joinLogs.find((log) => log.role === 'student' && String(log.studentId) === String(s.studentId)),
    })),
  ]
    .map((row) => ({ ...row, state: attendanceState(session, row.log) }))
    .filter((row) => row.state);

  if (rows.length === 0) {
    return <span className="text-xs text-ink-soft">—</span>;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-1.5">
          <span className="text-xs text-ink-soft">{row.label}</span>
          <AttendanceBadge state={row.state} joinedAt={row.log?.firstJoinedAt} t={t} />
        </div>
      ))}
    </div>
  );
}

/**
 * جدول جلسات لدى الأدمن مع زر "تعديل الموعد" — يُستخدم في تبويب "الجلسات" بملف
 * المعلم (teacherId) وفي نافذة جلسات الطالب من جدول الطلاب (studentId). عمود
 * "الطرف الآخر" يعرض الطلاب في سياق المعلم، والمعلم في سياق الطالب.
 */
export function AdminSessionsPanel({ teacherId, studentId }) {
  const t = useT();
  const [status, setStatus] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [editingSession, setEditingSession] = useState(null);

  const { data, isLoading, isError, refetch } = useAdminSessions({ teacherId, studentId, status, page, perPage: PER_PAGE });
  const sessions = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;
  const isTeacherContext = Boolean(teacherId);

  const changeStatus = (next) => {
    setStatus(next);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-end gap-2">
        {STATUS_FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => changeStatus(key)}
            className={`rounded-pill px-4 py-1.5 text-xs font-bold transition-colors ${
              status === key ? 'bg-primary text-white' : 'bg-[#EDF0F5] text-ink-soft hover:text-ink'
            }`}
          >
            {t(`dashboard.adminSessions.filters.${key}`)}
          </button>
        ))}
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : sessions.length === 0 ? (
        <EmptyState title={t('dashboard.adminSessions.empty')} />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminSessions.colSession')}</th>
                <th className="px-4 py-4 text-right font-bold text-ink">
                  {t(isTeacherContext ? 'dashboard.adminSessions.colStudents' : 'dashboard.adminSessions.colTeacher')}
                </th>
                <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.adminSessions.colTime')}</th>
                <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.adminSessions.colStatus')}</th>
                <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.adminSessions.colAttendance')}</th>
                <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.adminSessions.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sessions.map((session, i) => {
                const statusStyle = TEACHER_SESSION_STATUS_STYLES[session.status];
                const counterpart = isTeacherContext ? session.studentNames.join('، ') : session.teacherName;
                return (
                  <tr key={session.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                    <td className="px-4 py-4 text-right">
                      <div className="font-semibold text-ink">{session.title ?? '—'}</div>
                      <div className="mt-0.5 flex flex-wrap justify-end gap-1.5 text-xs text-ink-soft">
                        {session.category && <span>{t(`dashboard.adminSessions.category.${session.category}`)}</span>}
                        {session.isMakeup && <span className="text-primary">{t('dashboard.adminSessions.makeup')}</span>}
                        {!session.hasJoinLink && session.status === 'scheduled' && (
                          <span className="text-accent-pink">{t('dashboard.adminSessions.noJoinLink')}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-ink-soft">{counterpart || '—'}</td>
                    <td className="px-4 py-4 text-center text-ink">
                      <div dir="ltr">{formatDateTime(session.scheduledAt)}</div>
                      {session.originalScheduledAt && (
                        <div className="mt-0.5 text-xs text-ink-soft">
                          {t('dashboard.adminSessions.originalTime')}: <span dir="ltr">{formatDateTime(session.originalScheduledAt)}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className="rounded-pill px-3 py-1 text-xs font-medium"
                        style={{ backgroundColor: statusStyle?.bg, color: statusStyle?.color }}
                      >
                        {statusStyle?.label ?? session.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <AttendanceCell session={session} studentId={studentId} t={t} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      {session.canReschedule ? (
                        <button
                          type="button"
                          onClick={() => setEditingSession(session)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-primary bg-[#EDF0F5] px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10"
                        >
                          <CalendarClock size={14} />
                          {t('dashboard.adminSessions.reschedule')}
                        </button>
                      ) : (
                        <span className="text-xs text-ink-soft">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {editingSession && <AdminRescheduleSessionModal session={editingSession} onClose={() => setEditingSession(null)} />}
    </div>
  );
}
