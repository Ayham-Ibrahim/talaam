import { Check, Wallet } from 'lucide-react';
import { PayoutStatusBadge } from './PayoutStatusBadge';
import { PROVIDER_TYPE_LABELS } from '@/mocks/adminListings.mock';
import { formatDate, formatPrice } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function PayoutsTable({ payouts, onApprove, onMarkPaid, isActing }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminPayouts.colProvider')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminPayouts.colPeriod')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminPayouts.colSessions')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminPayouts.colAmount')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminPayouts.colStatus')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminPayouts.colActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {payouts.map((p, i) => (
            <tr key={p.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
              <td className="px-4 py-4 text-right">
                <div className="font-semibold text-ink">{p.providerName}</div>
                <div className="text-xs text-ink-soft">{PROVIDER_TYPE_LABELS[p.providerType]}</div>
              </td>
              <td className="px-4 py-4 text-right text-ink-soft">{p.periodLabel}</td>
              <td className="px-4 py-4 text-right text-ink-soft">{p.sessionsCount}</td>
              <td className="px-4 py-4 text-right font-semibold text-price">{formatPrice(p.totalAmount)}</td>
              <td className="px-4 py-4 text-right">
                <PayoutStatusBadge status={p.status} />
              </td>
              <td className="px-4 py-4 text-right">
                {p.status === 'pending' && (
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => onApprove(p.id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-70 disabled:opacity-50"
                  >
                    {t('dashboard.adminPayouts.approve')}
                    <Check size={16} />
                  </button>
                )}
                {p.status === 'approved' && (
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => onMarkPaid(p.id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-success hover:opacity-70 disabled:opacity-50"
                  >
                    {t('dashboard.adminPayouts.markPaid')}
                    <Wallet size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
