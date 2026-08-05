import { useState } from 'react';
import { X } from 'lucide-react';
import { useT } from '@/hooks/useT';

function toLocalIsoDateTime(date, time) {
  if (!date || !time) return null;
  return `${date}T${time}:00`;
}

/**
 * لا يوجد مسار تلقائي لتغيير المواعيد — كل طلب يبدأ pending وينتظر قرار
 * الأدمن (approve/reject) صراحةً، بصرف النظر عن السبب. السبب إلزامي فقط إذا
 * كان الموعد المقترح أقرب من نافذة التغيير المرنة (24 ساعة افتراضياً)، لذا
 * نطلبه هنا دائماً لتبسيط الأمر بدل التحقق من الإعداد على الواجهة.
 */
export function RescheduleRequestModal({ isPending, error, onConfirm, onClose }) {
  const t = useT();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = Boolean(date && time);

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid) return;
    onConfirm({ proposedScheduledAt: toLocalIsoDateTime(date, time), reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
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

        {error && (
          <div className="mb-4 rounded-btn bg-accent-pink/10 px-4 py-3 text-sm text-accent-pink">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.rescheduleModal.dateLabel')}</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                touched && !date ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
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
                touched && !time ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
          </label>
        </div>
        {touched && !isValid && (
          <span className="mt-1.5 block text-xs text-accent-pink">{t('dashboard.rescheduleModal.dateTimeRequired')}</span>
        )}

        <label className="mt-4 flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('dashboard.rescheduleModal.reasonLabel')}</span>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('dashboard.rescheduleModal.reasonPlaceholder')}
            className="w-full resize-none rounded-btn border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
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
