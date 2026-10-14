import { formatPrice } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

const STATUS_STYLES = {
  pending_approval: { bg: '#FEF3E2', color: '#B7791F' },
  active: { bg: '#E3F5EC', color: '#2E9E6B' },
  rejected: { bg: '#FDEFF2', color: '#B00852' },
  disabled: { bg: '#F2F2F7', color: '#6B7280' },
};

export function TeacherSupportPackagesTable({ supportPackages = [] }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-line text-right">
            {['tier', 'subject', 'price', 'status', 'rejectionReason'].map((col) => (
              <th key={col} className="px-4 py-3 font-bold text-ink">
                {t(`dashboard.teacherSupportPackages.cols.${col}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {supportPackages.map((sp) => {
            const style = STATUS_STYLES[sp.status] ?? STATUS_STYLES.disabled;
            return (
              <tr key={sp.id} className="text-right">
                <td className="px-4 py-3 font-semibold text-ink">
                  {t(`dashboard.teacherSupportPackages.tier${sp.tier === 'premium' ? 'Premium' : 'Basic'}`)}
                </td>
                <td className="px-4 py-3 text-ink-soft">{sp.subject ?? '—'}</td>
                <td className="px-4 py-3 font-semibold text-price">{formatPrice(sp.student_price, sp.currency)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-pill px-3 py-1 text-xs font-bold" style={{ background: style.bg, color: style.color }}>
                    {t(`dashboard.teacherSupportPackages.statuses.${sp.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-ink-soft">{sp.rejection_reason ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
