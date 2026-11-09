import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Download, FileSpreadsheet, HandCoins, Receipt, TicketPercent, Users, Wallet } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAcademicSupportFinanceReport, useExportAcademicSupportFinanceReport } from '@/hooks/useReports';
import { formatPrice, formatNumber } from '@/lib/formatters';
import { saveBlob } from '@/lib/download';
import { useT } from '@/hooks/useT';

/**
 * المحاسبة المالية للدعم الأكاديمي — للأدمن والمحاسب (variant). كل الأرقام من
 * AcademicSupportFinanceReportService بالباك: اشتراكات باقات الدعم المدفوعة فقط،
 * مستحق الداعم = سعر الباقة × نسبته (ثابت)، وأرباح المنصة = المدفوع فعلاً − مستحق الداعم.
 */
const EMPTY_TOTALS = { purchasesCount: 0, supportersCount: 0, studentsPaid: 0, discountAmount: 0, supporterAmount: 0, platformAmount: 0 };

const inputClass =
  'rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function StatCard({ icon: Icon, label, value, bg, color }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
      <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
        <Icon size={28} style={{ color }} />
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-[#2D2D2D]">{label}</div>
        <div className="text-2xl font-bold text-[#2D2D2D]">{value}</div>
      </div>
    </div>
  );
}

function ReportTable({ title, hint, columns, minWidth, onExport, exporting, children }) {
  const t = useT();
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-right">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>}
        </div>
        <button
          type="button"
          disabled={exporting}
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-line/30 disabled:opacity-50"
        >
          <FileSpreadsheet size={16} className="text-success" />
          {exporting ? t('dashboard.academicSupportFinance.exporting') : t('dashboard.academicSupportFinance.exportTable')}
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-line text-right">
              {columns.map((col) => (
                <th key={col} className="whitespace-nowrap px-4 py-3 font-bold text-ink">
                  {t(`dashboard.academicSupportFinance.cols.${col}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>
    </section>
  );
}

const rowClass = (i) => (i % 2 === 1 ? 'bg-[#FAFBFD]' : '');
const cell = 'px-4 py-3 text-ink-soft';
const amountClass = (n) => (n < 0 ? 'text-red-600' : 'text-success');

const TABS = ['supporters', 'packages', 'purchases'];

export function AcademicSupportFinancePage({ variant = 'admin' }) {
  const t = useT();
  const { user } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [supporterId, setSupporterId] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [activeTab, setActiveTab] = useState('supporters');
  // أي تصدير قيد التنفيذ: 'all' للتقرير الشامل أو اسم الجدول — حتى لا يظهر "جارِ التصدير" على كل الأزرار
  const [exportingSheet, setExportingSheet] = useState(null);

  const { data, isLoading, isError, refetch } = useAcademicSupportFinanceReport(appliedFilters);
  const exportReport = useExportAcademicSupportFinanceReport();

  if (!user) return <Navigate to="/login" replace />;

  const totals = data?.totals ?? EMPTY_TOTALS;
  const supporters = data?.supporters ?? [];
  const packages = data?.packages ?? [];
  const purchases = data?.purchases ?? [];
  const supporterOptions = data?.supporterOptions ?? [];
  const tierLabel = (tier) => t(`dashboard.academicSupportFinance.tiers.${tier}`);
  const subjectsText = (subjects) => (subjects?.length ? subjects.join('، ') : '—');
  const percent = (n) => `${formatNumber(n)}%`;

  const applyFilters = (overrides = {}) => {
    const next = { from, to, supporterId, ...overrides };
    setAppliedFilters({
      from: next.from || undefined,
      to: next.to || undefined,
      supporterId: next.supporterId || undefined,
    });
  };

  const showSupporter = (id) => {
    setSupporterId(String(id));
    applyFilters({ supporterId: String(id) });
  };

  const resetFilters = () => {
    setFrom('');
    setTo('');
    setSupporterId('');
    setAppliedFilters({});
  };

  const handleExport = async (sheet) => {
    setExportingSheet(sheet ?? 'all');
    try {
      const blob = await exportReport.mutateAsync({ ...appliedFilters, sheet });
      saveBlob(blob, sheet ? `academic-support-${sheet}.xlsx` : 'academic-support-finance-report.xlsx');
    } catch (err) {
      window.alert(err?.message || t('dashboard.academicSupportFinance.exportFailed'));
    } finally {
      setExportingSheet(null);
    }
  };

  const tabCounts = { supporters: supporters.length, packages: packages.length, purchases: purchases.length };

  return (
    <AdminDashboardLayout variant={variant}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{t('dashboard.academicSupportFinance.title')}</h1>
            <p className="mt-1 max-w-3xl text-sm text-ink-soft">{t('dashboard.academicSupportFinance.subtitle')}</p>
          </div>
          <button
            type="button"
            disabled={exportReport.isPending}
            onClick={() => handleExport()}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-line/30 disabled:opacity-50"
          >
            <Download size={16} />
            {exportingSheet === 'all' ? t('dashboard.academicSupportFinance.exporting') : t('dashboard.academicSupportFinance.exportExcel')}
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-card">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.academicSupportFinance.fromLabel')}</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.academicSupportFinance.toLabel')}</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
          </label>
          <label className="flex min-w-[200px] flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.academicSupportFinance.supporterLabel')}</span>
            <select value={supporterId} onChange={(e) => setSupporterId(e.target.value)} className={inputClass}>
              <option value="">{t('dashboard.academicSupportFinance.allSupporters')}</option>
              {supporterOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name ?? `#${option.id}`}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => applyFilters()}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Calendar size={16} />
            {t('dashboard.academicSupportFinance.apply')}
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.academicSupportFinance.reset')}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={Receipt} label={t('dashboard.academicSupportFinance.totalStudentsPaid')} value={formatPrice(totals.studentsPaid)} bg="#F0FAFD" color="#2F80ED" />
          <StatCard icon={Wallet} label={t('dashboard.academicSupportFinance.totalPlatform')} value={formatPrice(totals.platformAmount)} bg="#E3F5EC" color="#2E9E6B" />
          <StatCard icon={HandCoins} label={t('dashboard.academicSupportFinance.totalSupporters')} value={formatPrice(totals.supporterAmount)} bg="#FEF3E2" color="#B7791F" />
          <StatCard icon={TicketPercent} label={t('dashboard.academicSupportFinance.totalDiscounts')} value={formatPrice(totals.discountAmount)} bg="#FDECEC" color="#D64545" />
          <StatCard icon={Users} label={t('dashboard.academicSupportFinance.totalPurchases')} value={formatNumber(totals.purchasesCount)} bg="#EDF0F5" color="#4B6898" />
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
              {t(`dashboard.academicSupportFinance.tabs.${tab}`)}
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
        ) : purchases.length === 0 ? (
          <EmptyState title={t('dashboard.academicSupportFinance.empty')} />
        ) : (
          <>
            {activeTab === 'supporters' && (
            <ReportTable
              title={t('dashboard.academicSupportFinance.supportersTitle')}
              onExport={() => handleExport('supporters')}
              exporting={exportingSheet === 'supporters'}
              hint={appliedFilters.supporterId ? null : t('dashboard.academicSupportFinance.supportersHint')}
              columns={['supporter', 'packagesCount', 'subjects', 'purchasesCount', 'studentsPaid', 'discount', 'supporterAmount', 'platformAmount']}
              minWidth={1000}
            >
              {supporters.map((row, i) => (
                <tr key={row.supporterId} className={rowClass(i)}>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => showSupporter(row.supporterId)}
                      title={t('dashboard.academicSupportFinance.viewSupporter')}
                      className="font-semibold text-primary hover:underline"
                    >
                      {row.supporterName ?? '—'}
                    </button>
                  </td>
                  <td className={cell}>{formatNumber(row.packagesCount)}</td>
                  <td className={cell}>{subjectsText(row.subjects)}</td>
                  <td className={cell}>{formatNumber(row.purchasesCount)}</td>
                  <td className={cell}>{formatPrice(row.studentsPaid)}</td>
                  <td className={cell}>{formatPrice(row.discountAmount)}</td>
                  <td className="px-4 py-3 font-semibold text-[#B7791F]">{formatPrice(row.supporterAmount)}</td>
                  <td className={`px-4 py-3 font-semibold ${amountClass(row.platformAmount)}`}>{formatPrice(row.platformAmount)}</td>
                </tr>
              ))}
            </ReportTable>
            )}

            {activeTab === 'packages' && (
            <ReportTable
              title={t('dashboard.academicSupportFinance.packagesTitle')}
              onExport={() => handleExport('packages')}
              exporting={exportingSheet === 'packages'}
              columns={['package', 'tier', 'supporter', 'subjects', 'listPrice', 'supporterPercent', 'platformPercent', 'purchasesCount', 'supporterAmount', 'platformAmount']}
              minWidth={1150}
            >
              {packages.map((row, i) => (
                <tr key={row.packageId} className={rowClass(i)}>
                  <td className="px-4 py-3 font-semibold text-ink">{row.packageTitle ?? '—'}</td>
                  <td className={cell}>{tierLabel(row.tier)}</td>
                  <td className={cell}>{row.supporterName ?? '—'}</td>
                  <td className={cell}>{subjectsText(row.subjects)}</td>
                  <td className={cell}>{formatPrice(row.listPrice)}</td>
                  <td className="px-4 py-3 font-semibold text-[#B7791F]">{percent(row.supporterPercent)}</td>
                  <td className="px-4 py-3 font-semibold text-success">{percent(row.platformPercent)}</td>
                  <td className={cell}>{formatNumber(row.purchasesCount)}</td>
                  <td className="px-4 py-3 font-semibold text-[#B7791F]">{formatPrice(row.supporterAmount)}</td>
                  <td className={`px-4 py-3 font-semibold ${amountClass(row.platformAmount)}`}>{formatPrice(row.platformAmount)}</td>
                </tr>
              ))}
            </ReportTable>
            )}

            {activeTab === 'purchases' && (
            <ReportTable
              title={t('dashboard.academicSupportFinance.purchasesTitle')}
              onExport={() => handleExport('purchases')}
              exporting={exportingSheet === 'purchases'}
              columns={['purchaseId', 'date', 'student', 'supporter', 'package', 'subjects', 'listPrice', 'discount', 'amountPaid', 'supporterAmount', 'platformAmount']}
              minWidth={1250}
            >
              {purchases.map((row, i) => (
                <tr key={row.purchaseId} className={rowClass(i)}>
                  <td className={cell}>#{row.purchaseId}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{row.confirmedAt ?? '—'}</td>
                  <td className="px-4 py-3 text-ink">{row.studentName ?? '—'}</td>
                  <td className={cell}>{row.supporterName ?? '—'}</td>
                  <td className={cell}>{row.packageTitle ?? '—'}</td>
                  <td className={cell}>{subjectsText(row.subjects)}</td>
                  <td className={cell}>{formatPrice(row.listPrice)}</td>
                  <td className={cell}>{row.discountAmount ? formatPrice(row.discountAmount) : '—'}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{formatPrice(row.amountPaid)}</td>
                  <td className="px-4 py-3 font-semibold text-[#B7791F]">{formatPrice(row.supporterAmount)}</td>
                  <td className={`px-4 py-3 font-semibold ${amountClass(row.platformAmount)}`}>{formatPrice(row.platformAmount)}</td>
                </tr>
              ))}
            </ReportTable>
            )}
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
