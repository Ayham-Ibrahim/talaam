import { ArrowUpCircle, CheckCircle2 } from 'lucide-react';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import { RESOLUTION_TYPE_LABELS } from '@/mocks/adminComplaints.mock';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function ComplaintsTable({ complaints, onResolve, onEscalate, isActing }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colStudent')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colTeacher')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colSubject')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colDate')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colStatus')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {complaints.map((c, i) => (
            <tr key={c.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
              <td className="px-4 py-4 text-right font-semibold text-ink">{c.studentName}</td>
              <td className="px-4 py-4 text-right text-ink-soft">{c.teacherName}</td>
              <td className="px-4 py-4 text-right text-ink-soft">{c.subjectName}</td>
              <td className="px-4 py-4 text-right text-ink-soft">{formatDate(c.createdAt)}</td>
              <td className="px-4 py-4 text-right">
                <ComplaintStatusBadge status={c.status} />
                {c.status === 'resolved' && c.resolutionType && (
                  <div className="mt-1 text-xs text-ink-soft">
                    {t('dashboard.adminComplaints.resolvedAs')} {RESOLUTION_TYPE_LABELS[c.resolutionType]}
                  </div>
                )}
              </td>
              <td className="px-4 py-4 text-right">
                {c.status !== 'resolved' && (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => onResolve(c)}
                      className="flex items-center gap-1.5 text-sm font-medium text-success hover:opacity-70 disabled:opacity-50"
                    >
                      {t('dashboard.adminComplaints.resolve')}
                      <CheckCircle2 size={16} />
                    </button>
                    {c.status !== 'escalated' && (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => onEscalate(c)}
                        className="flex items-center gap-1.5 text-sm font-medium text-accent-pink hover:opacity-70 disabled:opacity-50"
                      >
                        {t('dashboard.adminComplaints.escalate')}
                        <ArrowUpCircle size={16} />
                      </button>
                    )}
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
