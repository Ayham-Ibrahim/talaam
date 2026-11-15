import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Download, HandCoins, Landmark, Presentation, TrendingUp, Users } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { usePlatformNetProfitReport, useExportPlatformNetProfitReport } from '@/hooks/useReports';
import { formatPrice, formatNumber } from '@/lib/formatters';
import { saveBlob } from '@/lib/download';
import { useT } from '@/hooks/useT';

/**
 * صافي أرباح المنصة — للأدمن والمحاسب (variant). الأرقام من PlatformNetProfitService بالباك:
 * أرباح حصص المعلمين + أرباح الدعم الأكاديمي − رواتب الموظفين، لنفس الفترة، مع تفصيل شهري.
 */
const inputClass =
  'rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const EMPTY_TOTALS = { sessionsProfit: 0, supportProfit: 0, totalProfit: 0, salaries: 0, netProfit: 0, sessionsCount: 0, supportPurchasesCount: 0 };

const signedClass = (n) => (n < 0 ? 'text-red-600' : 'text-success');

function StatCard({ icon: Icon, label, value, hint, bg, color, valueClass = 'text-[#2D2D2D]' }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
      <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
        <Icon size={28} style={{ color }} />
      </div>
      <div className="min-w-0 text-right">
        <div className="text-sm font-bold text-[#2D2D2D]">{label}</div>
        <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
        {hint && <div className="text-xs text-ink-soft">{hint}</div>}
      </div>
    </div>
  );
}

export function PlatformNetProfitPage({ variant = 'admin' }) {
  const t = useT();
  const { user } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({});

  const { data, isLoading, isError, refetch } = usePlatformNetProfitReport(applied);
  const exportReport = useExportPlatformNetProfitReport();

  if (!user) return <Navigate to="/login" replace />;

  const totals = data?.totals ?? EMPTY_TOTALS;
  const months = data?.months ?? [];
  const k = (key) => t(`dashboard.platformNetProfit.${key}`);

  const applyFilters = () => setApplied({ from: from || undefined, to: to || undefined });
  const resetFilters = () => {
    setFrom('');
    setTo('');
    setApplied({});
  };

  const handleExport = async () => {
    try {
      const blob = await exportReport.mutateAsync(applied);
      saveBlob(blob, `platform-net-profit-${data?.filters?.from ?? ''}-to-${data?.filters?.to ?? ''}.xlsx`);
    } catch (err) {
      window.alert(err?.message || k('exportFailed'));
    }
  };

  return (
    <AdminDashboardLayout variant={variant}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{k('title')}</h1>
            <p className="mt-1 max-w-3xl text-sm text-ink-soft">{k('subtitle')}</p>
          </div>
          <button
            type="button"
            disabled={exportReport.isPending || isLoading}
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-line/30 disabled:opacity-50"
          >
            <Download size={16} />
            {exportReport.isPending ? k('exporting') : k('exportExcel')}
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-card">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{k('fromLabel')}</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{k('toLabel')}</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
          </label>
          <button
            type="button"
            onClick={applyFilters}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Calendar size={16} />
            {k('apply')}
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {k('reset')}
          </button>
          {data?.filters && (
            <span className="text-xs text-ink-soft">
              {k('periodShown')} {data.filters.from} ← {data.filters.to}
            </span>
          )}
        </div>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* المعادلة كما هي: أرباح الحصص + أرباح الدعم = الإجمالي، ناقص الرواتب = الصافي */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={Presentation}
                label={k('sessionsProfit')}
                value={formatPrice(totals.sessionsProfit)}
                hint={`${formatNumber(totals.sessionsCount)} ${k('sessionsUnit')}`}
                bg="#F0FAFD"
                color="#2F80ED"
              />
              <StatCard
                icon={HandCoins}
                label={k('supportProfit')}
                value={formatPrice(totals.supportProfit)}
                hint={`${formatNumber(totals.supportPurchasesCount)} ${k('purchasesUnit')}`}
                bg="#FEF3E2"
                color="#B7791F"
              />
              <StatCard icon={TrendingUp} label={k('totalProfit')} value={formatPrice(totals.totalProfit)} bg="#EDF0F5" color="#4B6898" />
              <StatCard icon={Users} label={k('salaries')} value={formatPrice(totals.salaries)} hint={k('salariesHint')} bg="#FDECEC" color="#D64545" />
              <div className="sm:col-span-2">
                <StatCard
                  icon={Landmark}
                  label={k('netProfit')}
                  value={formatPrice(totals.netProfit)}
                  hint={k('formula')}
                  bg="#E3F5EC"
                  color="#2E9E6B"
                  valueClass={signedClass(totals.netProfit)}
                />
              </div>
            </div>

            <section className="flex flex-col gap-3">
              <div className="text-right">
                <h2 className="text-base font-bold text-ink">{k('monthlyTitle')}</h2>
                <p className="mt-0.5 text-xs text-ink-soft">{k('monthlyHint')}</p>
              </div>
              <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
                <table className="w-full text-sm" style={{ minWidth: 900 }}>
                  <thead>
                    <tr className="border-b border-line text-right">
                      {['month', 'sessionsProfit', 'supportProfit', 'totalProfit', 'salaries', 'netProfit'].map((col) => (
                        <th key={col} className="whitespace-nowrap px-4 py-3 font-bold text-ink">
                          {k(`cols.${col}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {months.map((row, i) => (
                      <tr key={row.month} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">
                          {row.month}
                          <div className="text-xs font-normal text-ink-soft">
                            {row.from} ← {row.to}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-soft">{formatPrice(row.sessionsProfit)}</td>
                        <td className="px-4 py-3 text-ink-soft">{formatPrice(row.supportProfit)}</td>
                        <td className="px-4 py-3 font-semibold text-ink">{formatPrice(row.totalProfit)}</td>
                        <td className="px-4 py-3 text-red-600">{formatPrice(row.salaries)}</td>
                        <td className={`px-4 py-3 font-bold ${signedClass(row.netProfit)}`}>{formatPrice(row.netProfit)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {months.length > 1 && (
                    <tfoot>
                      <tr className="border-t-2 border-line font-bold text-ink">
                        <td className="px-4 py-3">{k('total')}</td>
                        <td className="px-4 py-3">{formatPrice(totals.sessionsProfit)}</td>
                        <td className="px-4 py-3">{formatPrice(totals.supportProfit)}</td>
                        <td className="px-4 py-3">{formatPrice(totals.totalProfit)}</td>
                        <td className="px-4 py-3 text-red-600">{formatPrice(totals.salaries)}</td>
                        <td className={`px-4 py-3 ${signedClass(totals.netProfit)}`}>{formatPrice(totals.netProfit)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </section>

            <p className="text-right text-xs text-ink-soft">{k('notes')}</p>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
