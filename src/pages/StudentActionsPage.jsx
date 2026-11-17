import { Navigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Inbox } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PendingActionsList } from '@/components/dashboard/PendingActionsCard';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useMyRescheduleRequests, usePendingActions } from '@/hooks/useReschedule';
import { formatDateTime } from '@/lib/formatters';
import { pendingActionItems } from '@/lib/pendingActions';
import { useT } from '@/hooks/useT';

const TABS = ['required', 'mine'];

/** مرحلة طلب أرسله الطالب — من status + رد الطرف الآخر (نفس مراحل RescheduleService) */
function requestStage(request) {
  if (request.status === 'pending') {
    return request.counterpartyResponse === 'pending' ? 'awaitingTeacher' : 'awaitingAdmin';
  }
  if (request.status === 'approved_with_alternative') return 'approvedAlternative';
  if (request.status === 'approved') return 'approved';
  if (request.status === 'rejected') return 'rejected';
  if (request.status === 'cancelled_by_requester') return 'cancelled';
  if (request.status === 'expired') return 'expired';
  return null;
}

const STAGE_STYLES = {
  awaitingTeacher: 'bg-[#FEF3E2] text-[#B7791F]',
  awaitingAdmin: 'bg-[#EDF0F5] text-primary',
  approved: 'bg-success-light text-success',
  approvedAlternative: 'bg-success-light text-success',
  rejected: 'bg-[#FDF0F0] text-[#FF383C]',
  cancelled: 'bg-line/40 text-ink-soft',
  expired: 'bg-line/40 text-ink-soft',
};

function EmptyBox({ icon: Icon, title }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-14 text-center">
      <Icon size={40} className="text-success" />
      <p className="font-bold text-ink">{title}</p>
    </div>
  );
}

function MyRequestItem({ request, t, tz }) {
  const stage = requestStage(request);
  const newTime = request.alternativeScheduledAt ?? request.proposedScheduledAt;

  return (
    <li className="rounded-xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="text-right">
          <div className="text-sm font-bold text-ink">
            {t(`dashboard.actionsPage.requestType.${request.type === 'makeup' ? 'makeup' : 'reschedule'}`)}
          </div>
          {request.teacherName && <div className="text-xs text-ink-soft">{request.teacherName}</div>}
        </div>
        <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STAGE_STYLES[stage] ?? 'bg-line/40 text-ink-soft'}`}>
          {stage ? t(`dashboard.actionsPage.stage.${stage}`) : request.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-soft">
          {t(`dashboard.pendingActions.${request.type === 'makeup' ? 'missed' : 'current'}`)}:{' '}
          <span dir="ltr">{formatDateTime(request.originalScheduledAt, tz)}</span>
        </span>
        <ArrowLeft size={16} className="text-primary" />
        <span className="font-bold text-primary">
          {t('dashboard.pendingActions.proposed')}: <span dir="ltr">{formatDateTime(newTime, tz)}</span>
        </span>
      </div>

      {stage === 'rejected' && request.rejectionReason && (
        <p className="mt-2 text-right text-xs text-[#FF383C]">
          {t('dashboard.actionsPage.rejectionReason')}: {request.rejectionReason}
        </p>
      )}
      <p className="mt-2 text-right text-xs text-ink-soft">
        {t('dashboard.actionsPage.sentAt')} <span dir="ltr">{formatDateTime(request.createdAt, tz)}</span>
      </p>
    </li>
  );
}

function MyRequestsTab() {
  const t = useT();
  const { user } = useAuth();
  const { data: requests, isLoading, isError, refetch } = useMyRescheduleRequests();

  if (isError) return <ErrorState onRetry={refetch} />;
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }
  if (!requests?.length) return <EmptyBox icon={Inbox} title={t('dashboard.actionsPage.mineEmpty')} />;

  return (
    <ul className="flex flex-col gap-3">
      {requests.map((request) => (
        <MyRequestItem key={request.id} request={request} t={t} tz={user?.timezone} />
      ))}
    </ul>
  );
}

/**
 * "مطلوب منك" — البيت الدائم لكل ما ينتظر الطالب (دفع، رد على طلب، اقتراح تعويض)،
 * وتبويب "طلباتي" لمتابعة ما أرسله هو. ?tab=mine يفتح التبويب الثاني مباشرة.
 */
export function StudentActionsPage() {
  const t = useT();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: pendingActions, isLoading, isError, refetch } = usePendingActions();
  const tab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'required';
  const requiredCount = pendingActionItems(pendingActions).length;

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-1.5 shadow-card">
          {TABS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSearchParams(value === 'required' ? {} : { tab: value }, { replace: true })}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
                tab === value ? 'bg-primary text-white' : 'text-ink hover:bg-line/40'
              }`}
            >
              {t(`dashboard.actionsPage.tabs.${value}`)}
              {value === 'required' && requiredCount > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${tab === value ? 'bg-white text-primary' : 'bg-[#F5A623] text-white'}`}
                >
                  {requiredCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'mine' ? (
          <MyRequestsTab />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {requiredCount > 0 && <p className="text-sm text-[#B7791F]">{t('dashboard.pendingActions.hint')}</p>}
            <PendingActionsList emptyState={<EmptyBox icon={CheckCircle2} title={t('dashboard.actionsPage.requiredEmpty')} />} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
