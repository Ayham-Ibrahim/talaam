import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys } from '@/api/queryKeys';
import { dashboardService } from '@/services';
import { useT } from '@/hooks/useT';

/**
 * Stripe redirects here after a successful checkout. The booking itself is
 * confirmed asynchronously by the checkout.session.completed webhook, not by
 * this page — this is purely a landing message for the browser tab.
 */
export function PaymentSuccessPage() {
  const t = useT();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const target = searchParams.get('target');
  const kind = searchParams.get('kind');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.packageDetails(target ?? 'payment-success'),
    queryFn: () => dashboardService.getPackageDetails(target),
    enabled: isAuthenticated && !!target,
    refetchInterval: (query) => (query.state.data?.package?.status === 'pending_payment' ? 2000 : false),
  });

  const bookingStatus = data?.package?.status ?? null;
  const targetPath = target ? `/dashboard/student/packages/${target}` : '/dashboard/student/sessions';

  useEffect(() => {
    if (!target || !isAuthenticated) return;
    if (bookingStatus === 'pending_payment' || isLoading) return;

    const timer = window.setTimeout(() => navigate(targetPath, { replace: true }), 3000);
    return () => window.clearTimeout(timer);
  }, [bookingStatus, isAuthenticated, isLoading, navigate, target, targetPath]);

  return (
    <PageContainer>
      <div className="container-app flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light text-success">
          <CheckCircle2 size={32} />
        </span>
        <h1 className="text-2xl font-bold text-ink">{t('payments.successTitle')}</h1>
        <p className="max-w-md text-sm text-ink-soft">{t('payments.successHint')}</p>
        {target && (
          <div className="rounded-btn bg-success-light px-4 py-3 text-sm text-success">
            {bookingStatus === 'pending_payment'
              ? t('payments.successPendingStatus')
              : `${t('payments.statusLabel')}: ${kind === 'enrollment' ? t('payments.statusPaid') : t('payments.statusConfirmed')}`}
          </div>
        )}
        {target && !isLoading && (
          <p className="text-xs text-ink-soft">{t('payments.redirectHint')}</p>
        )}
        {sessionId && <p className="text-xs text-ink-soft" dir="ltr">{sessionId}</p>}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link to={targetPath} className="rounded-btn bg-primary px-6 py-3 text-sm font-bold text-white hover:opacity-90">
            {t('payments.backToBooking')}
          </Link>
          <Link to="/dashboard/student/sessions" className="rounded-btn border border-line px-6 py-3 text-sm font-bold text-ink hover:bg-line/30">
            {t('payments.backToSessions')}
          </Link>
        </div>
        <Link to="/" className="text-sm font-medium text-primary hover:opacity-90">
          {t('payments.backHome')}
        </Link>
      </div>
    </PageContainer>
  );
}
