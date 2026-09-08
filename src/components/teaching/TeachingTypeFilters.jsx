import {
  Bookmark,
  BookOpen,
  Layers,
  GraduationCap,
  Globe,
  Star,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { SmoothSelect } from "@/components/dashboard/SmoothSelect";
import { useT } from "@/hooks/useT";
import { useCurrencyStore } from "@/store";
import { formatPrice } from "@/lib/currency";

const RATING_VALUES = [4.5, 4.0, 3.0, 2.0];

/**
 * فلاتر صفحة نوع التعليم — نفس حقول شريط بحث السوق (الصف/المادة/المرحلة/اللغة/
 * السعر/التقييم) مضافاً إليها "التخصص/المنهج"، بلا حقل "المستوى" لأن الصفحة نفسها
 * تحدّده. تُطبَّق فورياً عند تغيير أي قيمة — لا زر "تطبيق". أي قائمة بلا خيارات
 * (مثل الصف/المرحلة في صفحتَي الجامعي والتدريب) تُخفى تلقائياً.
 */
export function TeachingTypeFilters({ meta, value, onChange, onReset, hideHeading = false }) {
  const t = useT();
  const currency = useCurrencyStore((s) => s.currency);
  const priceMin = meta?.priceRange?.min ?? 50;
  const priceMax = meta?.priceRange?.max ?? 550;
  const ratingLabels = t("teachingType.ratingOptions");
  const allOption = { value: "", label: t("teachingType.select") };

  const selects = [
    { key: "grade", icon: Bookmark, label: t("search.grade"), options: meta?.grades ?? [] },
    { key: "subject", icon: BookOpen, label: t("search.subject"), options: meta?.subjects ?? [] },
    { key: "stage", icon: Layers, label: t("search.stage"), options: meta?.stages ?? [] },
    { key: "curriculum", icon: GraduationCap, label: t("teachingType.specialization"), options: meta?.curricula ?? [] },
    { key: "language", icon: Globe, label: t("search.language"), options: meta?.languages ?? [] },
  ].filter((s) => s.options.length > 0);

  const hasActiveFilter = Object.values(value).some((v) => v != null);

  return (
    <aside className="w-full shrink-0 lg:w-72">
      {!hideHeading && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-bold text-ink">
            <SlidersHorizontal size={18} /> {t("teachingType.filterTitle")}
          </h3>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {t("teachingType.reset")} <RotateCcw size={13} />
            </button>
          )}
        </div>
      )}

      <div className="space-y-5">
        {selects.map(({ key, icon: Icon, label, options }) => (
          <div key={key}>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
              <Icon size={15} className="text-ink-soft" /> {label}
            </label>
            <SmoothSelect
              value={value[key] ?? ""}
              onChange={(v) => onChange(key, v || null)}
              placeholder={t("teachingType.select")}
              options={[allOption, ...options]}
            />
          </div>
        ))}

        {/* السعر — الحد الأدنى */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm font-bold text-ink">
            <span>{t("search.price")}</span>
            <span className="text-xs font-medium text-ink-soft">{formatPrice(priceMax, currency)}</span>
          </div>
          <input
            type="range"
            min={priceMin}
            max={priceMax}
            step={5}
            value={value.minPrice ?? priceMin}
            onChange={(e) => {
              const next = Number(e.target.value);
              onChange("minPrice", next <= priceMin ? null : next);
            }}
            className="w-full accent-primary"
          />
          <div className="mt-1 text-xs font-medium text-ink-soft">
            {t("search.fromPrefix")} {formatPrice(value.minPrice ?? priceMin, currency)}
          </div>
        </div>

        {/* التقييم */}
        <div>
          <h4 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-ink">
            <Star size={15} className="text-ink-soft" /> {t("teachingType.rating")}
          </h4>
          <div className="space-y-2">
            {ratingLabels.map((label, i) => (
              <label key={label} className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={value.minRating === RATING_VALUES[i]}
                  onChange={() =>
                    onChange("minRating", value.minRating === RATING_VALUES[i] ? null : RATING_VALUES[i])
                  }
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="inline-flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={13}
                      className={s < Math.round(RATING_VALUES[i]) ? "fill-star text-star" : "text-line"}
                    />
                  ))}
                </span>
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
