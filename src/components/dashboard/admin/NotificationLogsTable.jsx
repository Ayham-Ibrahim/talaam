import { NOTIFICATION_LOG_STATUS_STYLES, NOTIFICATION_LOG_CHANNEL_LABELS } from '@/mocks/adminNotificationLogs.mock';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

function StatusBadge({ status }) {
  const style = NOTIFICATION_LOG_STATUS_STYLES[status] ?? NOTIFICATION_LOG_STATUS_STYLES.queued;
  return (
    <span
      className="inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}

export function NotificationLogsTable({ logs }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminNotificationLogs.colRecipient')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminNotificationLogs.colEvent')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminNotificationLogs.colChannel')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminNotificationLogs.colDate')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminNotificationLogs.colStatus')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {logs.map((log, i) => (
            <tr key={log.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
              <td className="px-4 py-4 text-right">
                <div className="font-semibold text-ink">{log.recipientName ?? '—'}</div>
                <div className="text-xs text-ink-soft" dir="ltr">{log.recipientEmail}</div>
              </td>
              <td className="px-4 py-4 text-right text-ink-soft" dir="ltr">{log.event}</td>
              <td className="px-4 py-4 text-right text-ink-soft">{NOTIFICATION_LOG_CHANNEL_LABELS[log.channel] ?? log.channel}</td>
              <td className="px-4 py-4 text-right text-ink-soft">{formatDate(log.createdAt)}</td>
              <td className="px-4 py-4 text-right">
                <StatusBadge status={log.status} />
                {log.status === 'failed' && log.error && (
                  <div className="mt-1 max-w-[220px] truncate text-xs text-accent-pink" title={log.error}>
                    {log.error}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
