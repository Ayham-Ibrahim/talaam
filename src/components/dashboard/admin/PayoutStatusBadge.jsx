import { PAYOUT_STATUS_STYLES } from '@/mocks/adminPayouts.mock';

export function PayoutStatusBadge({ status, className = '' }) {
  const style = PAYOUT_STATUS_STYLES[status] ?? PAYOUT_STATUS_STYLES.pending;

  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold ${className}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}
