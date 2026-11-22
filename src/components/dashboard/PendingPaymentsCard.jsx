import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, CreditCard, TicketPercent } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { ApiErrorList, Avatar } from '@/components/ui';
import { PolicyNotice } from '@/components/common/PolicyNotice';
import { useApplyBookingCoupon, useCheckoutBooking } from '@/hooks/useBooking';
import { useApplyEnrollmentCoupon, useCheckoutEnrollment } from '@/hooks/useEnrollment';
import { formatPrice } from '@/lib/currency';
import { useCheckoutRedirect } from '@/hooks/useCheckoutRedirect';
import { useCurrencyStore } from '@/store';
import { useNow } from '@/hooks/useNow';
import { timeLeft } from '@/lib/pendingActions';
import { useT } from '@/hooks/useT';

/** باقات/دورات حالتها pending_payment — الدفع ينقل لـ Stripe مباشرة، والكوبون يُطبَّق من هنا أيضاً */
export function PendingPaymentsCard({ packages }) {
  const t = useT();

  if (!packages?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-[#F5A623] bg-[#FFF8EC] p-5 shadow-card"
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5A623] text-white">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#F5A623] opacity-30" />
          <AlertCircle size={22} />
        </span>
        <div className="text-right">
          <h3 className="flex items-center gap-2 font-bold text-ink">
            {t('dashboard.pendingPaymentsTitle')}
            <span className="rounded-full bg-[#F5A623] px-2 py-0.5 text-xs text-white">{packages.length}</span>
          </h3>
          <p className="text-sm text-[#B7791F]">{t('dashboard.pendingPaymentsHint')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {packages.map((pkg) => (
          <PendingPaymentRow key={pkg.id} pkg={pkg} />
        ))}
      </div>

      <PolicyNotice policySlug="student-policy" className="mt-3 bg-white/70">
        {t('policyNotice.payment')}
      </PolicyNotice>
    </motion.div>
  );
}

/** صف باقة بانتظار الدفع — يُستخدم أيضاً في قائمة "مطلوب منك" (PendingActionsList) */
export function PendingPaymentRow({ pkg }) {
  const t = useT();
  const now = useNow();
  const deadline = pkg.holdExpiresAt ? timeLeft(t, pkg.holdExpiresAt, now, 'dashboard.pendingActions.paymentTimeLeft') : null;
  const queryClient = useQueryClient();
  const currency = useCurrencyStore((s) => s.currency);
  const [couponCode, setCouponCode] = useState('');
  const { isRedirecting, goToCheckout } = useCheckoutRedirect();

  // id بصيغة booking-12 / enrollment-12 — نفس منطق صفحة تفاصيل الباقة
  const [kind, rawId] = String(pkg.id).split('-');
  const checkoutBooking = useCheckoutBooking();
  const checkoutEnrollment = useCheckoutEnrollment();
  const applyBookingCoupon = useApplyBookingCoupon();
  const applyEnrollmentCoupon = useApplyEnrollmentCoupon();
  const checkout = kind === 'enrollment' ? checkoutEnrollment : checkoutBooking;
  const applyCoupon = kind === 'enrollment' ? applyEnrollmentCoupon : applyBookingCoupon;
  // باقة الحملة يرفض الباك الكوبونات عليها
  const canApplyCoupon = !pkg.isCampaign && !pkg.hasCoupon;

  const handleApplyCoupon = () => {
    const code = couponCode.trim();
    if (!code) return;
    applyCoupon.mutate(
      { id: rawId, couponCode: code },
      {
        onSuccess: () => {
          setCouponCode('');
          // السعر الجديد بعد الخصم يأتي من إعادة جلب بيانات اللوحة
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.student() });
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'pending-actions'] });
        },
      },
    );
  };

  const handlePayNow = () => {
    checkout.mutate(rawId, {
      onSuccess: (result) => {
        if (!result?.checkout_url) return;
        goToCheckout({ value: pkg.price, target: pkg.id, contentCategory: kind }, result.checkout_url);
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={pkg.teacherName} src={pkg.teacherAvatar} size="sm" className="!h-[42px] !w-[42px]" />
          <div className="text-right">
            <div className="font-bold text-ink">{pkg.packageTitle}</div>
            <div className="text-sm text-ink-soft">
              {[pkg.teacherName, pkg.subject].filter(Boolean).join(' • ')}
            </div>
          </div>
        </div>

        {deadline && (
          <span
            className={`inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-bold ${
              deadline.urgent ? 'bg-accent-pink/10 text-accent-pink' : 'bg-[#F5A623]/15 text-[#B7791F]'
            }`}
          >
            <Clock size={13} />
            {deadline.text}
          </span>
        )}

        <div className="flex items-center gap-3">
          {pkg.price > 0 && (
            <div className="text-left">
              <span className="font-bold text-ink">{formatPrice(pkg.price, currency)}</span>
              {pkg.hasCoupon && pkg.discountAmount > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-success">
                  <TicketPercent size={12} />
                  {t('dashboard.myPackages.couponDiscount')} {formatPrice(pkg.discountAmount, currency)}
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            disabled={checkout.isPending || isRedirecting}
            onClick={handlePayNow}
            className="flex items-center gap-1.5 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#E0951A] disabled:opacity-50"
          >
            <CreditCard size={16} />
            {checkout.isPending || isRedirecting ? t('dashboard.myPackages.processingPayment') : t('dashboard.myPackages.payNow')}
          </button>
        </div>
      </div>

      {canApplyCoupon && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <TicketPercent size={16} className="text-primary" />
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
            placeholder={t('booking.couponLabel')}
            dir="ltr"
            className="min-w-[180px] flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            disabled={!couponCode.trim() || applyCoupon.isPending}
            onClick={handleApplyCoupon}
            className="rounded-xl border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-50"
          >
            {applyCoupon.isPending ? t('dashboard.myPackages.applyingCoupon') : t('dashboard.myPackages.applyCoupon')}
          </button>
        </div>
      )}

      {applyCoupon.isError && <ApiErrorList error={applyCoupon.error} labelFor={() => null} />}
      {checkout.isError && <ApiErrorList error={checkout.error} labelFor={() => null} />}
    </div>
  );
}
