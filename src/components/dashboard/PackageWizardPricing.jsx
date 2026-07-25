import { useState } from 'react';
import { calculateStudentPrice, DEFAULT_MARGIN_PERCENT } from '@/lib/pricing';
import { useT } from '@/hooks/useT';

export function PackageWizardPricing({ data, onChange, onNext, onBack }) {
  const t = useT();
  const [touched, setTouched] = useState(false);

  const priceNumber = Number(data.teacherPrice);
  const isValid = data.teacherPrice !== '' && priceNumber > 0;
  const preview = isValid ? calculateStudentPrice(priceNumber, DEFAULT_MARGIN_PERCENT) : null;

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
          dir="ltr"
          value={data.teacherPrice}
          onChange={(e) => onChange({ teacherPrice: e.target.value })}
          placeholder={t('dashboard.addPackage.pricePlaceholder')}
          className={`w-full rounded-lg border bg-white px-3 py-3 text-left text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none ${
            touched && !isValid ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
          }`}
        />
      </div>

      <div className="flex w-full flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-ink">
          {t('dashboard.addPackage.finalPriceLabel')}{' '}
          <span className="font-normal text-ink-soft">({t('dashboard.addPackage.finalPriceHint')})</span>
        </label>
        <div className="w-full rounded-lg border border-[#E3E3E3] bg-[#F7F8FA] px-3 py-3 text-right text-lg font-bold text-ink" dir="ltr">
          {preview ? `$${preview.studentPrice}` : '—'}
        </div>
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
