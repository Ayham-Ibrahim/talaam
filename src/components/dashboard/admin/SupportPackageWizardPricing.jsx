import { useState } from 'react';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

const fieldLabel = (t) => (path) => {
  if (path === 'academic_supporter_id') return null;
  if (path === 'title') return t('dashboard.addSupportPackage.titleLabel');
  if (path === 'subject_ids') return t('dashboard.addSupportPackage.subjectLabel');
  if (path === 'price') return t('dashboard.addSupportPackage.priceLabel');
  if (path === 'supporter_profit_percent') return t('dashboard.addSupportPackage.supporterProfitPercentLabel');
  if (path === 'description') return t('dashboard.addSupportPackage.descriptionLabel');
  if (path === 'tier') return t('dashboard.addSupportPackage.tierLabel');
  if (path === 'purchases') return null;
  return path;
};

/** الخطوة الثانية (التسعير) — مشتركة بين إنشاء/تعديل باقة الدعم من لوحة الأدمن */
export function SupportPackageWizardPricing({ data, onChange, onBack, onSubmit, isPending, error, submitLabel, submittingLabel }) {
  const t = useT();
  const [touched, setTouched] = useState(false);

  const priceNumber = Number(data.price);
  const profitPercentNumber = Number(data.supporterProfitPercent);
  const invalidPrice = String(data.price).trim() === '' || !Number.isFinite(priceNumber) || priceNumber <= 0;
  const invalidProfitPercent =
    String(data.supporterProfitPercent).trim() === '' ||
    !Number.isFinite(profitPercentNumber) ||
    profitPercentNumber <= 0 ||
    profitPercentNumber > 100;
  const isValid = !invalidPrice && !invalidProfitPercent;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <ApiErrorList error={error} labelFor={fieldLabel(t)} />}

      <label className="flex flex-col gap-1.5 text-right">
        <span className="text-sm font-semibold text-ink">{t('dashboard.addSupportPackage.priceLabel')}</span>
        <input
          type="number"
          min="1"
          step="0.01"
          dir="ltr"
          value={data.price}
          onChange={(e) => onChange({ price: e.target.value })}
          placeholder={t('dashboard.addSupportPackage.pricePlaceholder')}
          className={`w-full rounded-btn border bg-surface p-3 text-left text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
            touched && invalidPrice ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
          }`}
        />
        {touched && invalidPrice && <span className="text-xs text-accent-pink">{t('dashboard.addSupportPackage.priceRequired')}</span>}
      </label>

      <label className="flex flex-col gap-1.5 text-right">
        <span className="text-sm font-semibold text-ink">{t('dashboard.addSupportPackage.supporterProfitPercentLabel')}</span>
        <input
          type="number"
          min="1"
          max="100"
          step="0.01"
          dir="ltr"
          value={data.supporterProfitPercent}
          onChange={(e) => onChange({ supporterProfitPercent: e.target.value })}
          placeholder={t('dashboard.addSupportPackage.supporterProfitPercentPlaceholder')}
          className={`w-full rounded-btn border bg-surface p-3 text-left text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
            touched && invalidProfitPercent ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
          }`}
        />
        {touched && invalidProfitPercent && (
          <span className="text-xs text-accent-pink">{t('dashboard.addSupportPackage.supporterProfitPercentRequired')}</span>
        )}
        {!invalidPrice && !invalidProfitPercent && (
          <span className="text-xs text-ink-soft" dir="ltr">
            {t('dashboard.addSupportPackage.supporterEarns')}: {((priceNumber * profitPercentNumber) / 100).toFixed(2)}
          </span>
        )}
      </label>

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
          disabled={isPending}
          onClick={handleSubmit}
          className="rounded-xl border-2 border-primary bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? submittingLabel : submitLabel}
        </button>
      </div>
    </div>
  );
}
