import { LISTING_STATUS_STYLES } from '@/mocks/adminListings.mock';

export function ListingStatusBadge({ status, className = '' }) {
  const style = LISTING_STATUS_STYLES[status] ?? LISTING_STATUS_STYLES.submitted;

  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold ${className}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}
