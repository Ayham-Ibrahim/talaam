import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BarChart3, Download, Wallet, Calendar } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherSessionsReport, useExportTeacherSessionsReport } from '@/hooks/useReports';
import { formatPrice, formatNumber } from '@/lib/formatters';
import { saveBlob } from '@/lib/download';
import { useT } from '@/hooks/useT';

/**
 * تقرير "كل مدرس: عدد الحصص والعائد" — للأدمن والمحاسب (variant). الحصص
 * المحسوبة هنا هي الحصص "المحقَّقة فعلاً" فقط (معلم وطالب حاضران)، وليست كل
 * حصة انقضى وقتها فقط — الفرق يتحدد بالكامل في TeacherSessionsReportService
 * بالباك (status='completed' + حضور فعلي)، لا شيء هنا يُعيد حساب ذلك.
 */
export function TeacherSessionsReportPage({ variant = 'admin' }) {
  const t = useT();
  const { user } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});

  const { data, isLoading, isError, refetch } = useTeacherSessionsReport(appliedFilters);
  const exportReport = useExportTeacherSessionsReport();

  if (!user) return <Navigate to="/login" replace />;

  const rows = data?.rows ?? [];
  const totals = data?.totals ?? { sessionsCount: 0, teacherRevenue: 0, platformRevenue: 0 };

  const handleApplyFilters = () => setAppliedFilters({ from: from || undefined, to: to || undefined });

  const handleExport = async () => {
    try {
      const blob = await exportReport.mutateAsync(appliedFilters);
      saveBlob(blob, 'teacher-sessions-report.xlsx');
    } catch (err) {
      window.alert(err?.message || t('dashboard.teacherSessionsReport.exportFailed'));
    }
  };

  return (
    <AdminDashboardLayout variant={variant}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{t('dashboard.teacherSessionsReport.title')}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t('dashboard.teacherSessionsReport.subtitle')}</p>
          </div>
          <button
            type="button"
            disabled={exportReport.isPending}
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-line/30 disabled:opacity-50"
          >
            <Download size={16} />
            {exportReport.isPending ? t('dashboard.teacherSessionsReport.exporting') : t('dashboard.teacherSessionsReport.exportExcel')}
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-card">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.teacherSessionsReport.fromLabel')}</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.teacherSessionsReport.toLabel')}</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button
            type="button"
            onClick={handleApplyFilters}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Calendar size={16} />
            {t('dashboard.teacherSessionsReport.apply')}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl" style={{ background: '#EDF0F5' }}>
              <BarChart3 size={28} style={{ color: '#4B6898' }} />
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#2D2D2D]">{t('dashboard.teacherSessionsReport.totalSessions')}</div>
              <div className="text-2xl font-bold text-[#2D2D2D]">{formatNumber(totals.sessionsCount)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl" style={{ background: '#E3F5EC' }}>
              <Wallet size={28} style={{ color: '#2E9E6B' }} />
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#2D2D2D]">{t('dashboard.teacherSessionsReport.totalPlatformRevenue')}</div>
              <div className="text-2xl font-bold text-[#2D2D2D]">{formatPrice(totals.platformRevenue)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl" style={{ background: '#F0FAFD' }}>
              <Wallet size={28} style={{ color: '#2F80ED' }} />
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#2D2D2D]">{t('dashboard.teacherSessionsReport.totalTeacherRevenue')}</div>
              <div className="text-2xl font-bold text-[#2D2D2D]">{formatPrice(totals.teacherRevenue)}</div>
            </div>
          </div>
        </div>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title={t('dashboard.teacherSessionsReport.empty')} />
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-line text-right">
                  {['teacher', 'sessionsCount', 'teacherRevenue', 'platformRevenue'].map((col) => (
                    <th key={col} className="px-4 py-3 font-bold text-ink">
                      {t(`dashboard.teacherSessionsReport.cols.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row, i) => (
                  <tr key={row.teacherId} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                    <td className="px-4 py-3 font-semibold text-ink">{row.teacherName ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatNumber(row.sessionsCount)}</td>
                    <td className="px-4 py-3 text-ink">{formatPrice(row.teacherRevenue)}</td>
                    <td className="px-4 py-3 font-semibold text-success">{formatPrice(row.platformRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
