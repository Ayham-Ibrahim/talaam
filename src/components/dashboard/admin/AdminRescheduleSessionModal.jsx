import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { formatDateTime } from '@/lib/formatters';
import { useAdminRescheduleSession } from '@/hooks/useAdminSessions';
import { useT } from '@/hooks/useT';

/** ISO → قيمة input[type=datetime-local] بتوقيت متصفح الأدمن (YYYY-MM-DDTHH:mm) */
function toLocalInputValue(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AdminRescheduleSessionModal({ session, onClose }) {
  const t = useT();
  const reschedule = useAdminRescheduleSession();
  const [value, setValue] = useState(() => toLocalInputValue(session.scheduledAt));
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);

  const isUnchanged = value === toLocalInputValue(session.scheduledAt);
  const isValid = value !== '' && !isUnchanged;

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid) return;
    reschedule.mutate(
      { sessionId: session.id, scheduledAt: new Date(value).toISOString(), notes: notes.trim() || undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminSessions.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminSessions.rescheduleTitle')}</h3>
          <span className="w-8" />
        </div>

        {reschedule.isError && (
          // رسائل الباك اند (تعارض، جلسة بدأت، حضور مسجّل...) واضحة بذاتها — بلا بادئة اسم الحقل
          <ApiErrorList error={reschedule.error} labelFor={() => null} className="mb-4" />
        )}

        <div className="mb-4 rounded-xl bg-surface p-3 text-right text-sm">
          <div className="font-semibold text-ink">{session.title ?? '—'}</div>
          <div className="mt-1 text-ink-soft">
            {t('dashboard.adminSessions.currentTime')}: <span dir="ltr">{formatDateTime(session.scheduledAt)}</span>
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">
            {t('dashboard.adminSessions.newTimeLabel')}
            <span className="font-normal text-ink-soft"> ({t('dashboard.adminSessions.localTimeHint')})</span>
          </span>
          <input
            type="datetime-local"
            dir="ltr"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
              touched && !isValid ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
            }`}
          />
          {touched && value === '' && <span className="text-xs text-accent-pink">{t('dashboard.adminSessions.newTimeRequired')}</span>}
          {touched && value !== '' && isUnchanged && (
            <span className="text-xs text-accent-pink">{t('dashboard.adminSessions.newTimeUnchanged')}</span>
          )}
        </label>

        <label className="mt-4 flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">
            {t('dashboard.adminSessions.notesLabel')}
            <span className="font-normal text-ink-soft"> ({t('dashboard.adminSessions.optional')})</span>
          </span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('dashboard.adminSessions.notesPlaceholder')}
            className="w-full resize-none rounded-btn border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <p className="mt-4 flex items-start gap-2 text-right text-xs text-ink-soft">
          <Info size={14} className="mt-0.5 shrink-0 text-primary" />
          {t('dashboard.adminSessions.rescheduleHint')}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.adminSessions.cancel')}
          </button>
          <button
            type="button"
            disabled={reschedule.isPending}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.adminSessions.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
