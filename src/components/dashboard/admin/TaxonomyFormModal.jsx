import { useState } from 'react';
import { X } from 'lucide-react';
import { EDUCATION_TYPE_LABELS } from '@/mocks/adminTaxonomy.mock';
import { useT } from '@/hooks/useT';

export function TaxonomyFormModal({ typeConfig, item, isPending, onSave, onClose }) {
  const t = useT();
  const isEdit = !!item;
  const [code, setCode] = useState(item?.code ?? '');
  const [nameAr, setNameAr] = useState(item?.name_ar ?? '');
  const [educationType, setEducationType] = useState(item?.education_type ?? 'school');
  const [touched, setTouched] = useState(false);

  const isValid = nameAr.trim() !== '' && (!typeConfig.hasCode || code.trim() !== '');

  const handleSave = () => {
    setTouched(true);
    if (!isValid) return;
    const payload = { name_ar: nameAr.trim() };
    if (typeConfig.hasCode) payload.code = code.trim();
    if (typeConfig.hasEducationType) payload.education_type = educationType;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminTaxonomy.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">
            {t(isEdit ? 'dashboard.adminTaxonomy.editTitle' : 'dashboard.adminTaxonomy.addTitle')} — {typeConfig.label}
          </h3>
          <span className="w-8" />
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminTaxonomy.nameLabel')}</span>
            <input
              type="text"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                touched && nameAr.trim() === '' ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
          </label>

          {typeConfig.hasCode && (
            <label className="flex flex-col gap-1.5 text-right">
              <span className="text-sm font-semibold text-ink">{t('dashboard.adminTaxonomy.codeLabel')}</span>
              <input
                type="text"
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full rounded-btn border bg-surface p-3 text-left text-sm text-ink focus:outline-none focus:ring-2 ${
                  touched && code.trim() === '' ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
                }`}
              />
            </label>
          )}

          {typeConfig.hasEducationType && (
            <label className="flex flex-col gap-1.5 text-right">
              <span className="text-sm font-semibold text-ink">{t('dashboard.adminTaxonomy.educationTypeLabel')}</span>
              <select
                value={educationType}
                onChange={(e) => setEducationType(e.target.value)}
                className="w-full appearance-none rounded-btn border border-line bg-surface p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {Object.entries(EDUCATION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.adminTaxonomy.cancel')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.adminTaxonomy.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
