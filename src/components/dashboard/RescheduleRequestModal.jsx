import { useState } from 'react';
import { X } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { zonedWallTimeToUtcIso } from '@/lib/zonedDateTime';

function getFirstFieldError(error, field) {
  const messages = error?.errors?.[field];
  return Array.isArray(messages) && messages.length > 0 ? messages[0] : null;
}

function isReasonRequired(currentScheduledAt) {
  if (!currentScheduledAt) return false;

  const scheduledAtMs = new Date(currentScheduledAt).getTime();
  if (!Number.isFinite(scheduledAtMs)) return false;

  return scheduledAtMs - Date.now() > 24 * 60 * 60 * 1000;
}

/**
 * لا يوجد مسار تلقائي لتغيير المواعيد — كل طلب يبدأ pending وينتظر قرار
 * الأدمن (approve/reject) صراحةً. إذا كانت الجلسة الأصلية ما تزال أبعد من
 * نافذة التغيير المجانية، فالسبب يصبح إلزامياً حسب سياسة الباك إند.
 */
export function RescheduleRequestModal({ isPending, error, currentScheduledAt, onConfirm, onClose }) {
  const t = useT();
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  // بتوقيت المستخدم الحالي نفسه (من أرسل الطلب، طالباً كان أو معلماً) — لا
  // بتوقيت UTC ولا بأي منطقة أخرى، وإلا يُحفَظ موعد مُزاح فعلياً بفارق التوقيت
  // الكامل عن الوقت الذي اختاره هو تحديداً (انظر توثيق zonedWallTimeToUtcIso).
  const proposedScheduledAt = zonedWallTimeToUtcIso(date, time, user?.timezone);
  const proposedAtMs = proposedScheduledAt ? new Date(proposedScheduledAt).getTime() : NaN;
  const missingDateTime = !date || !time;
  const invalidPastDateTime = !missingDateTime && (!Number.isFinite(proposedAtMs) || proposedAtMs <= Date.now());
  const reasonIsRequired = isReasonRequired(currentScheduledAt);
  const missingReason = reasonIsRequired && reason.trim() === '';

  const proposedDateTimeError =
    (touched && missingDateTime && t('dashboard.rescheduleModal.dateTimeRequired')) ||
    (touched && invalidPastDateTime && t('dashboard.rescheduleModal.dateTimeFuture')) ||
    getFirstFieldError(error, 'proposed_scheduled_at');
  const reasonError = (touched && missingReason && t('dashboard.rescheduleModal.reasonRequired')) || getFirstFieldError(error, 'reason');
  const showApiSummary = error && !proposedDateTimeError && !reasonError;
  const isValid = !missingDateTime && !invalidPastDateTime && !missingReason;

  const rescheduleFieldLabel = (path) => {
    if (path === 'proposed_scheduled_at') return t('dashboard.rescheduleModal.dateTimeLabel');
    if (path === 'reason') return t('dashboard.rescheduleModal.reasonLabel');
    return path;
  };

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid) return;
    onConfirm({ proposedScheduledAt, reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.rescheduleModal.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.rescheduleModal.title')}</h3>
          <span className="w-8" />
        </div>

        <p className="mb-4 text-sm text-ink-soft">{t('dashboard.rescheduleModal.hint')}</p>

        {showApiSummary && <ApiErrorList error={error} labelFor={rescheduleFieldLabel} className="mb-4" />}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.rescheduleModal.dateLabel')}</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                proposedDateTimeError ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.rescheduleModal.timeLabel')}</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                proposedDateTimeError ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
          </label>
        </div>
        {proposedDateTimeError && <span className="mt-1.5 block text-xs text-accent-pink">{proposedDateTimeError}</span>}

        <label className="mt-4 flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('dashboard.rescheduleModal.reasonLabel')}</span>
          <span className="text-xs text-ink-soft">
            {reasonIsRequired ? t('dashboard.rescheduleModal.reasonHintRequired') : t('dashboard.rescheduleModal.reasonHintOptional')}
          </span>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('dashboard.rescheduleModal.reasonPlaceholder')}
            className={`w-full resize-none rounded-btn border bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
              reasonError ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
            }`}
          />
          {reasonError && <span className="text-xs text-accent-pink">{reasonError}</span>}
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.rescheduleModal.cancel')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? t('dashboard.rescheduleModal.submitting') : t('dashboard.rescheduleModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
