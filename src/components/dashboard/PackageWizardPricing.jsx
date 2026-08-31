import { useState } from 'react';
import { Info } from 'lucide-react';
import { useT } from '@/hooks/useT';

/**
 * The teacher only ever sets their own price. Platform margin, student price,
 * and platform revenue are computed by the admin at approval time — showing
 * any of them here would leak a figure that doesn't exist yet and violates the
 * backend's explicit policy (TeacherPackageResource excludes them entirely).
 */
export function PackageWizardPricing({ data, onChange, onNext, onBack, serverErrors }) {
  const t = useT();
  const [touched, setTouched] = useState(false);

  const isValid = data.teacher_price !== '' && Number(data.teacher_price) > 0;
  const priceError = serverErrors?.teacher_price?.[0] ?? (touched && !isValid ? t('dashboard.addPackage.priceRequired') : null);

  const handleNext = () => {
    setTouched(true);
    if (!isValid) return;
    onNext();
  };

  return (
    <div className="mt-8 flex flex-col items-end gap-6">
      <div className="flex w-full flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-primary">{t('dashboard.addPackage.priceLabel')}</label>
        <input
          type="number"
          min="0"
          max="100000"
          dir="ltr"
          value={data.teacher_price}
          onChange={(e) => onChange({ teacher_price: e.target.value })}
          placeholder={t('dashboard.addPackage.pricePlaceholder')}
          aria-invalid={!!priceError}
          className={`w-full rounded-lg border bg-white px-3 py-3 text-left text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none ${
            priceError ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
          }`}
        />
        {priceError && <p className="text-xs text-accent-pink">{priceError}</p>}
        {isValid && Number(data.sessions_count) > 0 && (
          <span className="text-xs text-ink-soft" dir="ltr">
            {data.teacher_price} × {data.sessions_count} = {(Number(data.teacher_price) * Number(data.sessions_count)).toFixed(2)}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary-light/40 p-5">
        <Info size={20} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-sm text-ink">{t('dashboard.addPackage.priceHourlyHint')}</p>
        <p className="text-sm text-ink">{t('dashboard.addPackage.pricingPolicyHint')}</p>
      </div>

      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-line px-8 py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
        >
          {t('dashboard.addPackage.back')}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-xl border-2 border-primary bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {t('dashboard.addPackage.next')}
        </button>
      </div>
    </div>
  );
}
