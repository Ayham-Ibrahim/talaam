import { useT } from '@/hooks/useT';

/**
 * حقلا "من"/"إلى" نصّيان بدل شريط تمرير — أوضح للمستخدم وبلا حاجة لنطاق
 * ثابت مفروض مسبقاً (min/max حرّان تماماً). الفراغ = بلا حد بتلك الجهة:
 * "من" فقط → سعر ≥ القيمة، "إلى" فقط → سعر ≤ القيمة، كلاهما → بينهما.
 * هذا المنطق يعيش فعلياً بـ teacherService.getTeachers (min_price/max_price)
 * وTeacherSearchController بالباك اند — كلاهما يدعمان الحقلين معاً أصلاً.
 */
export function PriceRangeInputs({ minPrice, maxPrice, onChangeMin, onChangeMax }) {
  const t = useT();

  const parse = (raw) => {
    if (raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  return (
    <div>
      <div className="mb-2 text-sm font-bold text-ink">{t('search.price')}</div>
      <div className="flex items-center gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium text-ink-soft">{t('search.fromPrefix')}</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            value={minPrice ?? ''}
            onChange={(e) => onChangeMin(parse(e.target.value))}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <span className="mt-5 text-ink-soft">—</span>
        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium text-ink-soft">{t('search.upToPrefix')}</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="4000"
            value={maxPrice ?? ''}
            onChange={(e) => onChangeMax(parse(e.target.value))}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>
    </div>
  );
}
