import { useState } from 'react';
import { X } from 'lucide-react';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { ApiErrorList } from '@/components/ui';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { useCreateSupportPackage } from '@/hooks/useSupporterAccount';
import { useT } from '@/hooks/useT';

const TIERS = [
  { value: 'basic', labelKey: 'tierBasic', priceKey: 'tierBasicPrice' },
  { value: 'premium', labelKey: 'tierPremium', priceKey: 'tierPremiumPrice' },
];

/**
 * نموذج واحد مباشر إلى pending_approval — لا مرحلة draft/wizard (راجع
 * SupportPackageService::create). السعر ثابت حسب الفئة المختارة، لا يُدخله الداعم إطلاقاً.
 */
export function AddSupportPackageModal({ onClose }) {
  const t = useT();
  const { data: subjects = [] } = useTaxonomyList('subjects');
  const createSupportPackage = useCreateSupportPackage();

  const [tier, setTier] = useState('basic');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState(false);

  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name_ar }));
  const descriptionTrimmed = description.trim();
  const missingSubject = subjectId === '';
  const missingDescription = descriptionTrimmed === '';
  const isValid = !missingSubject && !missingDescription;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    createSupportPackage.mutate(
      { tier, subject_id: Number(subjectId), description: descriptionTrimmed },
      { onSuccess: onClose },
    );
  };

  const fieldLabel = (path) => {
    if (path === 'subject_id') return t('dashboard.addSupportPackage.subjectLabel');
    if (path === 'description') return t('dashboard.addSupportPackage.descriptionLabel');
    if (path === 'tier') return t('dashboard.addSupportPackage.tierLabel');
    return path;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.addSupportPackage.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.addSupportPackage.title')}</h3>
          <span className="w-8" />
        </div>

        <p className="mb-4 text-sm text-ink-soft">{t('dashboard.addSupportPackage.hint')}</p>

        {createSupportPackage.isError && (
          <ApiErrorList error={createSupportPackage.error} labelFor={fieldLabel} className="mb-4" />
        )}

        <div className="flex flex-col gap-4">
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">{t('dashboard.addSupportPackage.tierLabel')}</span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TIERS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTier(opt.value)}
                  className={`rounded-2xl border p-4 text-right transition-colors ${
                    tier === opt.value ? 'border-primary bg-primary/5' : 'border-line bg-white hover:bg-canvas'
                  }`}
                >
                  <div className="font-bold text-ink">{t(`dashboard.addSupportPackage.${opt.labelKey}`)}</div>
                  <div className="mt-1 text-sm text-price">{t(`dashboard.addSupportPackage.${opt.priceKey}`)}</div>
                </button>
              ))}
            </div>
          </div>

          <SmoothSelect
            label={t('dashboard.addSupportPackage.subjectLabel')}
            value={subjectId}
            onChange={setSubjectId}
            options={subjectOptions}
            placeholder={t('dashboard.addSupportPackage.subjectPlaceholder')}
            error={touched && missingSubject}
            errorMessage={touched && missingSubject ? t('dashboard.addSupportPackage.subjectRequired') : null}
          />

          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.addSupportPackage.descriptionLabel')}</span>
            <textarea
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('dashboard.addSupportPackage.descriptionPlaceholder')}
              className={`w-full resize-none rounded-btn border bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
                touched && missingDescription ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            {touched && missingDescription && (
              <span className="text-xs text-accent-pink">{t('dashboard.addSupportPackage.descriptionRequired')}</span>
            )}
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.addSupportPackage.cancel')}
          </button>
          <button
            type="button"
            disabled={createSupportPackage.isPending}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {createSupportPackage.isPending ? t('dashboard.addSupportPackage.submitting') : t('dashboard.addSupportPackage.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
