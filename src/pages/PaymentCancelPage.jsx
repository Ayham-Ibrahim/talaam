import { Link, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useT } from '@/hooks/useT';

export function PaymentCancelPage() {
  const t = useT();
  const [searchParams] = useSearchParams();
  const target = searchParams.get('target');
  const targetPath = target ? `/dashboard/student/packages/${target}` : '/search';

  return (
    <PageContainer>
      <div className="container-app flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-pink/10 text-accent-pink">
          <XCircle size={32} />
        </span>
        <h1 className="text-2xl font-bold text-ink">{t('payments.cancelTitle')}</h1>
        <p className="max-w-md text-sm text-ink-soft">{t('payments.cancelHint')}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link to={targetPath} className="rounded-btn bg-primary px-6 py-3 text-sm font-bold text-white hover:opacity-90">
            {t('payments.backToBooking')}
          </Link>
          <Link to="/search" className="rounded-btn border border-line px-6 py-3 text-sm font-bold text-ink hover:bg-line/30">
            {t('payments.backSearch')}
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
