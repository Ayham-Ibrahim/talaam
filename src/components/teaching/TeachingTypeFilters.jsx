import {
  Bookmark,
  BookOpen,
  Briefcase,
  Layers,
  GraduationCap,
  Globe,
  Star,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { SmoothSelect } from "@/components/dashboard/SmoothSelect";
import { PriceRangeInputs } from "@/components/search/PriceRangeInputs";
import { useT } from "@/hooks/useT";

// كل درجات التقييم الممكنة كحدّ أدنى — نفس شبكة SearchFilters.jsx (5 تعني 5 تماماً لذا تُعرض بلا "+")
const RATING_VALUES = [5, 4, 3, 2, 1];

function FieldLabel({ icon: Icon, children }) {
  return (
    <span className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
      <Icon size={15} className="text-ink-soft" /> {children}
    </span>
  );
}

function Chip({ active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        active ? "border-primary bg-primary text-white" : "border-line bg-white text-ink-soft hover:border-primary/50 hover:text-ink"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Group({ title, children }) {
  return (
    <section className="space-y-4">
      <h4 className="text-xs font-bold text-ink-soft">{title}</h4>
      {children}
    </section>
  );
}

/**
 * فلاتر صفحة نوع التعليم — نفس الهوية البصرية لفلاتر شريط بحث السوق
 * (SearchFilters.jsx: FieldLabel/Chip/Group) بلا حقل "المستوى" لأن الصفحة نفسها
 * تحدّده. ترتيب الحقول [المرحلة، الصف، التخصص، المادة، المنهج] ثابت للصفحتين
 * معاً — إخفاء كل حقل بلا خيارات (options.length>0) هو يلي يحدد الظاهر فعلياً:
 * مدرسي يعرض [المرحلة، الصف، المادة، المنهج]، وجامعي يعرض [التخصص، المادة] فقط
 * (المنهج يُستثنى صراحة لغير مدرسي بـisSchool لأنه بلا عمود education_type
 * بالباك اند فلا يفرغ تلقائياً، بعكس التخصص/المرحلة/الصف المقيَّدة أصلاً هناك
 * بـeduType).
 */
export function TeachingTypeFilters({ meta, value, onChange, onReset, hideHeading = false }) {
  const t = useT();
  const allOption = { value: "", label: t("teachingType.select") };
  const isSchool = meta?.educationType === "school" || meta?.educationType == null;

  // بلا مرحلة مختارة: كل الصفوف. مع مرحلة: صفوف نطاقها فقط (ابتدائية حتى 6،
  // إعدادية 7-9، ثانوية 10-12) — نفس منطق SearchFilters.jsx تماماً.
  const stageGrades = value.stage ? meta?.stageGrades?.[value.stage] : null;
  const gradeOptions = stageGrades
    ? (meta?.grades ?? []).filter((g) => stageGrades.includes(String(g.value)))
    : meta?.grades ?? [];

  const selects = [
    { key: "stage", icon: Layers, label: t("search.stage"), options: meta?.stages ?? [] },
    { key: "grade", icon: Bookmark, label: t("search.grade"), options: gradeOptions },
    { key: "major", icon: Briefcase, label: t("teachingType.major"), options: meta?.majors ?? [] },
    { key: "subject", icon: BookOpen, label: t("search.subject"), options: meta?.subjects ?? [] },
    { key: "curriculum", icon: GraduationCap, label: t("teachingType.specialization"), options: isSchool ? (meta?.curricula ?? []) : [] },
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

      <div className="space-y-6">
        <div className="space-y-4">
          {selects.map(({ key, icon, label, options }) => (
            <div key={key}>
              <FieldLabel icon={icon}>{label}</FieldLabel>
              <SmoothSelect
                value={value[key] ?? ""}
                onChange={(v) => onChange(key, v || null)}
                placeholder={t("teachingType.select")}
                options={[allOption, ...options]}
              />
            </div>
          ))}
        </div>

        <div className="border-t border-line" />

        <Group title={t("search.groupTeacher")}>
          <div>
            <FieldLabel icon={Globe}>{t("search.language")}</FieldLabel>
            <SmoothSelect
              value={value.language ?? ""}
              onChange={(v) => onChange("language", v || null)}
              placeholder={t("teachingType.select")}
              options={[allOption, ...(meta?.languages ?? [])]}
            />
          </div>

          <div>
            <FieldLabel icon={Star}>{t("teachingType.rating")}</FieldLabel>
            <div className="grid grid-cols-3 gap-1.5">
              <Chip active={value.minRating == null} onClick={() => onChange("minRating", null)} className="px-1 text-xs">
                {t("search.all")}
              </Chip>
              {RATING_VALUES.map((r) => {
                const active = value.minRating === r;
                return (
                  <Chip key={r} active={active} onClick={() => onChange("minRating", active ? null : r)} className="gap-1 px-1 text-xs">
                    {r}
                    {r < 5 && "+"} <Star size={12} className={active ? "fill-white text-white" : "fill-star text-star"} />
                  </Chip>
                );
              })}
            </div>
          </div>

          <PriceRangeInputs
            minPrice={value.minPrice}
            maxPrice={value.maxPrice}
            onChangeMin={(v) => onChange("minPrice", v)}
            onChangeMax={(v) => onChange("maxPrice", v)}
          />
        </Group>
      </div>
    </aside>
  );
}
