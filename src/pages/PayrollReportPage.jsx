import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Download, Gift, MinusCircle, Users, Wallet } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { StatCard } from '@/components/dashboard/admin/employees/PayrollUi';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useExportPayrollReport, usePayrollReport } from '@/hooks/useEmployees';
import { formatNumber, formatPrice } from '@/lib/formatters';
import { saveBlob } from '@/lib/download';
import { useT } from '@/hooks/useT';

const MONTH_INPUT_CLASS =
  'rounded-btn border border-line bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

/**
 * التقرير الشامل لرواتب الموظفين لفترة أشهر — من EmployeePayrollService::report بالباك:
 * مجاميع عامة + صف لكل موظف + تفصيل شهري. مبني على الكشوف المولَّدة فقط.
 */
export function PayrollReportPage({ variant = 'admin' }) {
  const t = useT();
  const { user } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});
  // جدول واحد ظاهر في كل مرة: حسب الموظف أو حسب الشهر
  const [view, setView] = useState('employee');

  const { data, isLoading, isError, refetch } = usePayrollReport(appliedFilters);
  const exportPayroll = useExportPayrollReport();

  if (!user) return <Navigate to="/login" replace />;

  const summary = data?.summary ?? {};
  const rows = data?.rows ?? [];
  const months = data?.months ?? [];

  const handleExport = async () => {
    try {
      const blob = await exportPayroll.mutateAsync(appliedFilters);
      saveBlob(blob, 'payroll-report.xlsx');
    } catch (err) {
      window.alert(err?.message || t('dashboard.payroll.exportFailed'));
    }
  };

  return (
    <AdminDashboardLayout variant={variant}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{t('dashboard.payrollReport.title')}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t('dashboard.payrollReport.subtitle')}</p>
          </div>
          <button
            type="button"
            disabled={exportPayroll.isPending}
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-line/30 disabled:opacity-50"
          >
            <Download size={16} />
            {exportPayroll.isPending ? t('dashboard.payroll.exporting') : t('dashboard.payroll.exportExcel')}
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-card">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.payrollReport.fromLabel')}</span>
            <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} className={MONTH_INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.payrollReport.toLabel')}</span>
            <input type="month" value={to} onChange={(e) => setTo(e.target.value)} className={MONTH_INPUT_CLASS} />
          </label>
          <button
            type="button"
            onClick={() => setAppliedFilters({ from: from || undefined, to: to || undefined })}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Calendar size={16} />
            {t('dashboard.payrollReport.apply')}
          </button>
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard icon={Users} label={t('dashboard.payrollReport.activeEmployees')} value={formatNumber(summary.activeEmployees)} />
              <StatCard
                icon={Wallet}
                label={t('dashboard.payrollReport.currentMonthlyBasePayroll')}
                value={formatPrice(summary.currentMonthlyBasePayroll)}
              />
              <StatCard icon={Wallet} label={t('dashboard.payrollReport.netTotal')} value={formatPrice(summary.netTotal)} />
              <StatCard
                icon={Gift}
                label={t('dashboard.payrollReport.bonusesTotal')}
                value={formatPrice(summary.bonusesTotal)}
                bg="#F0FAFD"
                color="#2F80ED"
              />
              <StatCard
                icon={MinusCircle}
                label={t('dashboard.payrollReport.deductionsTotal')}
                value={formatPrice(summary.deductionsTotal)}
                bg="#FCE8F0"
                color="#C2185B"
              />
              <StatCard
                icon={CheckCircle2}
                label={t('dashboard.payrollReport.paidVsOutstanding')}
                value={`${formatPrice(summary.paidAmount)} / ${formatPrice(summary.outstandingAmount)}`}
                bg="#E3F5EC"
                color="#2E9E6B"
              />
            </div>

            {rows.length === 0 ? (
              <EmptyState title={t('dashboard.payrollReport.empty')} />
            ) : (
              <section className="flex flex-col gap-3">
                <div role="tablist" className="flex w-fit gap-1 rounded-xl bg-white p-1 shadow-card">
                  {[
                    ['employee', 'byEmployee'],
                    ['month', 'byMonth'],
                  ].map(([key, labelKey]) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={view === key}
                      onClick={() => setView(key)}
                      className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
                        view === key ? 'bg-primary text-white' : 'text-ink-soft hover:bg-line/30 hover:text-ink'
                      }`}
                    >
                      {t(`dashboard.payrollReport.${labelKey}`)}
                    </button>
                  ))}
                </div>

                {view === 'employee' ? (
                  <ReportTable
                    columns={['employee', 'monthsCount', 'base', 'bonuses', 'deductions', 'net', 'paid', 'outstanding']}
                    rows={rows}
                    rowKey={(r) => r.employeeId}
                    renderCells={(r) => [
                      <>
                        <div className="font-semibold text-ink">{r.employeeName}</div>
                        <div className="text-xs text-ink-soft">
                          {r.jobTitle}
                          {!r.isActive && ` · ${t('dashboard.employees.inactive')}`}
                        </div>
                      </>,
                      formatNumber(r.monthsCount),
                      formatPrice(r.baseTotal),
                      <span className="text-success">{formatPrice(r.bonusesTotal)}</span>,
                      <span className="text-accent-pink">{formatPrice(r.deductionsTotal)}</span>,
                      <span className="font-semibold text-ink">{formatPrice(r.netTotal)}</span>,
                      formatPrice(r.paidAmount),
                      <span className="font-semibold text-[#B7791F]">{formatPrice(r.outstandingAmount)}</span>,
                    ]}
                  />
                ) : (
                  <ReportTable
                    columns={['month', 'employeesCount', 'base', 'bonuses', 'deductions', 'net', 'paid']}
                    rows={months}
                    rowKey={(m) => m.month}
                    renderCells={(m) => [
                      <span className="font-semibold text-ink">{m.month}</span>,
                      formatNumber(m.employeesCount),
                      formatPrice(m.baseTotal),
                      <span className="text-success">{formatPrice(m.bonusesTotal)}</span>,
                      <span className="text-accent-pink">{formatPrice(m.deductionsTotal)}</span>,
                      <span className="font-semibold text-ink">{formatPrice(m.netTotal)}</span>,
                      formatPrice(m.paidAmount),
                    ]}
                  />
                )}
              </section>
            )}
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}

function ReportTable({ columns, rows, rowKey, renderCells }) {
  const t = useT();
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-line text-right">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-bold text-ink">
                {t(`dashboard.payrollReport.cols.${col}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, i) => (
            <tr key={rowKey(row)} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
              {renderCells(row).map((cell, j) => (
                <td key={j} className="px-4 py-3 text-ink-soft">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
