import { RESCHEDULE_STATUS_STYLES } from '@/mocks/adminComplaints.mock';

export function RescheduleStatusBadge({ status, className = '' }) {
  const style = RESCHEDULE_STATUS_STYLES[status] ?? RESCHEDULE_STATUS_STYLES.pending;

  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold ${className}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}
