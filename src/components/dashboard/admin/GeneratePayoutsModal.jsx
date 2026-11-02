import { X } from 'lucide-react';
import { useT } from '@/hooks/useT';

/**
 * تأكيد توليد المستحقات لكل المعلمين (POST /payouts/generate) — بلا فترة: كشف لكل معلم بكل
 * مستحقاته غير المصروفة حتى لحظة الضغط. ضغطة ثانية لا تُكرر ما صُرف، فالنتيجة تُعرض هنا.
 */
export function GeneratePayoutsModal({ isPending, error, result, onConfirm, onClose }) {
  const t = useT();
  const errorMessage = error?.message;

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
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminPayouts.generateModalTitle')}</h3>
          <span className="w-8" />
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-btn bg-accent-pink/10 px-4 py-3 text-sm text-accent-pink">{errorMessage}</div>
        )}

        {result ? (
          <>
            <div className="rounded-btn bg-primary/10 px-4 py-3 text-right text-sm text-ink">
              {result.created > 0
                ? t('dashboard.adminPayouts.generateResult').replace('{count}', result.created)
                : t('dashboard.adminPayouts.generateNothing')}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t('dashboard.adminPayouts.close')}
            </button>
          </>
        ) : (
          <>
            <p className="text-right text-sm text-ink-soft">{t('dashboard.adminPayouts.generateHint')}</p>

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
                {isPending ? t('dashboard.adminPayouts.generating') : t('dashboard.adminPayouts.confirmGenerate')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
