import { ArrowRight, Clock3, CreditCard } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PackageDetailSummary } from '@/components/dashboard/PackageDetailSummary';
import { PackageSpecsRow } from '@/components/dashboard/PackageSpecsRow';
import { PackageSidebarSummary } from '@/components/dashboard/PackageSidebarSummary';
import { PackageRebookBanner } from '@/components/dashboard/PackageRebookBanner';
import { PackageSessionsList } from '@/components/dashboard/PackageSessionsList';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { usePackageDetails } from '@/hooks/useDashboard';
import { useCheckoutBooking } from '@/hooks/useBooking';
import { useCheckoutEnrollment } from '@/hooks/useEnrollment';
import { useT } from '@/hooks/useT';

export function PackageDetailsPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = usePackageDetails(id);
  const checkoutBooking = useCheckoutBooking();
  const checkoutEnrollment = useCheckoutEnrollment();

  if (!user) return <Navigate to="/login" replace />;

  const [kind, rawId] = String(id).split('-');
  // بلا "بانتظار موافقة المعلم" للتسجيل في دورة — التسجيل يُؤكَّد بالدفع مباشرة، لا موافقة معلم وسيطة كالحجز الفردي
  const isPendingRequest = kind === 'booking' && data?.package?.status === 'pending_teacher_confirmation';
  const isExpiredPendingRequest = kind === 'booking' && data?.package?.status === 'expired' && !!data?.package?.cancellationReason;
  const isPendingPayment = ['booking', 'enrollment'].includes(kind) && data?.package?.status === 'pending_payment';
  const checkout = kind === 'enrollment' ? checkoutEnrollment : checkoutBooking;

  const handlePayNow = () => {
    checkout.mutate(rawId, {
      onSuccess: (result) => {
        if (result?.checkout_url) window.location.href = result.checkout_url;
      },
    });
  };

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center justify-end gap-2 text-sm">
        <span className="font-bold text-ink">{t('dashboard.myPackages.detailsTitle')}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <Link to="/dashboard/student/packages" className="font-bold text-primary hover:underline">
          {t('dashboard.nav.packages')}
        </Link>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : !data?.package ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Link
              to="/dashboard/student/packages"
              aria-label="رجوع"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover"
            >
              <ArrowRight size={18} />
            </Link>
          </div>

          {isPendingRequest && (
            <div className="flex items-center gap-2 rounded-2xl bg-[#FFF6E5] p-4 text-sm font-medium text-[#B8860B]">
              <Clock3 size={18} />
              {t('dashboard.myPackages.pendingTeacherConfirmation')}
            </div>
          )}

          {isExpiredPendingRequest && (
            <div className="flex items-center gap-2 rounded-2xl bg-[#FDF0F0] p-4 text-sm font-medium text-[#C03A2B]">
              <Clock3 size={18} />
              {data.package.cancellationReason || t('dashboard.myPackages.expiredTeacherConfirmation')}
            </div>
          )}

          {isPendingPayment && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary-light p-4">
              <span className="flex items-center gap-2 text-sm font-medium text-primary">
                <CreditCard size={18} />
                {t('dashboard.myPackages.approvedAwaitingPayment')}
              </span>
              <button
                type="button"
                disabled={checkout.isPending}
                onClick={handlePayNow}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {checkout.isPending ? t('dashboard.myPackages.processingPayment') : t('dashboard.myPackages.payNow')}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 flex-col gap-4">
              <PackageDetailSummary pkg={data.package} />
              <PackageSpecsRow pkg={data.package} />
              {['confirmed', 'active', 'in_progress'].includes(data.package.status) &&
                data.package.remainingSessions > 0 &&
                data.package.remainingSessions <= 2 && <PackageRebookBanner />}
              <PackageSessionsList sessions={data.sessions} showType={false} />
            </div>

            <div className="w-full shrink-0 lg:w-[300px]">
              <PackageSidebarSummary pkg={data.package} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
