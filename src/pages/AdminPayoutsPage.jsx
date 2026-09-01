import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { PayoutsTable } from '@/components/dashboard/admin/PayoutsTable';
import { GeneratePayoutModal } from '@/components/dashboard/admin/GeneratePayoutModal';
import { MarkPayoutPaidModal } from '@/components/dashboard/admin/MarkPayoutPaidModal';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminPayouts,
  useGeneratePayout,
  useApprovePayout,
  useMarkPayoutPaid,
  useDownloadPayoutInvoice,
  useExportPayouts,
} from '@/hooks/useAdminPayouts';
import { saveBlob } from '@/lib/download';
import { PAYOUT_STATUS_STYLES } from '@/mocks/adminPayouts.mock';
import { useT } from '@/hooks/useT';

export function AdminPayoutsPage() {
  const t = useT();
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [markPaidPayoutId, setMarkPaidPayoutId] = useState(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

  const { data, isLoading, isError, refetch } = useAdminPayouts({ status });
  const generatePayout = useGeneratePayout();
  const approvePayout = useApprovePayout();
  const markPayoutPaid = useMarkPayoutPaid();
  const downloadPayoutInvoice = useDownloadPayoutInvoice();
  const exportPayouts = useExportPayouts();

  const isActing = generatePayout.isPending || approvePayout.isPending || markPayoutPaid.isPending;

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
      const blob = await exportPayouts.mutateAsync({ status: status || undefined });
      saveBlob(blob, 'payouts.xlsx');
    } catch (err) {
      window.alert(err?.message || t('dashboard.adminPayouts.exportFailed'));
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const payouts = data?.data ?? [];

  return (
    <AdminDashboardLayout>
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

        <SmoothSelect
          className="max-w-xs"
          value={status}
          onChange={setStatus}
          placeholder={t('dashboard.adminPayouts.allStatuses')}
          options={Object.entries(PAYOUT_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label }))}
        />

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
            onApprove={(id) => approvePayout.mutate(id)}
            onMarkPaid={(id) => setMarkPaidPayoutId(id)}
            onDownloadInvoice={handleDownloadInvoice}
            downloadingInvoiceId={downloadingInvoiceId}
          />
        )}
      </div>

      {showGenerateModal && (
        <GeneratePayoutModal
          isPending={generatePayout.isPending}
          error={generatePayout.error}
          onClose={() => {
            setShowGenerateModal(false);
            generatePayout.reset();
          }}
          onConfirm={(payload) => generatePayout.mutate(payload, { onSuccess: () => setShowGenerateModal(false) })}
        />
      )}

      {markPaidPayoutId != null && (
        <MarkPayoutPaidModal
          isPending={markPayoutPaid.isPending}
          error={markPayoutPaid.error}
          onClose={() => {
            setMarkPaidPayoutId(null);
            markPayoutPaid.reset();
          }}
          onConfirm={(transferReference) =>
            markPayoutPaid.mutate(
              { id: markPaidPayoutId, transferReference },
              { onSuccess: () => setMarkPaidPayoutId(null) },
            )
          }
        />
      )}
    </AdminDashboardLayout>
  );
}
