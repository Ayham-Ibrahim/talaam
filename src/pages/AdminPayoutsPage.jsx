import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Download, Plus, X } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { PayoutsTable } from '@/components/dashboard/admin/PayoutsTable';
import { GeneratePayoutsModal } from '@/components/dashboard/admin/GeneratePayoutsModal';
import { MarkPayoutPaidModal } from '@/components/dashboard/admin/MarkPayoutPaidModal';
import { PayoutDetailsModal } from '@/components/dashboard/admin/PayoutDetailsModal';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminPayouts,
  useGeneratePayouts,
  useMarkPayoutPaid,
  useDownloadPayoutInvoice,
  useExportPayouts,
} from '@/hooks/useAdminPayouts';
import { saveBlob } from '@/lib/download';
import { PAYOUT_STATUS_STYLES } from '@/mocks/adminPayouts.mock';
import { useT } from '@/hooks/useT';

/**
 * variant='accountant' يعرض نفس الصفحة للمحاسب بكامل صلاحياتها، بما فيها زر توليد الكشوف (أدمن أو
 * محاسب — PayoutPolicy::generate). الزر يولّد لكل المعلمين كل مستحقاتهم غير المصروفة حتى لحظة الضغط.
 */
export function AdminPayoutsPage({ variant = 'admin' }) {
  const t = useT();
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  // YYYY-MM — كشوف تتقاطع فترتها مع الشهر (Payout::scopeOverlappingMonth)
  const [month, setMonth] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [markPaidPayoutId, setMarkPaidPayoutId] = useState(null);
  const [detailsPayoutId, setDetailsPayoutId] = useState(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

  const { data, isLoading, isError, refetch } = useAdminPayouts({ status, month: month || undefined });
  const generatePayouts = useGeneratePayouts();
  const markPayoutPaid = useMarkPayoutPaid();
  const downloadPayoutInvoice = useDownloadPayoutInvoice();
  const exportPayouts = useExportPayouts();

  const isActing = generatePayouts.isPending || markPayoutPaid.isPending;

  const handleDownloadInvoice = async (payout) => {
    setDownloadingInvoiceId(payout.id);
    try {
      const blob = await downloadPayoutInvoice.mutateAsync(payout.id);
      saveBlob(blob, `payout-${payout.id}.pdf`);
    } catch (err) {
      window.alert(err?.message || t('dashboard.adminPayouts.downloadFailed'));
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportPayouts.mutateAsync({ status: status || undefined, month: month || undefined });
      saveBlob(blob, 'payouts.xlsx');
    } catch (err) {
      window.alert(err?.message || t('dashboard.adminPayouts.exportFailed'));
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const payouts = data?.data ?? [];

  return (
    <AdminDashboardLayout variant={variant}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{t('dashboard.adminPayouts.title')}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminPayouts.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={exportPayouts.isPending}
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-line/30 disabled:opacity-50"
            >
              <Download size={16} />
              {exportPayouts.isPending ? t('dashboard.adminPayouts.exporting') : t('dashboard.adminPayouts.exportExcel')}
            </button>
            <button
              type="button"
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              <Plus size={16} />
              {t('dashboard.adminPayouts.generate')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SmoothSelect
            className="w-full max-w-xs"
            value={status}
            onChange={setStatus}
            placeholder={t('dashboard.adminPayouts.allStatuses')}
            options={Object.entries(PAYOUT_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label }))}
          />
          <div
            className={`flex items-center gap-2 rounded-btn border bg-white px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${
              month ? 'border-primary/40' : 'border-line'
            }`}
          >
            <span className="text-sm text-ink-soft">{t('dashboard.adminPayouts.monthFilter')}</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              aria-label={t('dashboard.adminPayouts.monthFilter')}
              className="bg-transparent py-2.5 text-sm text-ink focus:outline-none"
            />
            {month && (
              <button
                type="button"
                onClick={() => setMonth('')}
                aria-label={t('dashboard.adminPayouts.clearMonth')}
                title={t('dashboard.adminPayouts.clearMonth')}
                className="flex h-6 w-6 items-center justify-center rounded-full text-ink-soft hover:bg-line/50 hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
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
        ) : payouts.length === 0 ? (
          <EmptyState title={t('dashboard.adminPayouts.empty')} />
        ) : (
          <PayoutsTable
            payouts={payouts}
            isActing={isActing}
            onView={(id) => setDetailsPayoutId(id)}
            onMarkPaid={(id) => setMarkPaidPayoutId(id)}
            onDownloadInvoice={handleDownloadInvoice}
            downloadingInvoiceId={downloadingInvoiceId}
          />
        )}
      </div>

      {showGenerateModal && (
        <GeneratePayoutsModal
          isPending={generatePayouts.isPending}
          error={generatePayouts.error}
          result={generatePayouts.data}
          onClose={() => {
            setShowGenerateModal(false);
            generatePayouts.reset();
          }}
          onConfirm={() => generatePayouts.mutate()}
        />
      )}

      {detailsPayoutId != null && (
        <PayoutDetailsModal payoutId={detailsPayoutId} onClose={() => setDetailsPayoutId(null)} />
      )}

      {markPaidPayoutId != null && (
        <MarkPayoutPaidModal
          isPending={markPayoutPaid.isPending}
          error={markPayoutPaid.error}
          onClose={() => {
            setMarkPaidPayoutId(null);
            markPayoutPaid.reset();
          }}
          onConfirm={() =>
            markPayoutPaid.mutate(
              { id: markPaidPayoutId },
              { onSuccess: () => setMarkPaidPayoutId(null) },
            )
          }
        />
      )}
    </AdminDashboardLayout>
  );
}
