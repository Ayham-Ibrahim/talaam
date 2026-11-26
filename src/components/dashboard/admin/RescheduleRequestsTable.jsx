import { Check, CalendarClock, Eye, X as XIcon } from 'lucide-react';
import { RescheduleStatusBadge } from './RescheduleStatusBadge';
import { formatDateTime } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

/**
 * مرحلة رد الطرف الآخر (المسار التلقائي) تحت حالة الطلب: بانتظار رده (للمتابعة فقط —
 * لا يحتاج قرار الإدارة بعد)، أو أُحيل للإدارة لأنه رفض/لم يرد، أو وافق فتأكد الموعد.
 * طلب بلا counterpartyResponse جاء للإدارة مباشرة (تبليغ غياب أو المسار التلقائي معطّل).
 */
function CounterpartyStage({ request, t }) {
  const response = request.counterpartyResponse;
  if (!response) return null;

  const otherParty = t(`dashboard.adminReschedule.otherParty.${request.requesterRole === 'student' ? 'teacher' : 'student'}`);
  const color = response === 'pending' ? 'text-[#FF8D28]' : response === 'accepted' ? 'text-success' : 'text-accent-pink';
  const deadline = response === 'pending' && request.counterpartyDeadline
    ? ` — ${formatDateTime(request.counterpartyDeadline, request.studentTimezone)}`
    : '';

  return (
    <div className={`mt-1 text-xs font-medium ${color}`}>
      {t(`dashboard.adminReschedule.counterparty.${response}`).replace('{party}', otherParty)}
      {deadline && <span dir="ltr">{deadline}</span>}
    </div>
  );
}

export function RescheduleRequestsTable({ requests, onView, onApprove, onApproveWithAlternative, onReject, isActing }) {
  const t = useT();
  const renderText = (value) => value || '—';
  // بتوقيت الطالب دوماً، لا بتوقيت متصفح الأدمن الذي يشاهد الجدول — الجلسة
  // والطلب كلاهما يخص جدول الطالب أصلاً بصرف النظر عمّن أرسل الطلب فعلياً.
  const renderDateTime = (value, timezone) => formatDateTime(value, timezone) || '—';

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[1080px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colTeacher')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colStudent')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminReschedule.colOriginal')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminReschedule.colProposed')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminReschedule.colCreated')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminReschedule.colHoursBefore')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colStatus')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminComplaints.colActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {requests.map((r, i) => (
            <tr key={r.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
              <td className="px-4 py-4 text-right font-semibold text-ink">{renderText(r.teacherName)}</td>
              <td className="px-4 py-4 text-right text-ink-soft">{renderText(r.studentName)}</td>
              <td className="px-4 py-4 text-right text-ink-soft" dir="ltr">
                {renderDateTime(r.originalScheduledAt, r.studentTimezone)}
              </td>
              <td className="px-4 py-4 text-right text-ink-soft" dir={r.proposedScheduledAt ? 'ltr' : 'rtl'}>
                {r.proposedScheduledAt ? (
                  renderDateTime(r.proposedScheduledAt, r.studentTimezone)
                ) : (
                  <span className="rounded-pill bg-accent-pink/10 px-2 py-0.5 text-xs font-bold text-accent-pink">
                    {t('dashboard.adminReschedule.absenceReport')}
                  </span>
                )}
                {r.alternativeScheduledAt && (
                  <div className="text-xs text-price" dir="ltr">{renderDateTime(r.alternativeScheduledAt, r.studentTimezone)}</div>
                )}
              </td>
              <td className="px-4 py-4 text-right text-ink-soft" dir="ltr">
                {renderDateTime(r.createdAt, r.studentTimezone)}
              </td>
              <td className="px-4 py-4 text-right">
                {r.hoursBeforeSession != null ? (
                  <span className="rounded-pill bg-[#F2F2F7] px-3 py-1 text-xs font-bold text-ink-soft">
                    {r.hoursBeforeSession} {t('dashboard.adminReschedule.detailsModal.hours')}
                  </span>
                ) : (
                  <span className="text-ink-soft">—</span>
                )}
              </td>
              <td className="px-4 py-4 text-right">
                <RescheduleStatusBadge status={r.status} />
                {/* makeup: "الموعد الأصلي" = الجلسة الفائتة (غاب المعلم)، والموافقة تُنشئ تعويضية */}
                {r.type === 'makeup' && (
                  <span className="mr-1 rounded-pill bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {t('dashboard.adminReschedule.makeupBadge')}
                  </span>
                )}
                <CounterpartyStage request={r} t={t} />
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onView(r)}
                    title={t('dashboard.adminReschedule.viewDetails')}
                    className="flex items-center gap-1 text-sm font-medium text-ink-soft hover:opacity-70"
                  >
                    <Eye size={16} />
                  </button>
                  {r.status === 'pending' && (
                    <>
                      {/* بلا موعد مقترح (تبليغ غياب) لا معنى للقبول البسيط — يجب على الأدمن
                          تحديد موعد بديل دوماً عبر "قبول بموعد بديل" (RescheduleService::approve يرفضه خلاف ذلك) */}
                      {r.proposedScheduledAt && (
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => onApprove(r)}
                          title={t('dashboard.adminReschedule.approve')}
                          className="flex items-center gap-1 text-sm font-medium text-success hover:opacity-70 disabled:opacity-50"
                        >
                          <Check size={16} />
                        </button>
                      )}
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
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
