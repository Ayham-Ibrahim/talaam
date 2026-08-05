import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useT } from '@/hooks/useT';

export function PaymentCancelPage() {
  const t = useT();

  return (
    <PageContainer>
      <div className="container-app flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-pink/10 text-accent-pink">
          <XCircle size={32} />
        </span>
        <h1 className="text-2xl font-bold text-ink">{t('payments.cancelTitle')}</h1>
        <p className="max-w-md text-sm text-ink-soft">{t('payments.cancelHint')}</p>
        <Link to="/search" className="mt-2 rounded-btn bg-primary px-6 py-3 text-sm font-bold text-white hover:opacity-90">
          {t('payments.backSearch')}
        </Link>
      </div>
    </PageContainer>
  );
}
