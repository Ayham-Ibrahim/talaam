import { useT } from '@/hooks/useT';

const STATUS_STYLES = {
  active: { bg: '#E3F5EC', color: '#2E9E6B' },
  suspended: { bg: '#FDEFF2', color: '#B00852' },
};

export function AcademicSupporterStatusBadge({ status, className = '' }) {
  const t = useT();
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.active;

  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold ${className}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {t(`dashboard.adminAcademicSupporters.status${status === 'suspended' ? 'Suspended' : 'Active'}`)}
    </span>
  );
}
