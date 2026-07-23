import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { PayoutsTable } from '@/components/dashboard/admin/PayoutsTable';
import { GeneratePayoutModal } from '@/components/dashboard/admin/GeneratePayoutModal';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAdminPayouts, useGeneratePayout, useApprovePayout, useMarkPayoutPaid } from '@/hooks/useAdminPayouts';
import { PAYOUT_STATUS_STYLES } from '@/mocks/adminPayouts.mock';
import { useT } from '@/hooks/useT';

export function AdminPayoutsPage() {
  const t = useT();
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const { data, isLoading, isError, refetch } = useAdminPayouts({ status });
  const generatePayout = useGeneratePayout();
  const approvePayout = useApprovePayout();
  const markPayoutPaid = useMarkPayoutPaid();

  const isActing = generatePayout.isPending || approvePayout.isPending || markPayoutPaid.isPending;

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
          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus size={16} />
            {t('dashboard.adminPayouts.generate')}
          </button>
        </div>

        <div className="flex min-w-[200px] max-w-xs items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full appearance-none bg-transparent text-sm font-semibold text-ink outline-none"
          >
            <option value="">{t('dashboard.adminPayouts.allStatuses')}</option>
            {Object.entries(PAYOUT_STATUS_STYLES).map(([value, style]) => (
              <option key={value} value={value}>
                {style.label}
              </option>
            ))}
          </select>
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
            onApprove={(id) => approvePayout.mutate(id)}
            onMarkPaid={(id) => markPayoutPaid.mutate(id)}
          />
        )}
      </div>

      {showGenerateModal && (
        <GeneratePayoutModal
          isPending={generatePayout.isPending}
          onClose={() => setShowGenerateModal(false)}
          onConfirm={(providerId) => generatePayout.mutate(providerId, { onSuccess: () => setShowGenerateModal(false) })}
        />
      )}
    </AdminDashboardLayout>
  );
}
