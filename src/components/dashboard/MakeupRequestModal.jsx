import { useState } from 'react';
import { X } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCreateMakeupRequest, useRescheduleMinHoursAhead } from '@/hooks/useReschedule';
import { formatDateTime } from '@/lib/formatters';
import { zonedWallTimeToUtcIso } from '@/lib/zonedDateTime';
import { useT } from '@/hooks/useT';

/**
 * اقتراح موعد جلسة تعويضية لجلسة فائتة غاب عنها المعلم (السياسة: تعويض مجاني لغياب المعلم).
 * يُرسل للطرف الآخر: موافقته تُنشئ التعويضية فوراً، ورفضه أو عدم رده يحيله للإدارة.
 * الموعد بتوقيت المستخدم نفسه (zonedWallTimeToUtcIso) — نفس RescheduleRequestModal.
 */
export function MakeupRequestModal({ sessionId, missedScheduledAt, onClose, onDone }) {
  const t = useT();
  const { user } = useAuth();
  const createRequest = useCreateMakeupRequest();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const minHoursAhead = useRescheduleMinHoursAhead();

  const proposedScheduledAt = zonedWallTimeToUtcIso(date, time, user?.timezone);
  const proposedAtMs = proposedScheduledAt ? new Date(proposedScheduledAt).getTime() : NaN;
  const validationError = !date || !time
    ? t('dashboard.rescheduleModal.dateTimeRequired')
    : !Number.isFinite(proposedAtMs) || proposedAtMs <= Date.now()
      ? t('dashboard.rescheduleModal.dateTimeFuture')
      : proposedAtMs < Date.now() + minHoursAhead * 60 * 60 * 1000
        ? t('dashboard.rescheduleModal.dateTimeMinAhead').replace('{hours}', minHoursAhead)
        : null;
  const dateTimeError = touched ? validationError : null;

  const handleConfirm = () => {
    setTouched(true);
    if (validationError) return;
    createRequest.mutate(
      { sessionId, proposedScheduledAt, reason: reason.trim() },
      { onSuccess: (result) => onDone?.(result?.message) },
    );
  };

  const inputClass = `w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
    dateTimeError ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-right text-lg font-bold text-ink">{t('dashboard.makeupRequest.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.makeupRequest.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-2 text-right text-sm text-ink-soft">{t('dashboard.makeupRequest.hint')}</p>
        {missedScheduledAt && (
          <p className="mb-4 text-right text-sm">
            <span className="text-ink-soft">{t('dashboard.makeupRequest.missedSession')}: </span>
            <span className="font-semibold text-ink" dir="ltr">{formatDateTime(missedScheduledAt, user?.timezone)}</span>
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.rescheduleModal.dateLabel')}</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.rescheduleModal.timeLabel')}</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
          </label>
        </div>
        {dateTimeError && <span className="mt-1.5 block text-xs text-accent-pink">{dateTimeError}</span>}

        <label className="mt-4 flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('dashboard.makeupRequest.noteLabel')}</span>
          <textarea
            rows={2}
            value={reason}
            maxLength={1000}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('dashboard.makeupRequest.notePlaceholder')}
            className="w-full resize-none rounded-btn border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <ApiErrorList error={createRequest.error} className="mt-4" />

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.makeupRequest.cancel')}
          </button>
          <button
            type="button"
            disabled={createRequest.isPending}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {createRequest.isPending ? t('dashboard.makeupRequest.sending') : t('dashboard.makeupRequest.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
