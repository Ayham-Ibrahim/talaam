import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { ComplaintsTable } from '@/components/dashboard/admin/ComplaintsTable';
import { ResolveComplaintModal } from '@/components/dashboard/admin/ResolveComplaintModal';
import { RescheduleRequestsTable } from '@/components/dashboard/admin/RescheduleRequestsTable';
import { ApproveRescheduleModal } from '@/components/dashboard/admin/ApproveRescheduleModal';
import { ReasonModal } from '@/components/dashboard/admin/ReasonModal';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminComplaints,
  useResolveComplaint,
  useEscalateComplaint,
  useAdminRescheduleRequests,
  useApproveReschedule,
  useRejectReschedule,
} from '@/hooks/useAdminComplaints';
import { COMPLAINT_STATUS_STYLES, RESCHEDULE_STATUS_STYLES } from '@/mocks/adminComplaints.mock';
import { useT } from '@/hooks/useT';

const TABS = [
  { key: 'complaints', labelKey: 'tabComplaints' },
  { key: 'reschedule', labelKey: 'tabReschedule' },
];

export function AdminComplaintsPage() {
  const t = useT();
  const { user } = useAuth();
  const [tab, setTab] = useState('complaints');
  const [complaintStatus, setComplaintStatus] = useState('');
  const [rescheduleStatus, setRescheduleStatus] = useState('');
  const [modal, setModal] = useState(null);

  const complaintsQuery = useAdminComplaints({ status: complaintStatus });
  const rescheduleQuery = useAdminRescheduleRequests({ status: rescheduleStatus });

  const resolveComplaint = useResolveComplaint();
  const escalateComplaint = useEscalateComplaint();
  const approveReschedule = useApproveReschedule();
  const rejectReschedule = useRejectReschedule();

  const isActing =
    resolveComplaint.isPending || escalateComplaint.isPending || approveReschedule.isPending || rejectReschedule.isPending;

  if (!user) return <Navigate to="/login" replace />;

  const closeModal = () => setModal(null);

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('dashboard.adminComplaints.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminComplaints.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={`rounded-2xl px-6 py-3 text-sm font-bold transition-colors ${
                tab === tabItem.key ? 'bg-primary text-white' : 'border border-line bg-white text-ink hover:bg-line/30'
              }`}
            >
              {t(`dashboard.adminComplaints.${tabItem.labelKey}`)}
            </button>
          ))}
        </div>

        {tab === 'complaints' ? (
          <div className="flex flex-col gap-4">
            <SmoothSelect
              className="max-w-xs"
              value={complaintStatus}
              onChange={setComplaintStatus}
              placeholder={t('dashboard.adminComplaints.allStatuses')}
              options={Object.entries(COMPLAINT_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label }))}
            />

            {complaintsQuery.isError ? (
              <ErrorState onRetry={complaintsQuery.refetch} />
            ) : complaintsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-2xl" />
                ))}
              </div>
            ) : (complaintsQuery.data?.data ?? []).length === 0 ? (
              <EmptyState title={t('dashboard.adminComplaints.empty')} />
            ) : (
              <ComplaintsTable
                complaints={complaintsQuery.data.data}
                isActing={isActing}
                onResolve={(complaint) => setModal({ type: 'resolve', complaint })}
                onEscalate={(complaint) => setModal({ type: 'escalate', complaint })}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <SmoothSelect
              className="max-w-xs"
              value={rescheduleStatus}
              onChange={setRescheduleStatus}
              placeholder={t('dashboard.adminComplaints.allStatuses')}
              options={Object.entries(RESCHEDULE_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label }))}
            />

            {rescheduleQuery.isError ? (
              <ErrorState onRetry={rescheduleQuery.refetch} />
            ) : rescheduleQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-2xl" />
                ))}
              </div>
            ) : (rescheduleQuery.data?.data ?? []).length === 0 ? (
              <EmptyState title={t('dashboard.adminReschedule.empty')} />
            ) : (
              <RescheduleRequestsTable
                requests={rescheduleQuery.data.data}
                isActing={isActing}
                onApprove={(request) => approveReschedule.mutate({ id: request.id, alternativeScheduledAt: null })}
                onApproveWithAlternative={(request) => setModal({ type: 'approveAlternative', request })}
                onReject={(request) => setModal({ type: 'rejectReschedule', request })}
              />
            )}
          </div>
        )}
      </div>

      {modal?.type === 'resolve' && (
        <ResolveComplaintModal
          isPending={isActing}
          error={resolveComplaint.isError ? resolveComplaint.error : null}
          onClose={closeModal}
          onConfirm={(resolutionType, note) =>
            resolveComplaint.mutate({ id: modal.complaint.id, resolutionType, note }, { onSuccess: closeModal })
          }
        />
      )}

      {modal?.type === 'escalate' && (
        <ReasonModal
          titleKey="escalateComplaintTitle"
          isPending={isActing}
          error={escalateComplaint.isError ? escalateComplaint.error : null}
          onClose={closeModal}
          onConfirm={(note) => escalateComplaint.mutate({ id: modal.complaint.id, note }, { onSuccess: closeModal })}
        />
      )}

      {modal?.type === 'approveAlternative' && (
        <ApproveRescheduleModal
          isPending={isActing}
          error={approveReschedule.isError ? approveReschedule.error : null}
          onClose={closeModal}
          onConfirm={(alternativeScheduledAt) =>
            approveReschedule.mutate({ id: modal.request.id, alternativeScheduledAt }, { onSuccess: closeModal })
          }
        />
      )}

      {modal?.type === 'rejectReschedule' && (
        <ReasonModal
          titleKey="rejectRescheduleTitle"
          isPending={isActing}
          error={rejectReschedule.isError ? rejectReschedule.error : null}
          onClose={closeModal}
          onConfirm={(reason) => rejectReschedule.mutate({ id: modal.request.id, reason }, { onSuccess: closeModal })}
        />
      )}
    </AdminDashboardLayout>
  );
}
