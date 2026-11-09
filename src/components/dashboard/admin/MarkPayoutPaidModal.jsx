import { X } from 'lucide-react';
import { useT } from '@/hooks/useT';

export function MarkPayoutPaidModal({ isPending, error, onConfirm, onClose }) {
  const t = useT();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminPayouts.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminPayouts.markPaidModalTitle')}</h3>
          <span className="w-8" />
        </div>

        {error && (
          <div className="mb-4 rounded-btn bg-accent-pink/10 px-4 py-3 text-sm text-accent-pink">
            {error.errors?.status?.[0] ?? error.message}
          </div>
        )}

        <p className="text-center text-sm text-ink-soft">{t('dashboard.adminPayouts.markPaidConfirmText')}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.adminPayouts.cancel')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.adminPayouts.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
