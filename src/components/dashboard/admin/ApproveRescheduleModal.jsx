import { useState } from 'react';
import { X } from 'lucide-react';
import { useT } from '@/hooks/useT';

export function ApproveRescheduleModal({ isPending, onConfirm, onClose }) {
  const t = useT();
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = value !== '';

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid) return;
    onConfirm(new Date(value).toISOString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminReschedule.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminReschedule.alternativeModalTitle')}</h3>
          <span className="w-8" />
        </div>

        <label className="flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('dashboard.adminReschedule.alternativeTimeLabel')}</span>
          <input
            type="datetime-local"
            dir="ltr"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
              touched && !isValid ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
            }`}
          />
          {touched && !isValid && <span className="text-xs text-accent-pink">{t('dashboard.adminReschedule.alternativeTimeRequired')}</span>}
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.adminReschedule.cancel')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.adminReschedule.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
