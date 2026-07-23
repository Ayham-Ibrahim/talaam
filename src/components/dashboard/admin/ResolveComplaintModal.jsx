import { useState } from 'react';
import { X } from 'lucide-react';
import { RESOLUTION_TYPE_LABELS } from '@/mocks/adminComplaints.mock';
import { useT } from '@/hooks/useT';

export function ResolveComplaintModal({ isPending, onConfirm, onClose }) {
  const t = useT();
  const [resolutionType, setResolutionType] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = resolutionType !== '';

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid) return;
    onConfirm(resolutionType, note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminComplaints.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminComplaints.resolveModalTitle')}</h3>
          <span className="w-8" />
        </div>

        <label className="flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('dashboard.adminComplaints.resolutionTypeLabel')}</span>
          <select
            value={resolutionType}
            onChange={(e) => setResolutionType(e.target.value)}
            className={`w-full appearance-none rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
              touched && !isValid ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
            }`}
          >
            <option value="">—</option>
            {Object.entries(RESOLUTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {touched && !isValid && <span className="text-xs text-accent-pink">{t('dashboard.adminComplaints.resolutionTypeRequired')}</span>}
        </label>

        <label className="mt-4 flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('dashboard.adminComplaints.noteLabel')}</span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('dashboard.adminComplaints.notePlaceholder')}
            className="w-full resize-none rounded-btn border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.adminComplaints.cancel')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-success py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.adminComplaints.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
