import { AUDIT_ACTION_LABELS } from '@/mocks/adminAuditLog.mock';
import { formatDateTime } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function AuditLogTable({ entries }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminAuditLog.colAction')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminAuditLog.colTarget')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminAuditLog.colAdmin')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminAuditLog.colDate')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {entries.map((entry, i) => (
            <tr key={entry.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
              <td className="px-4 py-4 text-right">
                <span className="rounded-pill bg-primary-light px-3 py-1 text-xs font-bold text-primary">
                  {AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
                </span>
              </td>
              <td className="px-4 py-4 text-right text-ink-soft">{entry.targetLabel}</td>
              <td className="px-4 py-4 text-right text-ink-soft">{entry.adminName}</td>
              <td className="px-4 py-4 text-right text-ink-soft" dir="ltr">
                {formatDateTime(entry.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
