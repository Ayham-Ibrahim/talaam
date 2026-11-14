import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { useT } from '@/hooks/useT';

/** المعرّفات تصل أرقاماً من الخادم ونصوصاً من بعض الحقول — تُقارن كنصوص */
const sameId = (a, b) => a !== '' && a != null && String(a) === String(b);

/**
 * قوائم الدول والولايات (الفعّالة، مع إبقاء المختار سابقاً ولو عُطِّل) — الولايات مقصورة
 * على الدولة المختارة. hasRegions=false: دولة بلا ولايات مُعرَّفة، فتكفي الدولة وحدها.
 */
export function useLocationOptions(countryId, regionId = '', enabled = true) {
  const { data: countries = [] } = useTaxonomyList(enabled ? 'countries' : null);
  const { data: allRegions = [] } = useTaxonomyList(enabled ? 'regions' : null);

  const regions = allRegions.filter(
    (r) => sameId(r.country_id, countryId) && (r.is_active || sameId(r.id, regionId)),
  );

  return {
    countryOptions: countries
      .filter((c) => c.is_active || sameId(c.id, countryId))
      .map((c) => ({ value: c.id, label: c.name_ar })),
    regionOptions: regions.map((r) => ({ value: r.id, label: r.name_ar })),
    hasRegions: regions.length > 0,
  };
}

/**
 * الدولة ثم الولاية — مشترك بين كل نماذج موقع الطالب. تغيير الدولة يفرّغ الولاية؛
 * حقل الولاية لا يظهر لدولة بلا ولايات. optional: يضيف "(اختياري)" للعنوانين.
 */
export function CountryRegionFields({
  countryId,
  regionId,
  onCountryChange,
  onRegionChange,
  countryOptions,
  regionOptions,
  hasRegions,
  countryError = false,
  regionError = false,
  optional = false,
}) {
  const t = useT();
  const suffix = optional ? ` (${t('completeProfile.optional')})` : '';

  return (
    <div className="flex flex-col gap-4">
      <SmoothSelect
        label={t('completeProfile.countryLabel') + suffix}
        value={countryId}
        onChange={onCountryChange}
        options={countryOptions}
        placeholder="—"
        error={countryError}
        errorMessage={t('completeProfile.countryRequired')}
      />
      {hasRegions && (
        <SmoothSelect
          label={t('completeProfile.regionLabel') + suffix}
          value={regionId}
          onChange={onRegionChange}
          options={regionOptions}
          placeholder="—"
          error={regionError}
          errorMessage={t('completeProfile.regionRequired')}
        />
      )}
    </div>
  );
}
