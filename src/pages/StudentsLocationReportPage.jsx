import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Banknote, Download, MapPinOff, PlayCircle, RotateCcw, UserCheck, Users } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { ShareBar, StatCard, Table, cell, percentOf, rowClass } from '@/components/dashboard/admin/ReportWidgets';
import { useLocationOptions } from '@/components/dashboard/CountryRegionFields';
import { Pagination } from '@/components/dashboard/Pagination';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useExportStudentsLocationReport, useStudentsLocationReport, useStudentsLocationStudents } from '@/hooks/useReports';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { formatNumber, formatPrice } from '@/lib/formatters';
import { saveBlob } from '@/lib/download';
import { useT } from '@/hooks/useT';

/**
 * تقرير التسويق: الطلاب حسب الموقع (دولة ← ولاية) × المنهج — StudentsLocationReportService
 * بالباك. لكل شريحة: العدد، من دفع (نسبة التحويل)، من له باقة جارية، والإيراد. الضغط على
 * صف أو خلية يضيّق الفلاتر عليها ويفتح قائمة طلابها، فيُصدَّر منها ملف للتواصل مع الشريحة.
 */
const EMPTY_FILTERS = { countryId: '', regionId: '', curriculumId: '', educationType: '', from: '', to: '' };
const TABS = ['location', 'curriculum', 'matrix', 'students'];
const EDUCATION_TYPES = ['school', 'university', 'training'];

const inputClass =
  'w-full rounded-btn border border-line bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

/** شدّة لون خلية المصفوفة بنسبتها لأكبر خلية — درجات الأزرق الأساسي نفسه */
function heatStyle(value, max) {
  if (!value || !max) return undefined;
  const ratio = value / max;
  return { background: `rgba(59, 89, 152, ${0.08 + ratio * 0.62})`, color: ratio > 0.55 ? '#fff' : undefined };
}

export function StudentsLocationReportPage() {
  const t = useT();
  const L = (key) => t(`dashboard.locationReport.${key}`);
  const { user } = useAuth();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [activeTab, setActiveTab] = useState('location');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch, isFetching } = useStudentsLocationReport(filters);
  const students = useStudentsLocationStudents(filters, page, activeTab === 'students');
  const exportReport = useExportStudentsLocationReport();
  const location = useLocationOptions(filters.countryId, filters.regionId);
  const { data: curricula = [] } = useTaxonomyList('curricula');

  if (!user) return <Navigate to="/login" replace />;

  const totals = data?.totals ?? {};
  const byLocation = data?.byLocation ?? [];
  const byCurriculum = data?.byCurriculum ?? [];
  const matrix = data?.matrix ?? { columns: [], rows: [] };
  const matrixMax = Math.max(0, ...matrix.rows.flatMap((r) => r.counts));
  const hasFilters = Object.values(filters).some(Boolean);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, ...(key === 'countryId' ? { regionId: '' } : {}) }));
    setPage(1);
  };

  /** تضييق الفلاتر على شريحة ثم عرض طلابها */
  const drillDown = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
    setActiveTab('students');
  };
  const locationPatch = (row) => ({ countryId: row.countryId ?? '', regionId: row.regionId ?? '' });

  const locationLabel = (row) =>
    row.countryId ? [row.country, row.region].filter(Boolean).join(' · ') : L('unknownLocation');
  const curriculumLabel = (name) => name ?? L('noCurriculum');

  const handleExport = () =>
    exportReport.mutate(filters, { onSuccess: (blob) => saveBlob(blob, 'students-location-report.xlsx') });

  const metricCells = (row) => (
    <>
      <td className={cell}>{formatNumber(row.students)}</td>
      <td className="px-4 py-3">
        <ShareBar value={percentOf(row.students, totals.students)} />
      </td>
      <td className={cell}>{formatNumber(row.paying)}</td>
      <td className="px-4 py-3">
        <ShareBar value={row.conversionRate} color="#2E9E6B" />
      </td>
      <td className={cell}>{formatNumber(row.running)}</td>
      <td className={cell}>{formatPrice(formatNumber(row.revenue), 'AED')}</td>
    </>
  );
  const metricColumns = ['students', 'share', 'paying', 'conversion', 'running', 'revenue'].map((c) => L(`cols.${c}`));

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{L('title')}</h1>
            <p className="mt-1 text-sm text-ink-soft">{L('subtitle')}</p>
          </div>
          <button
            type="button"
            disabled={exportReport.isPending}
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            <Download size={16} />
            {exportReport.isPending ? L('exporting') : L('export')}
          </button>
        </div>

        {/* الفلاتر */}
        <div className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-3">
          <SmoothSelect
            label={L('filters.country')}
            value={filters.countryId}
            onChange={(v) => setFilter('countryId', v)}
            options={location.countryOptions}
            placeholder={L('filters.all')}
          />
          <SmoothSelect
            label={L('filters.region')}
            value={filters.regionId}
            onChange={(v) => setFilter('regionId', v)}
            options={location.regionOptions}
            placeholder={filters.countryId ? L('filters.all') : L('filters.pickCountryFirst')}
          />
          <SmoothSelect
            label={L('filters.curriculum')}
            value={filters.curriculumId}
            onChange={(v) => setFilter('curriculumId', v)}
            options={curricula.map((c) => ({ value: c.id, label: c.name_ar }))}
            placeholder={L('filters.all')}
          />
          <SmoothSelect
            label={L('filters.educationType')}
            value={filters.educationType}
            onChange={(v) => setFilter('educationType', v)}
            options={EDUCATION_TYPES.map((v) => ({ value: v, label: t(`dashboard.adminStudents.educationType.${v}`) }))}
            placeholder={L('filters.all')}
          />
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{L('filters.from')}</span>
            <input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => setFilter('from', e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{L('filters.to')}</span>
            <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => setFilter('to', e.target.value)} className={inputClass} />
          </label>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setPage(1);
              }}
              className="flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:opacity-70"
            >
              <RotateCcw size={14} />
              {L('filters.reset')}
            </button>
          )}
        </div>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 ${isFetching ? 'opacity-60' : ''}`}>
              <StatCard icon={Users} label={L('stats.students')} value={formatNumber(totals.students ?? 0)} bg="#EDF0F5" color="#4B6898" />
              <StatCard
                icon={UserCheck}
                label={L('stats.paying')}
                value={formatNumber(totals.paying ?? 0)}
                hint={`${L('stats.conversion')} ${formatNumber(totals.conversionRate ?? 0)}%`}
                bg="#E3F5EC"
                color="#2E9E6B"
              />
              <StatCard icon={PlayCircle} label={L('stats.running')} value={formatNumber(totals.running ?? 0)} bg="#EAF2FD" color="#2F80ED" />
              <StatCard icon={Banknote} label={L('stats.revenue')} value={formatPrice(formatNumber(totals.revenue ?? 0), 'AED')} bg="#FFF4E0" color="#B7791F" />
              <StatCard
                icon={MapPinOff}
                label={L('stats.withoutLocation')}
                value={formatNumber(totals.withoutLocation ?? 0)}
                hint={L('stats.withoutLocationHint')}
                bg="#FDECEC"
                color="#D64545"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab ? 'bg-primary text-white' : 'bg-white text-ink shadow-card hover:bg-line/30'
                  }`}
                >
                  {L(`tabs.${tab}`)}
                </button>
              ))}
            </div>

            {activeTab !== 'students' && totals.students === 0 ? (
              <EmptyState title={L('empty')} />
            ) : activeTab === 'location' ? (
              <Table minWidth={860} columns={[L('cols.location'), ...metricColumns, '']}>
                {byLocation.map((row, i) => (
                  <tr key={`${row.countryId}:${row.regionId}`} className={rowClass(i)}>
                    <td className="px-4 py-3 font-semibold text-ink">{locationLabel(row)}</td>
                    {metricCells(row)}
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => drillDown(locationPatch(row))} className="whitespace-nowrap text-primary hover:opacity-70">
                        {L('viewStudents')}
                      </button>
                    </td>
                  </tr>
                ))}
              </Table>
            ) : activeTab === 'curriculum' ? (
              <Table minWidth={860} columns={[L('cols.curriculum'), ...metricColumns, '']}>
                {byCurriculum.map((row, i) => (
                  <tr key={row.curriculumId ?? 'none'} className={rowClass(i)}>
                    <td className="px-4 py-3 font-semibold text-ink">{curriculumLabel(row.curriculum)}</td>
                    {metricCells(row)}
                    <td className="px-4 py-3">
                      {row.curriculumId && (
                        <button
                          type="button"
                          onClick={() => drillDown({ curriculumId: row.curriculumId })}
                          className="whitespace-nowrap text-primary hover:opacity-70"
                        >
                          {L('viewStudents')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            ) : activeTab === 'matrix' ? (
              <div className="flex flex-col gap-2">
                <p className="text-right text-xs text-ink-soft">{L('matrixHint')}</p>
                <Table
                  minWidth={Math.max(560, 220 + matrix.columns.length * 120)}
                  columns={[L('cols.location'), ...matrix.columns.map((c) => curriculumLabel(c.curriculum)), L('cols.total')]}
                >
                  {matrix.rows.map((row, i) => (
                    <tr key={`${row.countryId}:${row.regionId}`} className={rowClass(i)}>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">{locationLabel(row)}</td>
                      {row.counts.map((count, c) => {
                        const column = matrix.columns[c];
                        const clickable = count > 0 && column.curriculumId;
                        return (
                          <td key={column.curriculumId ?? 'none'} className="px-2 py-2 text-center">
                            <button
                              type="button"
                              disabled={!clickable}
                              onClick={() => drillDown({ ...locationPatch(row), curriculumId: column.curriculumId })}
                              style={heatStyle(count, matrixMax)}
                              className="w-full rounded-lg px-2 py-2 text-sm font-semibold text-ink enabled:hover:ring-2 enabled:hover:ring-primary/40 disabled:cursor-default"
                            >
                              {count ? formatNumber(count) : '—'}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-bold text-ink">{formatNumber(row.total)}</td>
                    </tr>
                  ))}
                </Table>
              </div>
            ) : students.isError ? (
              <ErrorState onRetry={students.refetch} />
            ) : students.isLoading ? (
              <Skeleton className="h-64 rounded-2xl" />
            ) : (students.data?.data ?? []).length === 0 ? (
              <EmptyState title={L('emptyStudents')} />
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-right text-xs text-ink-soft">
                  {L('studentsCount')} {formatNumber(students.data.meta?.total ?? 0)} — {L('studentsHint')}
                </p>
                <Table
                  minWidth={1100}
                  columns={['student', 'phone', 'location', 'curriculum', 'stage', 'registered', 'paying', 'revenue'].map((c) => L(`studentCols.${c}`))}
                >
                  {students.data.data.map((s, i) => (
                    <tr key={s.studentId} className={rowClass(i)}>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-ink">{s.name}</div>
                        <div className="text-xs text-ink-soft" dir="ltr">
                          {s.email}
                        </div>
                      </td>
                      <td className={cell} dir="ltr">
                        {s.phone || s.guardianPhone || '—'}
                      </td>
                      <td className={cell}>{s.country ? [s.country, s.region].filter(Boolean).join(' · ') : L('unknownLocation')}</td>
                      <td className={cell}>{s.curriculum ?? '—'}</td>
                      <td className={cell}>{s.stage ?? '—'}</td>
                      <td className={cell}>{s.registeredAt}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            s.isPaying ? 'bg-[#E3F5EC] text-success' : 'bg-line/50 text-ink-soft'
                          }`}
                        >
                          {s.isPaying ? L('yes') : L('no')}
                        </span>
                      </td>
                      <td className={cell}>{formatPrice(formatNumber(s.revenue), 'AED')}</td>
                    </tr>
                  ))}
                </Table>
                <div className="flex justify-center">
                  <Pagination page={page} totalPages={students.data.meta?.last_page ?? 1} onChange={setPage} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
