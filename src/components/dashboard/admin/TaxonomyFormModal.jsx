import { useState } from 'react';
import { X } from 'lucide-react';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { ApiErrorList } from '@/components/ui';
import { EDUCATION_TYPE_LABELS } from '@/mocks/adminTaxonomy.mock';
import { useT } from '@/hooks/useT';

const TAXONOMY_FIELD_LABELS = {
  code: 'الرمز',
  name_ar: 'الاسم بالعربية',
  name_en: 'الاسم بالإنجليزية',
  education_type: 'نوع التعليم',
  sort_order: 'الترتيب',
  grade_from: 'الصف الأول',
  grade_to: 'الصف الأخير',
  country: 'الدولة',
};
const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
const taxonomyErrorLabel = (path) => TAXONOMY_FIELD_LABELS[path] ?? path;

export function TaxonomyFormModal({ typeConfig, item, isPending, error, onSave, onClose }) {
  const t = useT();
  const isEdit = !!item;
  const [code, setCode] = useState(item?.code ?? '');
  const [nameAr, setNameAr] = useState(item?.name_ar ?? '');
  const [educationType, setEducationType] = useState(item?.education_type ?? 'school');
  const [gradeFrom, setGradeFrom] = useState(item?.grade_from ?? '');
  const [gradeTo, setGradeTo] = useState(item?.grade_to ?? '');
  const [touched, setTouched] = useState(false);

  // نطاق الصفوف للمراحل المدرسية فقط — يحدّد ما يظهر بقائمة "الصف" بفلتر البحث
  const hasGradeRange = typeConfig.key === 'stages' && educationType === 'school';
  const gradeRangeValid =
    !hasGradeRange ||
    (gradeFrom === '' && gradeTo === '') ||
    (gradeFrom !== '' && gradeTo !== '' && Number(gradeFrom) <= Number(gradeTo));

  const isValid = nameAr.trim() !== '' && (!typeConfig.hasCode || code.trim() !== '') && gradeRangeValid;

  const handleSave = () => {
    setTouched(true);
    if (!isValid) return;
    const payload = { name_ar: nameAr.trim() };
    if (typeConfig.hasCode) payload.code = code.trim();
    if (typeConfig.hasEducationType) payload.education_type = educationType;
    if (typeConfig.key === 'stages') {
      payload.grade_from = hasGradeRange && gradeFrom !== '' ? Number(gradeFrom) : null;
      payload.grade_to = hasGradeRange && gradeTo !== '' ? Number(gradeTo) : null;
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
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

        {error && <ApiErrorList error={error} labelFor={taxonomyErrorLabel} className="mb-4" />}

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
            <div className="flex flex-col gap-1.5 text-right">
              <span className="text-sm font-semibold text-ink">{t('dashboard.adminTaxonomy.educationTypeLabel')}</span>
              <SmoothSelect
                value={educationType}
                onChange={setEducationType}
                options={Object.entries(EDUCATION_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </div>
          )}

          {hasGradeRange && (
            <div className="flex flex-col gap-1.5 text-right">
              <span className="text-sm font-semibold text-ink">{t('dashboard.adminTaxonomy.gradeRangeLabel')}</span>
              <div className="flex items-center gap-2">
                <SmoothSelect
                  className="flex-1"
                  value={String(gradeFrom)}
                  onChange={setGradeFrom}
                  placeholder={t('dashboard.adminTaxonomy.gradeFrom')}
                  options={GRADE_OPTIONS}
                />
                <span className="text-ink-soft">—</span>
                <SmoothSelect
                  className="flex-1"
                  value={String(gradeTo)}
                  onChange={setGradeTo}
                  placeholder={t('dashboard.adminTaxonomy.gradeTo')}
                  options={GRADE_OPTIONS}
                />
              </div>
              {touched && !gradeRangeValid && (
                <span className="text-xs text-accent-pink">{t('dashboard.adminTaxonomy.gradeRangeInvalid')}</span>
              )}
            </div>
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
