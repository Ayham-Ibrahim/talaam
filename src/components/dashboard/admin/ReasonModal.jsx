import { useState } from 'react';
import { X } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

/**
 * Generic "confirm with a mandatory reason" modal — used for rejecting a
 * teacher, rejecting a document, and suspending a teacher. Every sensitive
 * admin action on the backend requires a reason for the audit log.
 */
/** 500 mirrors the backend cap shared by every reason field this modal is used for (reject/suspend/document-reject/reschedule-reject/hide-review). */
export function ReasonModal({ titleKey, isPending, error, maxLength = 500, onConfirm, onClose }) {
  const t = useT();
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const reasonKey = 'dashboard.reasonModal';

  const trimmed = reason.trim();
  const isValid = trimmed.length > 0;

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid) return;
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t(`${reasonKey}.cancel`)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t(`${reasonKey}.${titleKey}`)}</h3>
          <span className="w-8" />
        </div>

        {error && <ApiErrorList error={error} labelFor={() => t(`${reasonKey}.reasonLabel`)} className="mb-4" />}

        <label className="flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t(`${reasonKey}.reasonLabel`)}</span>
          <span className="text-xs text-ink-soft">{t(`${reasonKey}.reasonHint`)}</span>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t(`${reasonKey}.reasonPlaceholder`)}
            maxLength={maxLength}
            className={`w-full resize-none rounded-btn border bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
              touched && !isValid ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
            }`}
          />
          <div className="text-left text-xs text-ink-soft/70">{reason.length}/{maxLength}</div>
          {touched && !isValid && <span className="text-xs text-accent-pink">{t(`${reasonKey}.reasonRequired`)}</span>}
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t(`${reasonKey}.cancel`)}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-accent-pink py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t(`${reasonKey}.confirm`)}
          </button>
        </div>
      </div>
    </div>
  );
}
