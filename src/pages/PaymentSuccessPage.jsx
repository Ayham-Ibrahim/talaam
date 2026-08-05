import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useT } from '@/hooks/useT';

/**
 * Stripe redirects here after a successful checkout. The booking itself is
 * confirmed asynchronously by the checkout.session.completed webhook, not by
 * this page — this is purely a landing message for the browser tab.
 */
export function PaymentSuccessPage() {
  const t = useT();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <PageContainer>
      <div className="container-app flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light text-success">
          <CheckCircle2 size={32} />
        </span>
        <h1 className="text-2xl font-bold text-ink">{t('payments.successTitle')}</h1>
        <p className="max-w-md text-sm text-ink-soft">{t('payments.successHint')}</p>
        {sessionId && <p className="text-xs text-ink-soft" dir="ltr">{sessionId}</p>}
        <Link to="/" className="mt-2 rounded-btn bg-primary px-6 py-3 text-sm font-bold text-white hover:opacity-90">
          {t('payments.backHome')}
        </Link>
      </div>
    </PageContainer>
  );
}
