import { COMPLAINT_STATUS_STYLES } from '@/mocks/adminComplaints.mock';

export function ComplaintStatusBadge({ status, className = '' }) {
  const style = COMPLAINT_STATUS_STYLES[status] ?? COMPLAINT_STATUS_STYLES.open;

  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold ${className}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}
