import { TEACHER_STATUS_STYLES } from '@/mocks/admin.mock';
import { useT } from '@/hooks/useT';

const STATUS_KEYS = {
  pending: 'statusPending',
  verified: 'statusVerified',
  rejected: 'statusRejected',
  suspended: 'statusSuspended',
};

export function TeacherStatusBadge({ status, className = '' }) {
  const t = useT();
  const style = TEACHER_STATUS_STYLES[status] ?? TEACHER_STATUS_STYLES.pending;

  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold ${className}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {t(`dashboard.adminTeachers.${STATUS_KEYS[status] ?? 'statusPending'}`)}
    </span>
  );
}
