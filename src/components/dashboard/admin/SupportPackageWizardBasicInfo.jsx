import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { useT } from '@/hooks/useT';

const TIERS = [
  { value: 'basic', labelKey: 'tierBasic' },
  { value: 'premium', labelKey: 'tierPremium' },
];

const MAX_SUBJECTS = 10;

/**
 * نفس منطق MultiSelectChips المشترك بالضبط، لكن الشرائح المختارة تظهر داخل
 * الحقل نفسه بدل صف منفصل تحته — خاص بهذه المودال فقط (طلب صريح)، بلا تعديل
 * على MultiSelectChips العام المستخدم بأماكن أخرى كتيرة.
 */
function InlineSubjectPicker({ label, values, onChange, options, placeholder, max, searchPlaceholder = 'بحث...' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const atMax = typeof max === 'number' && values.length >= max;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const toggle = (value) => {
    if (!values.includes(value) && atMax) return;
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  };

  const selectedOptions = options.filter((o) => values.includes(o.value));
  const filteredOptions = query.trim()
    ? options.filter((o) => o.label?.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  return (
    <div ref={rootRef} className="flex flex-col items-start gap-1.5">
      {label && <label className="text-sm font-semibold text-primary">{label}</label>}
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex w-full flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-sm transition-colors duration-150 ${
            open ? 'border-primary' : 'border-[#E3E3E3] hover:border-primary/40'
          }`}
        >
          <ChevronDown size={16} className={`shrink-0 text-ink-soft transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          {selectedOptions.length === 0 ? (
            <span className="text-[#AEAEB2]">{placeholder}</span>
          ) : (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="flex items-center gap-1 rounded-pill bg-primary-light px-2.5 py-1 text-xs font-medium text-primary"
              >
                {opt.label}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(opt.value);
                  }}
                  aria-label="إزالة"
                >
                  <X size={12} />
                </span>
              </span>
            ))
          )}
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full origin-top animate-fade-in overflow-hidden rounded-2xl bg-white p-2 shadow-lift">
            {options.length > 6 && (
              <div className="mb-1 flex items-center gap-2 rounded-xl border border-[#E3E3E3] px-3 py-2">
                <Search size={14} className="shrink-0 text-ink-soft" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-[#AEAEB2]"
                />
              </div>
            )}
            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <p className="px-4 py-3 text-center text-sm text-ink-soft">لا توجد نتائج</p>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = values.includes(opt.value);
                  const isDisabled = !isSelected && atMax;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggle(opt.value)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm transition-colors duration-150 ${
                        isSelected
                          ? 'bg-primary/10 font-semibold text-primary'
                          : isDisabled
                            ? 'cursor-not-allowed text-ink-soft/50'
                            : 'text-ink hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {isSelected && <Check size={15} />}
                      {opt.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {atMax && <span className="text-xs text-ink-soft">{`الحد الأقصى ${max} عنصر`}</span>}
    </div>
  );
}

/** الخطوة الأولى (محتوى الباقة) — مشتركة بين إنشاء/تعديل باقة الدعم من لوحة الأدمن */
export function SupportPackageWizardBasicInfo({ data, onChange, onNext }) {
  const t = useT();
  const [touched, setTouched] = useState(false);
  const { data: allSubjects = [] } = useTaxonomyList('subjects');
  const subjects = allSubjects.filter((s) => s.education_type === 'university');
  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name_ar }));

  const titleTrimmed = data.title.trim();
  const missingTitle = titleTrimmed === '';
  const missingSubjects = data.subjectIds.length === 0;
  const missingDescription = data.description.trim() === '';
  const isValid = !missingTitle && !missingSubjects && !missingDescription;

  const handleNext = () => {
    setTouched(true);
    if (!isValid) return;
    onNext();
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-right">
        <span className="text-sm font-semibold text-ink">{t('dashboard.addSupportPackage.titleLabel')}</span>
        <input
          type="text"
          maxLength={150}
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
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
              onClick={() => onChange({ tier: opt.value })}
              className={`rounded-xl border p-2.5 text-right transition-colors ${
                data.tier === opt.value ? 'border-primary bg-primary/5' : 'border-line bg-white hover:bg-canvas'
              }`}
            >
              <div className="text-sm font-semibold text-ink">{t(`dashboard.addSupportPackage.${opt.labelKey}`)}</div>
            </button>
          ))}
        </div>
      </div>

      <InlineSubjectPicker
        label={t('dashboard.addSupportPackage.subjectLabel')}
        values={data.subjectIds}
        onChange={(v) => onChange({ subjectIds: v })}
        options={subjectOptions}
        placeholder={t('dashboard.addSupportPackage.subjectPlaceholder')}
        max={MAX_SUBJECTS}
      />
      {touched && missingSubjects && <span className="text-xs text-accent-pink">{t('dashboard.addSupportPackage.subjectRequired')}</span>}

      <label className="flex flex-col gap-1.5 text-right">
        <span className="text-sm font-semibold text-ink">{t('dashboard.addSupportPackage.descriptionLabel')}</span>
        <div className="w-full rounded-lg border border-[#E3E3E3] px-3 py-2.5">
          <textarea
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value.slice(0, 2000) })}
            placeholder={t('dashboard.addSupportPackage.descriptionPlaceholder')}
            rows={4}
            className="w-full resize-none bg-transparent text-right text-sm text-ink outline-none placeholder:text-[#AEAEB2]"
          />
          <div className="text-left text-xs text-[#AEAEB2]">{data.description.length}/2000</div>
        </div>
        {touched && missingDescription && <span className="text-xs text-accent-pink">{t('dashboard.addSupportPackage.descriptionRequired')}</span>}
      </label>

      <div className="flex w-full">
        <button
          type="button"
          onClick={handleNext}
          className="ms-auto rounded-xl border-2 border-primary bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {t('dashboard.addPackage.next')}
        </button>
      </div>
    </div>
  );
}
