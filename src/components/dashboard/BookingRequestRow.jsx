import { useState } from 'react';
import { CalendarClock, Check, Clock, X } from 'lucide-react';
import { ApiErrorList, Avatar } from '@/components/ui';
import { useT } from '@/hooks/useT';
import { formatDate, formatDateTime } from '@/lib/formatters';

/**
 * صف طلب حجز بانتظار موافقة المعلم — مشترك بين صفحة "طلبات الحجز" وقائمة "مطلوب منك".
 * deadline (اختياري): عدّاد حتى أقرب موعد مطلوب، إذ يبطل الطلب كله بمروره.
 */
export function BookingRequestRow({ request, onApprove, onReject, isPending, error, deadline = null }) {
  const t = useT();
  const [reason, setReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar name={request.studentName} src={request.studentAvatar} size="md" />
          <div className="text-right">
            <div className="text-sm font-semibold text-ink">{request.studentName}</div>
            <div className="text-xs text-ink-soft">{request.packageTitle}</div>
          </div>
        </div>

        {deadline && (
          <span
            className={`inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-bold ${
              deadline.urgent ? 'bg-accent-pink/10 text-accent-pink' : 'bg-[#F5A623]/15 text-[#B7791F]'
            }`}
          >
            <Clock size={13} />
            {deadline.text}
          </span>
        )}

        <div className="flex flex-col items-end gap-1 text-sm text-ink">
          {request.requestedSlots.map((slot, i) => (
            <div key={i} className="flex items-center gap-2">
              {request.requestedSlots.length > 1 && (
                <span className="text-xs font-bold text-primary">
                  {t('dashboard.bookingRequests.sessionLabel')} {i + 1}
                </span>
              )}
              {formatDate(slot.date)} · {slot.start_time?.slice(0, 5)}
              <CalendarClock size={16} className="text-ink-soft" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onApprove(request.id)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            <Check size={15} />
            {t('dashboard.bookingRequests.approve')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowRejectForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-[#FF383C] bg-[#FDF0F0] px-4 py-2.5 text-sm text-[#FF383C] hover:bg-[#FF383C]/10 disabled:opacity-50"
          >
            <X size={15} />
            {t('dashboard.bookingRequests.reject')}
          </button>
        </div>
      </div>

      {/* حتى يعرف المعلم لأي باقة ومن الطالب صاحب الطلب دون فتحه — الاسم
          والعنوان وحدهما لا يكفيان عند تراكم عدة طلبات لنفس الباقة أو لنفس
          الطالب في نفس اليوم. */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-ink-soft">
        {request.subject && (
          <span>
            {t('dashboard.bookingRequests.subjectLabel')}: {request.subject}
          </span>
        )}
        <span>
          {t('dashboard.bookingRequests.requestedAtLabel')}: {formatDateTime(request.createdAt)}
        </span>
      </div>

      {/* كان فشل الموافقة/الرفض (تعارض جدول، حالة تغيّرت...) صامتاً تماماً من
          منظور المعلم — الخطأ يصل من الباك اند برسالة عربية واضحة ومحدَّدة
          (راجع ScheduleConflictService) لكن لا شيء كان يعرضها على الشاشة. */}
      {error && (
        <div className="border-t border-line pt-3">
          <ApiErrorList error={error} labelFor={() => null} />
        </div>
      )}

      {showRejectForm && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('dashboard.bookingRequests.reasonPlaceholder')}
            className="min-w-[200px] flex-1 rounded-lg border border-[#E3E3E3] px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => onReject(request.id, reason)}
            className="rounded-xl bg-[#FF383C] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.bookingRequests.confirmReject')}
          </button>
        </div>
      )}
    </div>
  );
}
