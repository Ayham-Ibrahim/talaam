import { useState } from 'react';
import { X } from 'lucide-react';
import { MultiSelectChips } from '@/components/dashboard/MultiSelectChips';
import { ApiErrorList } from '@/components/ui';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { useAdminUpdateSupportPackage } from '@/hooks/useAcademicSupporters';
import { useT } from '@/hooks/useT';

const TIERS = [
  { value: 'basic', labelKey: 'tierBasic' },
  { value: 'premium', labelKey: 'tierPremium' },
];

const MAX_SUBJECTS = 10;

/**
 * تعديل أدمن لباقة دعم موجودة — نفس حقول AddSupportPackageModal بالضبط (راجعه
 * للتعليقات)، لكن مُعبّأ مسبقاً وموجّه لـ PUT بدل POST. الباك اند يرفض الحفظ
 * (422) لو وُجدت عمليات شراء قائمة على الباقة — نعرض الخطأ كما هو، بلا فحص
 * مسبق بالفرونت (نفس فلسفة زر disable الموجود أصلاً).
 */
export function EditSupportPackageModal({ supporterId, supportPackage, onClose }) {
  const t = useT();
  const { data: allSubjects = [] } = useTaxonomyList('subjects');
  const subjects = allSubjects.filter((s) => s.education_type === 'university');
  const updateSupportPackage = useAdminUpdateSupportPackage(supporterId);

  const [title, setTitle] = useState(supportPackage.title ?? '');
  const [tier, setTier] = useState(supportPackage.tier ?? 'basic');
  const [subjectIds, setSubjectIds] = useState(supportPackage.subjectIds ?? []);
  const [price, setPrice] = useState(String(supportPackage.studentPrice ?? ''));
  const [description, setDescription] = useState(supportPackage.description ?? '');
  const [touched, setTouched] = useState(false);

  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name_ar }));
  const titleTrimmed = title.trim();
  const descriptionTrimmed = description.trim();
  const priceNumber = Number(price);
  const missingTitle = titleTrimmed === '';
  const missingSubjects = subjectIds.length === 0;
  const invalidPrice = String(price).trim() === '' || !Number.isFinite(priceNumber) || priceNumber <= 0;
  const missingDescription = descriptionTrimmed === '';
  const isValid = !missingTitle && !missingSubjects && !invalidPrice && !missingDescription;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    updateSupportPackage.mutate(
      { id: supportPackage.id, payload: { title: titleTrimmed, tier, subject_ids: subjectIds, price: priceNumber, description: descriptionTrimmed } },
      { onSuccess: onClose },
    );
  };

  const fieldLabel = (path) => {
    if (path === 'title') return t('dashboard.addSupportPackage.titleLabel');
    if (path === 'subject_ids') return t('dashboard.addSupportPackage.subjectLabel');
    if (path === 'price') return t('dashboard.addSupportPackage.priceLabel');
    if (path === 'description') return t('dashboard.addSupportPackage.descriptionLabel');
    if (path === 'tier') return t('dashboard.addSupportPackage.tierLabel');
    if (path === 'purchases') return null;
    return path;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
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
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.editSupportPackage.title')}</h3>
          <span className="w-8" />
        </div>

        <p className="mb-4 text-sm text-ink-soft">{t('dashboard.editSupportPackage.hint')}</p>

        {updateSupportPackage.isError && (
          <ApiErrorList error={updateSupportPackage.error} labelFor={fieldLabel} className="mb-4" />
        )}

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.addSupportPackage.titleLabel')}</span>
            <input
              type="text"
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('dashboard.addSupportPackage.titlePlaceholder')}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
                touched && missingTitle ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            {touched && missingTitle && <span className="text-xs text-accent-pink">{t('dashboard.addSupportPackage.titleRequired')}</span>}
          </label>

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
                </button>
              ))}
            </div>
          </div>

          <MultiSelectChips
            label={t('dashboard.addSupportPackage.subjectLabel')}
            values={subjectIds}
            onChange={setSubjectIds}
            options={subjectOptions}
            placeholder={t('dashboard.addSupportPackage.subjectPlaceholder')}
            max={MAX_SUBJECTS}
          />
          {touched && missingSubjects && <span className="text-xs text-accent-pink">{t('dashboard.addSupportPackage.subjectRequired')}</span>}

          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.addSupportPackage.priceLabel')}</span>
            <input
              type="number"
              min="1"
              step="0.01"
              dir="ltr"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t('dashboard.addSupportPackage.pricePlaceholder')}
              className={`w-full rounded-btn border bg-surface p-3 text-left text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
                touched && invalidPrice ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            {touched && invalidPrice && <span className="text-xs text-accent-pink">{t('dashboard.addSupportPackage.priceRequired')}</span>}
          </label>

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
            disabled={updateSupportPackage.isPending}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {updateSupportPackage.isPending ? t('dashboard.editSupportPackage.submitting') : t('dashboard.editSupportPackage.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
