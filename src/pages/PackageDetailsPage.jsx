import { useState } from 'react';
import { ArrowRight, Clock3, CreditCard, TicketPercent } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PackageDetailSummary } from '@/components/dashboard/PackageDetailSummary';
import { PackageSpecsRow } from '@/components/dashboard/PackageSpecsRow';
import { PackageSidebarSummary } from '@/components/dashboard/PackageSidebarSummary';
import { PackageRebookBanner } from '@/components/dashboard/PackageRebookBanner';
import { PackageSessionsList } from '@/components/dashboard/PackageSessionsList';
import { ApiErrorList, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { usePackageDetails } from '@/hooks/useDashboard';
import { useApplyBookingCoupon, useCheckoutBooking } from '@/hooks/useBooking';
import { useApplyEnrollmentCoupon, useCheckoutEnrollment } from '@/hooks/useEnrollment';
import { formatPrice } from '@/lib/currency';
import { useCurrencyStore } from '@/store';
import { useT } from '@/hooks/useT';

export function PackageDetailsPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = usePackageDetails(id);
  const checkoutBooking = useCheckoutBooking();
  const checkoutEnrollment = useCheckoutEnrollment();
  const applyBookingCoupon = useApplyBookingCoupon();
  const applyEnrollmentCoupon = useApplyEnrollmentCoupon();
  const currency = useCurrencyStore((s) => s.currency);
  const [couponCode, setCouponCode] = useState('');

  if (!user) return <Navigate to="/login" replace />;

  const [kind, rawId] = String(id).split('-');
  // بلا "بانتظار موافقة المعلم" للتسجيل في دورة — التسجيل يُؤكَّد بالدفع مباشرة، لا موافقة معلم وسيطة كالحجز الفردي
  const isPendingRequest = kind === 'booking' && data?.package?.status === 'pending_teacher_confirmation';
  const isExpiredPendingRequest = kind === 'booking' && data?.package?.status === 'expired' && !!data?.package?.cancellationReason;
  const isPendingPayment = ['booking', 'enrollment'].includes(kind) && data?.package?.status === 'pending_payment';
  const checkout = kind === 'enrollment' ? checkoutEnrollment : checkoutBooking;
  const applyCoupon = kind === 'enrollment' ? applyEnrollmentCoupon : applyBookingCoupon;

  // الكوبون يغيّر المبلغ على الطلب نفسه وسطر الدفع (والباك يغلق جلسة Stripe القديمة) — ثم إعادة جلب التفاصيل لعرض السعر الجديد
  const handleApplyCoupon = () => {
    const code = couponCode.trim();
    if (!code) return;
    applyCoupon.mutate(
      { id: rawId, couponCode: code },
      {
        onSuccess: () => {
          setCouponCode('');
          refetch();
        },
      },
    );
  };

  const handlePayNow = () => {
    checkout.mutate(rawId, {
      onSuccess: (result) => {
        if (result?.checkout_url) window.location.href = result.checkout_url;
      },
    });
  };

  return (
    <DashboardLayout>
      {/* زر الرجوع + مسار التنقل في سطر واحد على بداية الصفحة (يميناً): باقاتي • التفاصيل */}
      <div className="mb-4 flex items-center gap-3 text-sm">
        <Link
          to="/dashboard/student/packages"
          aria-label="رجوع"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover"
        >
          <ArrowRight size={16} />
        </Link>
        <Link to="/dashboard/student/packages" className="font-bold text-primary hover:underline">
          {t('dashboard.nav.packages')}
        </Link>
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <span className="font-bold text-ink">
          {t(kind === 'enrollment' ? 'dashboard.myPackages.courseDetailsTitle' : 'dashboard.myPackages.detailsTitle')}
        </span>
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
                {/* الدورة بلا موافقة معلم — التسجيل يُؤكَّد بالدفع مباشرة */}
                {t(kind === 'enrollment' ? 'dashboard.myPackages.courseAwaitingPayment' : 'dashboard.myPackages.approvedAwaitingPayment')}
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

          {isPendingPayment &&
            (data.package.hasCoupon ? (
              <div className="flex items-center gap-2 rounded-2xl bg-success-light p-4 text-sm font-medium text-success">
                <TicketPercent size={18} />
                {t('dashboard.myPackages.couponApplied')}
                {data.package.discountAmount > 0 && (
                  <span className="font-bold">
                    {' — '}
                    {t('dashboard.myPackages.couponDiscount')} {formatPrice(data.package.discountAmount, currency)}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
                <span className="flex items-center gap-2 text-sm font-bold text-ink">
                  <TicketPercent size={18} className="text-primary" />
                  {t('booking.couponLabel')}
                </span>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder={t('booking.couponPlaceholder')}
                    dir="ltr"
                    className="min-w-[200px] flex-1 rounded-xl border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    disabled={!couponCode.trim() || applyCoupon.isPending}
                    onClick={handleApplyCoupon}
                    className="rounded-xl border border-primary px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-50"
                  >
                    {applyCoupon.isPending ? t('dashboard.myPackages.applyingCoupon') : t('dashboard.myPackages.applyCoupon')}
                  </button>
                </div>
                {applyCoupon.isError && <ApiErrorList error={applyCoupon.error} labelFor={() => null} />}
              </div>
            ))}

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 flex-col gap-4">
              <PackageDetailSummary pkg={data.package} />
              <PackageSpecsRow pkg={data.package} />
              {/* {['confirmed', 'active', 'in_progress'].includes(data.package.status) &&
                data.package.remainingSessions > 0 &&
                data.package.remainingSessions <= 2 && <PackageRebookBanner />} */}
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
