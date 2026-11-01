import { X } from 'lucide-react';
import { PayoutStatusBadge } from './PayoutStatusBadge';
import { ErrorState, Skeleton } from '@/components/ui';
import { usePayoutDetails } from '@/hooks/useAdminPayouts';
import { PROVIDER_TYPE_LABELS } from '@/mocks/adminListings.mock';
import { formatDate, formatDateTime, formatPrice } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

function SummaryField({ label, value }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 text-right">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{value || '—'}</div>
    </div>
  );
}

/**
 * تفاصيل كشف مستحقات (PayoutController::show): الإجماليات وحالة الاعتماد/التحويل وبنود الكشف —
 * جلسة لأول مرة، أو تسوية تسجيل/انضمام متأخر لجلسة صُرفت سابقاً. نتيجة الحضور ونسبة المستحق
 * يرسلهما الباك إند للأدمن والمحاسب فقط.
 */
export function PayoutDetailsModal({ payoutId, onClose }) {
  const t = useT();
  const { data: payout, isLoading, isError, refetch } = usePayoutDetails(payoutId);

  const items = payout?.items ?? [];
  const sessionItems = items.filter((item) => item.type === 'session');
  const settlementItems = items.filter((item) => item.type === 'settlement');
  const sum = (list) => list.reduce((total, item) => total + item.amount, 0);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminPayouts.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">
            {t('dashboard.adminPayouts.details.title')}
            {payout ? ` #${payout.id}` : ''}
          </h3>
          <span className="w-8" />
        </div>

        <div className="overflow-y-auto">
          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : isLoading || !payout ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-right">
                  <div className="font-bold text-ink">{payout.providerName}</div>
                  <div className="text-xs text-ink-soft">{PROVIDER_TYPE_LABELS[payout.providerType]}</div>
                </div>
                <PayoutStatusBadge status={payout.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <SummaryField
                  label={t('dashboard.adminPayouts.colPeriod')}
                  value={`${formatDate(payout.periodStart)} - ${formatDate(payout.periodEnd)}`}
                />
                <SummaryField label={t('dashboard.adminPayouts.details.createdAt')} value={formatDate(payout.createdAt)} />
                <SummaryField label={t('dashboard.adminPayouts.colSessions')} value={payout.sessionsCount} />
                <SummaryField label={t('dashboard.adminPayouts.details.sessionsTotal')} value={formatPrice(sum(sessionItems))} />
                <SummaryField label={t('dashboard.adminPayouts.details.settlementsTotal')} value={formatPrice(sum(settlementItems))} />
                <SummaryField label={t('dashboard.adminPayouts.details.deductions')} value={formatPrice(payout.deductions)} />
                <SummaryField label={t('dashboard.adminPayouts.details.paidAt')} value={formatDate(payout.paidAt)} />
                <SummaryField label={t('dashboard.adminPayouts.details.transferReference')} value={payout.transferReference} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <span className="text-sm font-bold text-ink">{t('dashboard.adminPayouts.details.netAmount')}</span>
                <span className="text-lg font-bold text-price">{formatPrice(payout.totalAmount)}</span>
              </div>

              {items.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-soft">{t('dashboard.adminPayouts.details.noItems')}</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-line">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="px-4 py-3 text-right font-bold text-ink">{t('dashboard.adminPayouts.details.colDate')}</th>
                        <th className="px-4 py-3 text-right font-bold text-ink">{t('dashboard.adminPayouts.details.colTitle')}</th>
                        <th className="px-4 py-3 text-right font-bold text-ink">{t('dashboard.adminPayouts.details.colType')}</th>
                        <th className="px-4 py-3 text-right font-bold text-ink">{t('dashboard.adminPayouts.details.colAttendance')}</th>
                        <th className="px-4 py-3 text-right font-bold text-ink">{t('dashboard.adminPayouts.colAmount')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {items.map((item, i) => (
                        <tr key={item.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                          <td className="px-4 py-3 text-right text-ink-soft">{formatDateTime(item.scheduledAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="font-semibold text-ink">{item.title ?? '—'}</div>
                            <div className="text-xs text-ink-soft">
                              {item.kind ? t(`dashboard.adminPayouts.details.kind.${item.kind}`) : ''}
                              {item.isMakeup ? ` · ${t('dashboard.adminPayouts.details.makeup')}` : ''}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-ink-soft">
                            {t(`dashboard.adminPayouts.details.itemType.${item.type}`)}
                          </td>
                          <td className="px-4 py-3 text-right text-ink-soft">
                            {item.attendanceOutcome
                              ? t(`dashboard.adminPayouts.details.outcome.${item.attendanceOutcome}`)
                              : '—'}
                            {item.payoutPercent != null && item.payoutPercent !== 100 ? ` (${item.payoutPercent}%)` : ''}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-price">{formatPrice(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
