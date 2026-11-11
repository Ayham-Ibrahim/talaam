import { useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Activity, BookOpen, ChevronLeft, ChevronRight, Download, FileSpreadsheet, Search, UserX, Users } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useExportStudentsReport, useStudentsReport } from '@/hooks/useReports';
import { formatDate, formatNumber } from '@/lib/formatters';
import { saveBlob } from '@/lib/download';
import { useT } from '@/hooks/useT';

/**
 * التقارير والإحصاءات عن الطلاب (أدمن فقط) — كل الأرقام من StudentsReportService بالباك:
 * من انتهت باقاتهم ولم يجددوا، توزيع المناهج ونوع التعليم، والنشطون أسبوعياً حسب المرحلة
 * (الأسبوع يبدأ السبت، والتنقل بين الأسابيع يعيد الطلب بـ week_start).
 */
const EMPTY_WEEKLY = { weekStart: null, weekEnd: null, totalActive: 0, previousWeekTotalActive: 0, rows: [] };

const inputClass =
  'rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const TABS = ['expired', 'curricula', 'weekly'];

const rowClass = (i) => (i % 2 === 1 ? 'bg-[#FAFBFD]' : '');
const cell = 'px-4 py-3 text-ink-soft';
const percentOf = (part, total) => (total ? Math.round((part / total) * 1000) / 10 : 0);

/** إزاحة تاريخ YYYY-MM-DD بعدد أيام — بتوقيت UTC كي لا ينزاح اليوم بفرق المنطقة الزمنية */
function shiftDate(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function StatCard({ icon: Icon, label, value, hint, bg, color }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
      <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
        <Icon size={28} style={{ color }} />
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-[#2D2D2D]">{label}</div>
        <div className="text-2xl font-bold text-[#2D2D2D]">{value}</div>
        {hint && <div className="text-xs text-ink-soft">{hint}</div>}
      </div>
    </div>
  );
}

function SectionHeader({ title, hint, onExport, exporting, children }) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-right">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <button
          type="button"
          disabled={exporting}
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-line/30 disabled:opacity-50"
        >
          <FileSpreadsheet size={16} className="text-success" />
          {exporting ? t('dashboard.studentsReport.exporting') : t('dashboard.studentsReport.exportTable')}
        </button>
      </div>
    </div>
  );
}

function Table({ columns, minWidth, children }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-line text-right">
            {columns.map((col) => (
              <th key={col} className="whitespace-nowrap px-4 py-3 font-bold text-ink">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

function ShareBar({ value, color = '#2F80ED' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-28 overflow-hidden rounded-full bg-line/60">
        <div className="h-full rounded-full" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold text-ink">{formatNumber(value)}%</span>
    </div>
  );
}

function ChangeBadge({ current, previous }) {
  const diff = current - previous;
  if (diff === 0) return <span className="text-xs text-ink-soft">—</span>;
  const up = diff > 0;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${up ? 'bg-[#E3F5EC] text-success' : 'bg-[#FDECEC] text-red-600'}`}>
      {up ? '▲' : '▼'} {formatNumber(Math.abs(diff))}
    </span>
  );
}

export function StudentsReportPage() {
  const t = useT();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('expired');
  const [weekStart, setWeekStart] = useState('');
  const [search, setSearch] = useState('');
  // أي تصدير قيد التنفيذ: 'all' للتقرير الشامل أو اسم الجدول
  const [exportingSheet, setExportingSheet] = useState(null);

  const { data, isLoading, isError, refetch, isFetching } = useStudentsReport({ weekStart: weekStart || undefined });
  const exportReport = useExportStudentsReport();

  const expired = data?.expiredWithoutRenewal ?? [];
  const curricula = data?.curricula ?? [];
  const educationTypes = data?.educationTypes ?? [];
  const weekly = data?.weeklyActive ?? EMPTY_WEEKLY;
  const studentsCount = data?.totals?.studentsCount ?? 0;

  const filteredExpired = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return expired;
    return expired.filter((row) =>
      [row.name, row.email, row.phone, row.guardianPhone].some((v) => v && String(v).toLowerCase().includes(q)),
    );
  }, [expired, search]);

  if (!user) return <Navigate to="/login" replace />;

  const L = (key) => t(`dashboard.studentsReport.${key}`);
  const educationLabel = (type) => L(`educationTypes.${type ?? 'unknown'}`);
  const schoolTotal = curricula.reduce((sum, row) => sum + row.studentsCount, 0);
  const currentWeekStart = weekly.weekStart;
  // الأسبوع الحالي = يحوي اليوم — الرجوع ثم التقدّم يصل إليه بتاريخ صريح لا بـ '' فلا يكفي فحص weekStart وحده
  const todayIso = new Date().toISOString().slice(0, 10);
  const isCurrentWeek = !weekStart || (weekly.weekEnd ?? '') >= todayIso;

  const handleExport = async (sheet) => {
    setExportingSheet(sheet ?? 'all');
    try {
      const blob = await exportReport.mutateAsync({ weekStart: weekStart || undefined, sheet });
      saveBlob(blob, sheet ? `students-report-${sheet}.xlsx` : 'students-report.xlsx');
    } catch (err) {
      window.alert(err?.message || L('exportFailed'));
    } finally {
      setExportingSheet(null);
    }
  };

  const tabCounts = { expired: expired.length, curricula: curricula.length, weekly: weekly.totalActive };

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{L('title')}</h1>
            <p className="mt-1 max-w-3xl text-sm text-ink-soft">{L('subtitle')}</p>
          </div>
          <button
            type="button"
            disabled={exportReport.isPending}
            onClick={() => handleExport()}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-line/30 disabled:opacity-50"
          >
            <Download size={16} />
            {exportingSheet === 'all' ? L('exporting') : L('exportExcel')}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label={L('stats.totalStudents')} value={formatNumber(studentsCount)} bg="#EDF0F5" color="#4B6898" />
          <StatCard icon={UserX} label={L('stats.expired')} value={formatNumber(expired.length)} bg="#FDECEC" color="#D64545" />
          <StatCard
            icon={Activity}
            label={L('stats.weeklyActive')}
            value={formatNumber(weekly.totalActive)}
            hint={`${L('stats.previousWeek')}: ${formatNumber(weekly.previousWeekTotalActive)}`}
            bg="#E3F5EC"
            color="#2E9E6B"
          />
          <StatCard
            icon={BookOpen}
            label={L('stats.curricula')}
            value={formatNumber(curricula.filter((c) => c.studentsCount > 0).length)}
            bg="#F0FAFD"
            color="#2F80ED"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              {L(`tabs.${tab}`)}
              {!isLoading && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab ? 'bg-primary/10 text-primary' : 'bg-line/50 text-ink-soft'}`}>
                  {formatNumber(tabCounts[tab])}
                </span>
              )}
            </button>
          ))}
        </div>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'expired' && (
              <section className="flex flex-col gap-3">
                <SectionHeader
                  title={L('expired.title')}
                  hint={L('expired.hint')}
                  onExport={() => handleExport('expired')}
                  exporting={exportingSheet === 'expired'}
                >
                  <div className="relative">
                    <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={L('expired.search')}
                      className={`${inputClass} w-64 pr-9`}
                    />
                  </div>
                </SectionHeader>
                {filteredExpired.length === 0 ? (
                  <EmptyState title={L('expired.empty')} />
                ) : (
                  <Table
                    minWidth={1150}
                    columns={['student', 'contact', 'stage', 'lastPackage', 'teacher', 'reason', 'endedAt', 'daysSince', 'count'].map((c) =>
                      L(`expired.cols.${c}`),
                    )}
                  >
                    {filteredExpired.map((row, i) => (
                      <tr key={row.studentId} className={rowClass(i)}>
                        <td className="px-4 py-3">
                          <Link to={`/dashboard/admin/students/${row.studentId}`} className="font-semibold text-primary hover:underline">
                            {row.name ?? `#${row.studentId}`}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-soft">
                          <div dir="ltr" className="text-right">{row.phone ?? '—'}</div>
                          <div className="text-ink-soft/80">{row.email}</div>
                          {row.guardianPhone && (
                            <div>
                              {L('expired.guardian')}: <span dir="ltr">{row.guardianPhone}</span>
                            </div>
                          )}
                        </td>
                        <td className={cell}>
                          <div>{row.stage ?? '—'}</div>
                          {row.curriculum && <div className="text-xs">{row.curriculum}</div>}
                        </td>
                        <td className="px-4 py-3 text-ink">{row.lastPackage ?? '—'}</td>
                        <td className={cell}>{row.lastTeacher ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${
                              row.endReason === 'sessions_finished' ? 'bg-[#F0FAFD] text-[#2F80ED]' : 'bg-[#FEF3E2] text-[#B7791F]'
                            }`}
                          >
                            {L(`expired.reasons.${row.endReason}`)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{formatDate(row.endedAt)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">
                          {row.daysSinceEnded === 0 ? L('expired.today') : `${formatNumber(row.daysSinceEnded)} ${L('expired.days')}`}
                        </td>
                        <td className={cell}>{formatNumber(row.endedPackagesCount)}</td>
                      </tr>
                    ))}
                  </Table>
                )}
              </section>
            )}

            {activeTab === 'curricula' && (
              <div className="flex flex-col gap-6">
                <section className="flex flex-col gap-3">
                  <SectionHeader
                    title={L('curricula.title')}
                    hint={L('curricula.hint')}
                    onExport={() => handleExport('curricula')}
                    exporting={exportingSheet === 'curricula'}
                  />
                  <Table minWidth={560} columns={['curriculum', 'count', 'share'].map((c) => L(`curricula.cols.${c}`))}>
                    {curricula.map((row, i) => (
                      <tr key={row.curriculumId ?? 'none'} className={rowClass(i)}>
                        <td className="px-4 py-3 font-semibold text-ink">{row.name ?? L('curricula.unassigned')}</td>
                        <td className={cell}>{formatNumber(row.studentsCount)}</td>
                        <td className="px-4 py-3">
                          <ShareBar value={percentOf(row.studentsCount, schoolTotal)} />
                        </td>
                      </tr>
                    ))}
                  </Table>
                </section>

                <section className="flex flex-col gap-3">
                  <h2 className="text-right text-base font-bold text-ink">{L('curricula.educationTitle')}</h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {educationTypes.map((row) => (
                      <div key={row.type ?? 'unknown'} className="flex flex-col gap-2 rounded-2xl bg-white p-4 text-right shadow-card">
                        <div className="text-sm font-bold text-ink">{educationLabel(row.type)}</div>
                        <div className="text-2xl font-bold text-ink">
                          {formatNumber(row.studentsCount)} <span className="text-sm font-medium text-ink-soft">{L('curricula.students')}</span>
                        </div>
                        <ShareBar value={percentOf(row.studentsCount, studentsCount)} color="#2E9E6B" />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'weekly' && (
              <section className="flex flex-col gap-3">
                <SectionHeader
                  title={L('weekly.title')}
                  hint={L('weekly.hint')}
                  onExport={() => handleExport('weekly')}
                  exporting={exportingSheet === 'weekly'}
                >
                  <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1">
                    <button
                      type="button"
                      title={L('weekly.prevWeek')}
                      disabled={!currentWeekStart || isFetching}
                      onClick={() => setWeekStart(shiftDate(currentWeekStart, -7))}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-line/40 disabled:opacity-40"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <span className="whitespace-nowrap px-2 text-sm font-semibold text-ink">
                      {currentWeekStart ? `${formatDate(weekly.weekStart)} – ${formatDate(weekly.weekEnd)}` : '—'}
                    </span>
                    <button
                      type="button"
                      title={L('weekly.nextWeek')}
                      disabled={isCurrentWeek || isFetching}
                      onClick={() => setWeekStart(shiftDate(currentWeekStart, 13) >= todayIso ? '' : shiftDate(currentWeekStart, 7))}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-line/40 disabled:opacity-40"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  </div>
                  {!isCurrentWeek && (
                    <button
                      type="button"
                      onClick={() => setWeekStart('')}
                      className="rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink-soft hover:bg-line/30"
                    >
                      {L('weekly.thisWeek')}
                    </button>
                  )}
                </SectionHeader>
                <Table
                  minWidth={900}
                  columns={['stage', 'educationType', 'total', 'active', 'rate', 'previous', 'change'].map((c) => L(`weekly.cols.${c}`))}
                >
                  {weekly.rows.map((row, i) => (
                    <tr key={row.key} className={rowClass(i)}>
                      <td className="px-4 py-3 font-semibold text-ink">{row.name ?? L('weekly.noStage')}</td>
                      <td className={cell}>{educationLabel(row.educationType)}</td>
                      <td className={cell}>{formatNumber(row.totalStudents)}</td>
                      <td className="px-4 py-3 font-semibold text-success">{formatNumber(row.activeStudents)}</td>
                      <td className="px-4 py-3">
                        <ShareBar value={percentOf(row.activeStudents, row.totalStudents)} color="#2E9E6B" />
                      </td>
                      <td className={cell}>{formatNumber(row.previousWeekActive)}</td>
                      <td className="px-4 py-3">
                        <ChangeBadge current={row.activeStudents} previous={row.previousWeekActive} />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#E8ECF5] font-bold">
                    <td className="px-4 py-3 text-ink" colSpan={2}>
                      {L('weekly.weekOf')} {formatDate(weekly.weekStart)}
                    </td>
                    <td className="px-4 py-3 text-ink">{formatNumber(studentsCount)}</td>
                    <td className="px-4 py-3 text-success">{formatNumber(weekly.totalActive)}</td>
                    <td className="px-4 py-3">
                      <ShareBar value={percentOf(weekly.totalActive, studentsCount)} color="#2E9E6B" />
                    </td>
                    <td className="px-4 py-3 text-ink">{formatNumber(weekly.previousWeekTotalActive)}</td>
                    <td className="px-4 py-3">
                      <ChangeBadge current={weekly.totalActive} previous={weekly.previousWeekTotalActive} />
                    </td>
                  </tr>
                </Table>
              </section>
            )}
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
