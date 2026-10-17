import { Navigate, useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { AcademicSupporterStatusBadge } from '@/components/dashboard/admin/AcademicSupporterStatusBadge';
import { AdminAcademicSupporterProfileEditor } from '@/components/dashboard/admin/AdminAcademicSupporterProfileEditor';
import { SupportPackagesApprovalPanel } from '@/components/dashboard/admin/SupportPackagesApprovalPanel';
import { ReasonModal } from '@/components/dashboard/admin/ReasonModal';
import { Avatar, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAcademicSupporterDetail, useSuspendAcademicSupporter, useReactivateAcademicSupporter } from '@/hooks/useAcademicSupporters';
import { useT } from '@/hooks/useT';
import { useState } from 'react';

export function AdminAcademicSupporterDetailPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const { data: supporter, isLoading, isError, refetch } = useAdminAcademicSupporterDetail(id);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const suspend = useSuspendAcademicSupporter(id);
  const reactivate = useReactivateAcademicSupporter(id);

  const isActing = suspend.isPending || reactivate.isPending;

  if (!user) return <Navigate to="/login" replace />;

  return (
    <AdminDashboardLayout>
      <div className="mb-4 flex justify-end">
        <Link to="/dashboard/admin/academic-supporters" className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-primary">
          {t('dashboard.adminTeacherDetail.back')}
          <ArrowRight size={15} />
        </Link>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : !supporter ? (
        <ErrorState message={t('dashboard.adminTeacherDetail.notFound')} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="flex items-center justify-end gap-3 text-right">
                <div>
                  <div className="font-bold text-ink">{supporter.name}</div>
                  <div className="text-xs text-ink-soft" dir="ltr">{supporter.email}</div>
                  {supporter.phone && <div className="text-xs text-ink-soft" dir="ltr">{supporter.phone}</div>}
                </div>
                <Avatar name={supporter.name} src={supporter.avatar} size="md" />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <AcademicSupporterStatusBadge status={supporter.status} />
              </div>

              {suspend.isError && <p className="mt-3 text-right text-xs text-accent-pink">{suspend.error?.message}</p>}
              {reactivate.isError && <p className="mt-3 text-right text-xs text-accent-pink">{reactivate.error?.message}</p>}

              <div className="mt-5 flex gap-3">
                {supporter.status === 'active' ? (
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => setShowSuspendModal(true)}
                    className="flex-1 rounded-xl border border-accent-pink py-2.5 text-sm font-medium text-accent-pink hover:bg-accent-pink/5 disabled:opacity-50"
                  >
                    {t('dashboard.adminAcademicSupporterDetail.suspend')}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => reactivate.mutate(id)}
                    className="flex-1 rounded-xl bg-success py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {t('dashboard.adminAcademicSupporterDetail.reactivate')}
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-card">
              <h2 className="mb-3 text-right font-bold text-ink">{t('dashboard.adminAcademicSupporterDetail.packagesTitle')}</h2>
              <SupportPackagesApprovalPanel supporterId={id} supportPackages={supporter.supportPackages ?? []} />
            </div>
          </div>

          <AdminAcademicSupporterProfileEditor supporterId={id} supporter={supporter} />
        </div>
      )}

      {showSuspendModal && (
        <ReasonModal
          titleKey="suspendTeacherTitle"
          isPending={suspend.isPending}
          error={suspend.isError ? suspend.error : null}
          onConfirm={(reason) => suspend.mutate({ supporterId: id, reason }, { onSuccess: () => setShowSuspendModal(false) })}
          onClose={() => setShowSuspendModal(false)}
        />
      )}
    </AdminDashboardLayout>
  );
}
