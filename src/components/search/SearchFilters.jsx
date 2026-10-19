import { SlidersHorizontal, Layers, Bookmark, BookOpen, GraduationCap, Globe, RotateCcw, Star, School, Library } from 'lucide-react';
import { Button } from '@/components/ui';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { PriceRangeInputs } from '@/components/search/PriceRangeInputs';
import { useT } from '@/hooks/useT';

const EDUCATION_TYPES = [
  { value: 'school', icon: School },
  { value: 'university', icon: GraduationCap },
  { value: 'training', icon: BookOpen },
];
// كل درجات التقييم الممكنة كحدّ أدنى — 5 تعني 5 تماماً لذا تُعرض بلا "+"
const RATING_VALUES = [5, 4, 3, 2, 1];

function FieldLabel({ icon: Icon, children }) {
  return (
    <span className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
      <Icon size={15} className="text-ink-soft" /> {children}
    </span>
  );
}

function Chip({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        active ? 'border-primary bg-primary text-white' : 'border-line bg-white text-ink-soft hover:border-primary/50 hover:text-ink'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function DisabledHint({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-canvas px-3 py-2.5 text-xs text-ink-soft">{children}</div>
  );
}

function FilterSelect({ icon, label, options = [], value, onChange, placeholder, disabledHint = null }) {
  return (
    <div>
      <FieldLabel icon={icon}>{label}</FieldLabel>
      {disabledHint ? (
        <DisabledHint>{disabledHint}</DisabledHint>
      ) : (
        <SmoothSelect value={value ?? ''} onChange={(v) => onChange(v || null)} placeholder={placeholder} options={options} />
      )}
    </div>
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
 * الفلاتر مرتّبة هرمياً: نوع التعليم ← المرحلة ← الصف، والمادة/المرحلة/المنهاج
 * تابعة للنوع (meta تُجلَب بـ education_type المختار من SearchPage). أي حقل
 * يعتمد على حقل قبله يظهر معطَّلاً مع تلميح حتى يُختار الأب، والحقول التي لا
 * معنى لها بنوع معيّن (الصف بغير المدرسي، المنهاج بالجامعي/الدورات) تُخفى.
 * مسح الحقول التابعة عند تغيير الأب يعيش بـ SearchPage (handleChange) لا هنا.
 *
 * التغييرات تُطبَّق فوراً — لا زر "تطبيق". `onDone` (الموبايل فقط) يغلق
 * الدرج ليعرض النتائج.
 */
export function SearchFilters({ meta, value, onChange, onReset, onDone, resultsCount, hideHeading = false }) {
  const t = useT();
  const typeLabels = t('search.categories');

  // الصف مدرسي فقط — يظهر أيضاً قبل اختيار أي نوع لأن معظم البحث مدرسي
  const showGrade = !value.level || value.level === 'school';
  const showStage = value.level !== 'training';
  const showCurriculum = value.level !== 'university' && value.level !== 'training';

  // بلا مرحلة مختارة: كل الصفوف. مع مرحلة: صفوف نطاقها فقط — وإن لم يكن لها
  // نطاق بـ stageGrades (مرحلة بلا grade_from/grade_to، أو mocks) نعرض الكل.
  const stageGrades = value.stage ? meta?.stageGrades?.[value.stage] : null;
  const gradeOptions = stageGrades
    ? (meta?.grades ?? []).filter((g) => stageGrades.includes(String(g.value)))
    : meta?.grades ?? [];

  const hasActiveFilter = Object.values(value).some((v) => v != null);

  return (
    <aside className="w-full shrink-0 lg:w-72">
      {!hideHeading && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-bold text-ink">
            <SlidersHorizontal size={18} /> {t('search.filterTitle')}
          </h3>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {t('search.reset')} <RotateCcw size={13} />
            </button>
          )}
        </div>
      )}

      <div className="space-y-6">
        <Group title={t('search.groupWhat')}>
          <div>
            <FieldLabel icon={Layers}>{t('search.educationType')}</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {EDUCATION_TYPES.map(({ value: type, icon: Icon }, i) => (
                <Chip
                  key={type}
                  active={value.level === type}
                  onClick={() => onChange('level', value.level === type ? null : type)}
                  className="flex-col px-1 py-2 text-xs"
                >
                  <Icon size={16} />
                  {typeLabels[i]}
                </Chip>
              ))}
            </div>
          </div>

          {showStage && (
            <FilterSelect
              icon={GraduationCap}
              label={t('search.stage')}
              placeholder={t('search.all')}
              options={meta?.stages}
              value={value.stage}
              onChange={(v) => onChange('stage', v)}
              disabledHint={!value.level ? t('search.pickTypeFirst') : null}
            />
          )}

          {showGrade && (
            <FilterSelect
              icon={Bookmark}
              label={t('search.grade')}
              placeholder={t('search.all')}
              options={gradeOptions}
              value={value.grade}
              onChange={(v) => onChange('grade', v)}
              disabledHint={gradeOptions.length === 0 ? t('search.noGradesForStage') : null}
            />
          )}

          <FilterSelect
            icon={BookOpen}
            label={t('search.subject')}
            placeholder={t('search.all')}
            options={meta?.subjects}
            value={value.subject}
            onChange={(v) => onChange('subject', v)}
          />

          {showCurriculum && (
            <FilterSelect
              icon={Library}
              label={t('search.curriculum')}
              placeholder={t('search.all')}
              options={meta?.curricula}
              value={value.curriculum}
              onChange={(v) => onChange('curriculum', v)}
            />
          )}
        </Group>

        <div className="border-t border-line" />

        <Group title={t('search.groupTeacher')}>
          <FilterSelect
            icon={Globe}
            label={t('search.language')}
            placeholder={t('search.all')}
            options={meta?.languages}
            value={value.language}
            onChange={(v) => onChange('language', v)}
          />

          <div>
            <FieldLabel icon={Star}>{t('search.rating')}</FieldLabel>
            <div className="grid grid-cols-3 gap-1.5">
              <Chip active={value.minRating == null} onClick={() => onChange('minRating', null)} className="px-1 text-xs">
                {t('search.all')}
              </Chip>
              {RATING_VALUES.map((r) => {
                const active = value.minRating === r;
                return (
                  <Chip key={r} active={active} onClick={() => onChange('minRating', active ? null : r)} className="gap-1 px-1 text-xs">
                    {r}{r < 5 && '+'} <Star size={12} className={active ? 'fill-white text-white' : 'fill-star text-star'} />
                  </Chip>
                );
              })}
            </div>
          </div>

          <PriceRangeInputs
            minPrice={value.minPrice}
            maxPrice={value.maxPrice}
            onChangeMin={(v) => onChange('minPrice', v)}
            onChangeMax={(v) => onChange('maxPrice', v)}
          />
        </Group>

        {onDone && (
          <div className="space-y-2">
            <Button className="w-full justify-center" onClick={onDone}>
              {t('search.showResults')}
              {resultsCount != null && ` (${resultsCount})`}
            </Button>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={onReset}
                className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
              >
                {t('search.reset')} <RotateCcw size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
