import { useState } from 'react';
import { Info } from 'lucide-react';
import { useT } from '@/hooks/useT';

/** Same pricing policy as packages: the center only sets its own price — margin/final price come from the admin at approval */
export function CourseWizardPricing({ data, onChange, onNext, onBack }) {
  const t = useT();
  const [touched, setTouched] = useState(false);

  const isHourly = data.pricing_mode === 'hourly';
  const isValid =
    data.provider_price !== '' &&
    Number(data.provider_price) > 0 &&
    (!isHourly || (data.total_hours !== '' && Number(data.total_hours) > 0));

  const handleNext = () => {
    setTouched(true);
    if (!isValid) return;
    onNext();
  };

  return (
    <div className="mt-8 flex flex-col items-end gap-6">
      <div className="flex w-full flex-col items-start gap-1.5">
        <span className="text-sm font-semibold text-primary">{t('dashboard.addCourse.pricingModeLabel')}</span>
        <div className="grid w-full grid-cols-2 gap-3">
          {['total', 'hourly'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ pricing_mode: mode })}
              className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                data.pricing_mode === mode ? 'border-primary bg-primary text-white' : 'border-line text-ink hover:bg-line/30'
              }`}
            >
              {t(mode === 'total' ? 'dashboard.addCourse.pricingModeTotal' : 'dashboard.addCourse.pricingModeHourly')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-primary">
          {t(isHourly ? 'dashboard.addCourse.priceLabelHourly' : 'dashboard.addCourse.priceLabel')}
        </label>
        <input
          type="number"
          min="0"
          max="100000"
          dir="ltr"
          value={data.provider_price}
          onChange={(e) => onChange({ provider_price: e.target.value })}
          placeholder={t('dashboard.addPackage.pricePlaceholder')}
          className={`w-full rounded-lg border bg-white px-3 py-3 text-left text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none ${
            touched && (data.provider_price === '' || Number(data.provider_price) <= 0) ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
          }`}
        />
      </div>

      {isHourly && (
        <div className="flex w-full flex-col items-start gap-1.5">
          <label className="text-sm font-semibold text-primary">{t('dashboard.addCourse.totalHoursLabel')}</label>
          <input
            type="number"
            min="1"
            max="2000"
            dir="ltr"
            value={data.total_hours}
            onChange={(e) => onChange({ total_hours: e.target.value })}
            className={`w-full rounded-lg border bg-white px-3 py-3 text-left text-sm text-ink focus:outline-none ${
              touched && (data.total_hours === '' || Number(data.total_hours) <= 0) ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
            }`}
          />
          {Number(data.provider_price) > 0 && Number(data.total_hours) > 0 && (
            <span className="text-xs text-ink-soft" dir="ltr">
              {data.provider_price} × {data.total_hours} = {(Number(data.provider_price) * Number(data.total_hours)).toFixed(2)}
            </span>
          )}
          <p className="text-xs text-ink-soft">{t('dashboard.addCourse.totalHoursHint')}</p>
        </div>
      )}

      <label className="flex w-full items-center justify-end gap-2 text-sm font-semibold text-ink">
        {t('dashboard.addCourse.hasCertificateLabel')}
        <input
          type="checkbox"
          checked={data.has_certificate}
          onChange={(e) => onChange({ has_certificate: e.target.checked })}
          className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30"
        />
      </label>

      {data.has_certificate && (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-start gap-1.5">
            <label className="text-sm font-semibold text-primary">{t('dashboard.addCourse.certificateTypeLabel')}</label>
            <input
              type="text"
              value={data.certificate_type}
              onChange={(e) => onChange({ certificate_type: e.target.value })}
              className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3 py-3 text-right text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <label className="text-sm font-semibold text-primary">{t('dashboard.addCourse.certificateIssuerLabel')}</label>
            <input
              type="text"
              value={data.certificate_issuer}
              onChange={(e) => onChange({ certificate_issuer: e.target.value })}
              className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3 py-3 text-right text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="flex w-full flex-col items-start gap-3 rounded-2xl border border-line bg-white p-4">
        <p className="text-sm font-bold text-ink">{t('dashboard.addCourse.courseFactsTitle')}</p>
        <p className="text-xs text-ink-soft">{t('dashboard.addCourse.courseFactsHint')}</p>

        <label className="flex w-full items-center justify-end gap-2 text-sm font-semibold text-ink">
          {t('dashboard.addCourse.requiresLaptopLabel')}
          <input
            type="checkbox"
            checked={data.requires_laptop}
            onChange={(e) => onChange({ requires_laptop: e.target.checked })}
            className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30"
          />
        </label>
        <label className="flex w-full items-center justify-end gap-2 text-sm font-semibold text-ink">
          {t('dashboard.addCourse.materialsIncludedLabel')}
          <input
            type="checkbox"
            checked={data.materials_included}
            onChange={(e) => onChange({ materials_included: e.target.checked })}
            className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30"
          />
        </label>
        <label className="flex w-full items-center justify-end gap-2 text-sm font-semibold text-ink">
          {t('dashboard.addCourse.hasPracticalExercisesLabel')}
          <input
            type="checkbox"
            checked={data.has_practical_exercises}
            onChange={(e) => onChange({ has_practical_exercises: e.target.checked })}
            className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30"
          />
        </label>
        <label className="flex w-full items-center justify-end gap-2 text-sm font-semibold text-ink">
          {t('dashboard.addCourse.sessionsRecordedLabel')}
          <input
            type="checkbox"
            checked={data.sessions_recorded}
            onChange={(e) => onChange({ sessions_recorded: e.target.checked })}
            className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30"
          />
        </label>
      </div>

      <div className="flex w-full flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-primary">{t('dashboard.addCourse.prerequisitesLabel')}</label>
        <div className="w-full rounded-lg border border-[#E3E3E3] px-3 py-2.5">
          <textarea
            value={data.prerequisites}
            onChange={(e) => onChange({ prerequisites: e.target.value.slice(0, 2000) })}
            rows={2}
            className="w-full resize-none bg-transparent text-right text-sm text-ink outline-none"
          />
          <div className="text-left text-xs text-[#AEAEB2]">{data.prerequisites.length}/2000</div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-primary">{t('dashboard.addCourse.cancellationPolicyLabel')}</label>
        <div className="w-full rounded-lg border border-[#E3E3E3] px-3 py-2.5">
          <textarea
            value={data.cancellation_policy}
            onChange={(e) => onChange({ cancellation_policy: e.target.value.slice(0, 2000) })}
            rows={2}
            className="w-full resize-none bg-transparent text-right text-sm text-ink outline-none"
          />
          <div className="text-left text-xs text-[#AEAEB2]">{data.cancellation_policy.length}/2000</div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary-light/40 p-5">
        <Info size={20} className="mt-0.5 shrink-0 text-primary" />
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
