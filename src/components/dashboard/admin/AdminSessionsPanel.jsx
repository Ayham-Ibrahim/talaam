import { useRef, useState } from 'react';
import { ATTENDANCE_STYLES, NO_ATTENDANCE_STATUSES, attendanceState as attendanceStateFor } from '@/lib/sessionAttendance';
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  RotateCcw,
} from 'lucide-react';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { AdminRescheduleSessionModal } from './AdminRescheduleSessionModal';
import { TEACHER_SESSION_STATUS_STYLES } from '@/mocks/teacherDashboard.mock';
import { formatDateTime } from '@/lib/formatters';
import { useAdminSessions } from '@/hooks/useAdminSessions';
import { useT } from '@/hooks/useT';

const STATUS_FILTERS = ['upcoming', 'attended', 'cancelled', 'all'];
const PER_PAGE = 10;

/** YYYY-MM-DD لليوم (+ إزاحة أيام) بتوقيت المتصفح — نفس صيغة قيمة input[type=date] */
function localDay(offsetDays = 0, base = new Date()) {
  const date = new Date(base);
  date.setDate(date.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDay(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** اليوم السابق/التالي لتاريخ YYYY-MM-DD */
function shiftDay(ymd, offsetDays) {
  return localDay(offsetDays, parseDay(ymd));
}

function formatDayLabel(ymd) {
  return parseDay(ymd).toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * بداية ونهاية اليوم المحلي كـ ISO (UTC) — الباك اند يخزّن scheduled_at بتوقيت UTC،
 * فإرسال التاريخ مجرداً يُفسَّر كيوم UTC ويُسقط/يُضيف جلسات أطراف اليوم المحلي.
 */
function localDayRange(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return {
    from: new Date(y, m - 1, d, 0, 0, 0, 0).toISOString(),
    to: new Date(y, m - 1, d, 23, 59, 59, 999).toISOString(),
  };
}

/** الحضور مُشتق من سجل الانضمام — راجع attendanceState في lib/sessionAttendance */
const attendanceState = (session, log) => attendanceStateFor(session.scheduledAt, session.durationMin, log);

/** مجموعة أزرار متلاصقة يُختار منها واحد فقط */
function Segmented({ options, value, onChange, labelFor }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-pill bg-[#EDF0F5] p-1">
      {options.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-pill px-4 py-1.5 text-xs font-bold transition-colors ${
            value === key ? 'bg-primary text-white shadow-sm' : 'text-ink-soft hover:text-ink'
          }`}
        >
          {labelFor(key)}
        </button>
      ))}
    </div>
  );
}

function FilterRow({ icon: Icon, label, children }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="flex w-20 shrink-0 items-center gap-1.5 text-sm font-bold text-ink">
        <Icon size={16} className="text-primary" />
        {label}
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

const ICON_BUTTON =
  'flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-primary hover:text-primary';

/**
 * متنقّل الأيام: سهم السابق/التالي + اسم اليوم (ضغطه يفتح منتقي التاريخ الأصلي
 * للمتصفح). بلا يوم محدد (كل التواريخ) يعرض "اختر يوماً"، والأسهم تبدأ من اليوم.
 */
function DayNavigator({ day, onChange, t }) {
  const inputRef = useRef(null);

  const openPicker = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* RTL: "السابق" على اليمين، فسهمه يشير يميناً */}
      <button
        type="button"
        onClick={() => onChange(shiftDay(day || localDay(), -1))}
        className={ICON_BUTTON}
        title={t('dashboard.adminSessions.dateFilters.prevDay')}
      >
        <ChevronRight size={16} />
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={openPicker}
          className={`flex min-w-[210px] items-center justify-center gap-2 rounded-pill border px-4 py-2 text-sm font-bold transition-colors ${
            day ? 'border-primary bg-primary/5 text-primary' : 'border-line bg-white text-ink-soft hover:border-primary/50'
          }`}
        >
          <CalendarDays size={15} />
          {day ? formatDayLabel(day) : t('dashboard.adminSessions.dateFilters.pick')}
        </button>
        <input
          ref={inputRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={day}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        />
      </div>
      <button
        type="button"
        onClick={() => onChange(shiftDay(day || localDay(), 1))}
        className={ICON_BUTTON}
        title={t('dashboard.adminSessions.dateFilters.nextDay')}
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  );
}

const QUICK_DAYS = [
  { key: 'today', offset: 0 },
  { key: 'tomorrow', offset: 1 },
  { key: 'any', offset: null },
];

/** شريط فلاتر صفحة "الجلسات": اليوم، الحالة، اتجاه الترتيب */
function SessionsFilterBar({ day, onDayChange, status, onStatusChange, sort, onSortToggle, total, isFiltered, onReset, t }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-card sm:p-5">
      <FilterRow icon={CalendarDays} label={t('dashboard.adminSessions.dateFilters.label')}>
        <DayNavigator day={day} onChange={onDayChange} t={t} />
        <div className="flex flex-wrap gap-1.5">
          {QUICK_DAYS.map(({ key, offset }) => {
            const value = offset === null ? '' : localDay(offset);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onDayChange(value)}
                className={`rounded-pill border px-3 py-1.5 text-xs font-bold transition-colors ${
                  day === value
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-white text-ink-soft hover:border-primary/50 hover:text-ink'
                }`}
              >
                {t(`dashboard.adminSessions.dateFilters.${key}`)}
              </button>
            );
          })}
        </div>
      </FilterRow>

      <div className="border-t border-line" />

      <FilterRow icon={ListFilter} label={t('dashboard.adminSessions.statusLabel')}>
        <Segmented
          options={STATUS_FILTERS}
          value={status}
          onChange={onStatusChange}
          labelFor={(key) => t(`dashboard.adminSessions.filters.${key}`)}
        />
        <button
          type="button"
          onClick={onSortToggle}
          className="ms-auto inline-flex items-center gap-1.5 rounded-pill border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-primary hover:text-primary"
          title={t('dashboard.adminSessions.sort.toggle')}
        >
          {sort === 'asc' ? <ArrowUpNarrowWide size={15} /> : <ArrowDownWideNarrow size={15} />}
          {t(`dashboard.adminSessions.sort.${sort}`)}
        </button>
      </FilterRow>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-ink-soft">
        <span>
          {t('dashboard.adminSessions.total')}: <span className="font-bold text-ink">{total}</span>
        </span>
        {isFiltered && (
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1 font-bold text-primary hover:underline">
            <RotateCcw size={13} />
            {t('dashboard.adminSessions.resetFilters')}
          </button>
        )}
      </div>
    </div>
  );
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
 * المعلم (teacherId) وفي نافذة جلسات الطالب من جدول الطلاب (studentId)، وبلا أيٍّ
 * منهما في صفحة "كل الجلسات". عمود "الطرف الآخر" يعرض الطلاب في سياق المعلم،
 * والمعلم في سياق الطالب، وكليهما في الصفحة العامة.
 */
export function AdminSessionsPanel({ teacherId, studentId, all = false }) {
  const t = useT();
  // صفحة "الجلسات" تُفتح على جلسات اليوم بكل حالاتها من الأقدم للأحدث؛ ملف
  // المعلم/الطالب يبقى على القادمة بترتيب الـ service الافتراضي (sort غير محدد).
  const defaults = all ? { day: localDay(), status: 'all', sort: 'asc' } : { day: '', status: 'upcoming', sort: undefined };
  const [status, setStatus] = useState(defaults.status);
  const [day, setDay] = useState(defaults.day); // '' = كل التواريخ
  const [sort, setSort] = useState(defaults.sort);
  const [page, setPage] = useState(1);
  const [editingSession, setEditingSession] = useState(null);

  const range = day ? localDayRange(day) : {};
  const isFiltered = day !== defaults.day || status !== defaults.status || sort !== defaults.sort;

  const { data, isLoading, isError, refetch } = useAdminSessions({
    all,
    teacherId,
    studentId,
    status,
    ...range,
    sort,
    page,
    perPage: PER_PAGE,
  });
  const sessions = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;
  const isTeacherContext = Boolean(teacherId);
  const isGlobalContext = all;

  const changeStatus = (next) => {
    setStatus(next);
    setPage(1);
  };

  const changeDay = (next) => {
    setDay(next);
    setPage(1);
  };

  const toggleSort = () => {
    setSort((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  };

  const resetFilters = () => {
    setDay(defaults.day);
    setStatus(defaults.status);
    setSort(defaults.sort);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      {all ? (
        <SessionsFilterBar
          day={day}
          onDayChange={changeDay}
          status={status}
          onStatusChange={changeStatus}
          sort={sort}
          onSortToggle={toggleSort}
          total={data?.meta?.total ?? 0}
          isFiltered={isFiltered}
          onReset={resetFilters}
          t={t}
        />
      ) : (
        <div className="flex justify-end">
          <Segmented
            options={STATUS_FILTERS}
            value={status}
            onChange={changeStatus}
            labelFor={(key) => t(`dashboard.adminSessions.filters.${key}`)}
          />
        </div>
      )}

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : sessions.length === 0 ? (
        <EmptyState title={t('dashboard.adminSessions.empty')} />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminSessions.colSession')}</th>
                {isGlobalContext ? (
                  <>
                    <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminSessions.colTeacher')}</th>
                    <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminSessions.colStudents')}</th>
                  </>
                ) : (
                  <th className="px-4 py-4 text-right font-bold text-ink">
                    {t(isTeacherContext ? 'dashboard.adminSessions.colStudents' : 'dashboard.adminSessions.colTeacher')}
                  </th>
                )}
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
                    {isGlobalContext ? (
                      <>
                        <td className="px-4 py-4 text-right text-ink-soft">{session.teacherName || '—'}</td>
                        <td className="px-4 py-4 text-right text-ink-soft">{session.studentNames.join('، ') || '—'}</td>
                      </>
                    ) : (
                      <td className="px-4 py-4 text-right text-ink-soft">{counterpart || '—'}</td>
                    )}
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
