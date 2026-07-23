import { Check, CalendarClock, X as XIcon } from 'lucide-react';
import { RescheduleStatusBadge } from './RescheduleStatusBadge';
import { formatDateTime } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function RescheduleRequestsTable({ requests, onApprove, onApproveWithAlternative, onReject, isActing }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[920px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colTeacher')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colStudent')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminReschedule.colOriginal')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminReschedule.colProposed')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminReschedule.colWindow')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colStatus')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {requests.map((r, i) => (
            <tr key={r.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
              <td className="px-4 py-4 text-right font-semibold text-ink">{r.teacherName}</td>
              <td className="px-4 py-4 text-right text-ink-soft">{r.studentName}</td>
              <td className="px-4 py-4 text-right text-ink-soft" dir="ltr">
                {formatDateTime(r.originalScheduledAt)}
              </td>
              <td className="px-4 py-4 text-right text-ink-soft" dir="ltr">
                {formatDateTime(r.proposedScheduledAt)}
                {r.alternativeScheduledAt && (
                  <div className="text-xs text-price">{formatDateTime(r.alternativeScheduledAt)}</div>
                )}
              </td>
              <td className="px-4 py-4 text-right">
                <span
                  className={`rounded-pill px-3 py-1 text-xs font-bold ${
                    r.withinFreeWindow ? 'bg-success-light text-success' : 'bg-[#F2F2F7] text-ink-soft'
                  }`}
                >
                  {t(r.withinFreeWindow ? 'dashboard.adminReschedule.withinWindow' : 'dashboard.adminReschedule.outsideWindow')}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <RescheduleStatusBadge status={r.status} />
              </td>
              <td className="px-4 py-4 text-right">
                {r.status === 'pending' && (
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => onApprove(r)}
                      title={t('dashboard.adminReschedule.approve')}
                      className="flex items-center gap-1 text-sm font-medium text-success hover:opacity-70 disabled:opacity-50"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => onApproveWithAlternative(r)}
                      title={t('dashboard.adminReschedule.approveWithAlternative')}
                      className="flex items-center gap-1 text-sm font-medium text-primary hover:opacity-70 disabled:opacity-50"
                    >
                      <CalendarClock size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => onReject(r)}
                      title={t('dashboard.adminReschedule.reject')}
                      className="flex items-center gap-1 text-sm font-medium text-accent-pink hover:opacity-70 disabled:opacity-50"
                    >
                      <XIcon size={16} />
                    </button>
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
