import { useState } from 'react';
import { X } from 'lucide-react';
import { ELIGIBLE_PAYOUT_PROVIDERS } from '@/mocks/adminPayouts.mock';
import { PROVIDER_TYPE_LABELS } from '@/mocks/adminListings.mock';
import { formatPrice } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function GeneratePayoutModal({ isPending, onConfirm, onClose }) {
  const t = useT();
  const [providerId, setProviderId] = useState('');
  const [touched, setTouched] = useState(false);

  const provider = ELIGIBLE_PAYOUT_PROVIDERS.find((p) => p.id === Number(providerId));
  const isValid = providerId !== '';

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid) return;
    onConfirm(Number(providerId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
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
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminPayouts.generateModalTitle')}</h3>
          <span className="w-8" />
        </div>

        <label className="flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('dashboard.adminPayouts.providerLabel')}</span>
          <select
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            className={`w-full appearance-none rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
              touched && !isValid ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
            }`}
          >
            <option value="">—</option>
            {ELIGIBLE_PAYOUT_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {PROVIDER_TYPE_LABELS[p.type]}
              </option>
            ))}
          </select>
          {touched && !isValid && <span className="text-xs text-accent-pink">{t('dashboard.adminPayouts.providerRequired')}</span>}
        </label>

        {provider && (
          <div className="mt-4 flex flex-col gap-2 rounded-xl bg-[#FAFBFD] p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">{provider.sessionsCount}</span>
              <span className="text-sm text-ink-soft">{t('dashboard.adminPayouts.colSessions')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-price">{formatPrice(provider.sessionsCount * provider.amountPerSession)}</span>
              <span className="text-sm text-ink-soft">{t('dashboard.adminPayouts.colAmount')}</span>
            </div>
          </div>
        )}

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
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.adminPayouts.generate')}
          </button>
        </div>
      </div>
    </div>
  );
}
