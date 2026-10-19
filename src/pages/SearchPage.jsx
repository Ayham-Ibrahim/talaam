import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, SlidersHorizontal, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Seo } from '@/components/seo/Seo';
import { teacherListJsonLd } from '@/lib/seo';
import { SearchHero } from '@/components/search/SearchHero';
import { SearchFilters } from '@/components/search/SearchFilters';
import { TeacherCard, TeacherCardSkeleton } from '@/components/teacher/TeacherCard';
import { Button, EmptyState, ErrorState } from '@/components/ui';
import { useInfiniteTeachers } from '@/hooks/useTeachers';
import { useInfiniteScrollTrigger } from '@/hooks/useInfiniteScrollTrigger';
import { useFilters } from '@/hooks/useMeta';
import { useT } from '@/hooks/useT';

const DEFAULT_FILTERS = { level: null, stage: null, grade: null, subject: null, curriculum: null, language: null, minPrice: null, maxPrice: null, minRating: null };

// تغيير حقل أب يمسح الحقول التابعة له — كي لا تبقى مثلاً "الصف 11" مختارة بعد
// التحويل لـ"جامعي"، أو مادة مدرسية بعد التحويل لـ"دورات" (قوائمها تتغير مع النوع).
const DEPENDENTS = {
  level: ['stage', 'grade', 'subject', 'curriculum'],
  stage: ['grade'],
};

const PRICE_DEBOUNCE_MS = 500;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const optionLabel = (options, value) =>
  options?.find((o) => String(o.value) === String(value))?.label ?? String(value);

export function SearchPage() {
  const t = useT();
  const [searchParams] = useSearchParams();

  // يدعم الدخول المباشر برابط مُفلتَر مسبقاً (مثلاً بطاقات "أنواع التعليم" في
  // الصفحة الرئيسية: /search?type=school) — القيمة الأولية فقط عبر دالة lazy
  // init، لا تتزامن مع الرابط بعدها؛ اختيار المستخدم اليدوي هو مصدر الحقيقة لاحقاً.
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  // الفلاتر تُطبَّق فوراً عند الاختيار (لا draft/زر تطبيق) — ما عدا حقلَي
  // السعر المكتوبين يدوياً فيُؤخَّران قليلاً كي لا يُرسَل طلب لكل رقم.
  const [values, setValues] = useState(() => ({ ...DEFAULT_FILTERS, level: searchParams.get('type') }));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const minPrice = useDebouncedValue(values.minPrice, PRICE_DEBOUNCE_MS);
  const maxPrice = useDebouncedValue(values.maxPrice, PRICE_DEBOUNCE_MS);

  // المواد/المراحل تُجلَب حسب نوع التعليم المختار كي لا تُعرض مواد جامعية
  // ضمن "مدرسي" مثلاً.
  const { data: meta } = useFilters(values.level ?? undefined);

  const filters = useMemo(
    () => ({
      type: values.level ?? undefined,
      subject: values.subject ?? undefined,
      curriculum: values.curriculum ?? undefined,
      stage: values.stage ?? undefined,
      grade: values.grade ?? undefined,
      language: values.language ?? undefined,
      q: q || undefined,
      minPrice: minPrice ?? undefined,
      maxPrice: maxPrice ?? undefined,
      minRating: values.minRating ?? undefined,
      sort: 'rating',
    }),
    [q, values.level, values.subject, values.curriculum, values.stage, values.grade, values.language, values.minRating, minPrice, maxPrice]
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTeachers(filters);
  const teachers = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const total = data?.pages[0]?.total;

  const sentinelRef = useInfiniteScrollTrigger({
    onIntersect: fetchNextPage,
    enabled: Boolean(hasNextPage) && !isFetchingNextPage && !isLoading,
  });

  const handleChange = (key, value) =>
    setValues((prev) => {
      if (prev[key] === value) return prev;
      const next = { ...prev, [key]: value };
      (DEPENDENTS[key] ?? []).forEach((dep) => {
        next[dep] = null;
      });
      // الصف قد يُختار قبل المرحلة — نُبقيه إن كان ضمن نطاق المرحلة الجديدة
      if (key === 'stage' && prev.grade) {
        const stageGrades = value ? meta?.stageGrades?.[value] : null;
        if (!stageGrades || stageGrades.includes(String(prev.grade))) next.grade = prev.grade;
      }
      return next;
    });
  const handleReset = () => {
    setValues(DEFAULT_FILTERS);
    setFiltersOpen(false);
  };

  // شرائح الفلاتر النشطة فوق النتائج — كل شريحة تُزال بنقرة وتمرّ بنفس
  // handleChange فتمسح توابعها كذلك.
  const typeLabels = t('search.categories');
  const activeChips = [
    values.level && { key: 'level', label: typeLabels[['school', 'university', 'training'].indexOf(values.level)] },
    values.stage && { key: 'stage', label: optionLabel(meta?.stages, values.stage) },
    values.grade && { key: 'grade', label: optionLabel(meta?.grades, values.grade) },
    values.subject && { key: 'subject', label: optionLabel(meta?.subjects, values.subject) },
    values.curriculum && { key: 'curriculum', label: optionLabel(meta?.curricula, values.curriculum) },
    values.language && { key: 'language', label: optionLabel(meta?.languages, values.language) },
    values.minRating != null && { key: 'minRating', label: <>{values.minRating}{values.minRating < 5 && '+'} <Star size={12} className="fill-star text-star" /></> },
    (values.minPrice != null || values.maxPrice != null) && {
      key: 'price',
      label: `${t('search.price')}: ${values.minPrice ?? 0} – ${values.maxPrice ?? '∞'}`,
    },
  ].filter(Boolean);
  const removeChip = (key) => {
    if (key === 'price') {
      setValues((prev) => ({ ...prev, minPrice: null, maxPrice: null }));
    } else {
      handleChange(key, null);
    }
  };

  const seoTitle = q
    ? `نتائج البحث عن "${q}" | مدرسون معتمدون - TAALAM`
    : 'ابحث عن معلم خصوصي معتمد | TAALAM';
  const seoDescription = q
    ? `تصفّح أفضل المعلمين المعتمدين لـ "${q}" على TAALAM — قارن التقييمات والمناهج واللغات واحجز حصتك مباشرة.`
    : 'تصفّح وقارن بين مئات المعلمين المعتمدين حسب المادة والمرحلة والمنهج واللغة والتقييم، واحجز حصتك الخصوصية الآن على TAALAM.';

  return (
    <PageContainer>
      <Seo title={seoTitle} description={seoDescription} path="/search" jsonLd={teacherListJsonLd(teachers)} />
      <div className="container-app py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/*
            Below `lg`, this used to be a permanently-expanded ~6-field
            filter panel that rendered FIRST in DOM — i.e. above SearchHero
            and above any results, so mobile visitors had to scroll past
            the entire filter form before seeing anything else. Desktop is
            unchanged (still the permanent sidebar); mobile now gets
            SearchHero first, with filters tucked behind a collapsed
            toggle further down the page (see below).
          */}
          <div className="hidden lg:block">
            <SearchFilters meta={meta} value={values} onChange={handleChange} onReset={handleReset} />
          </div>

          <div className="flex-1">
            <SearchHero activeType={values.level} onSelectType={(v) => handleChange('level', v)} />

            {/* Mobile-only filter toggle + collapsible drawer */}
            <div className="mt-4 lg:hidden">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  {t('search.filterTitle')}
                  {activeChips.length > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">{activeChips.length}</span>
                  )}
                </span>
                <motion.span
                  animate={{ rotate: filtersOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="motion-reduce:transition-none"
                >
                  <ChevronDown size={16} className="text-ink-soft" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {filtersOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-2xl border border-line bg-surface p-5">
                      <SearchFilters
                        meta={meta}
                        value={values}
                        onChange={handleChange}
                        onReset={handleReset}
                        onDone={() => setFiltersOpen(false)}
                        resultsCount={total}
                        hideHeading
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort + search row */}
            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
              <div className="w-full sm:max-w-sm">
                <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t('search.searchPlaceholder')}
                    className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
                  />
                  <Search size={18} className="text-ink-soft" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {total != null && (
                  <span className="text-sm text-ink-soft">
                    <span className="font-bold text-ink">{total}</span> {t('search.resultsCount')}
                  </span>
                )}
                <span className="text-sm font-bold text-primary">{t('search.sortBy')}</span>
                <span className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-sm text-ink">
                  {t('search.sortRating')} <ChevronDown size={14} className="text-ink-soft" />
                </span>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeChip(chip.key)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    {chip.label}
                    <X size={12} />
                  </button>
                ))}
                <button type="button" onClick={handleReset} className="text-xs font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline">
                  {t('search.clearAll')}
                </button>
              </div>
            )}

            {/* Results grid — infinite scroll: the sentinel div past the last card
                triggers fetchNextPage() once it nears the viewport (see
                useInfiniteScrollTrigger), appending the next backend page
                instead of a "load more" click or fetching everything up front. */}
            <div className="mt-6">
              {isError ? (
                <ErrorState onRetry={refetch} />
              ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-3">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => <TeacherCardSkeleton key={i} />)
                    : teachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)}
                  {isFetchingNextPage &&
                    Array.from({ length: 3 }).map((_, i) => <TeacherCardSkeleton key={`next-${i}`} />)}
                </div>
              )}
              {!isLoading && hasNextPage && <div ref={sentinelRef} aria-hidden="true" className="h-1" />}
              {!isLoading && !isError && teachers.length === 0 && (
                activeChips.length > 0 ? (
                  <EmptyState
                    title={t('search.emptyFiltered')}
                    hint={t('search.emptyFilteredHint')}
                    action={<Button variant="outline" onClick={handleReset}>{t('search.clearAll')}</Button>}
                  />
                ) : (
                  <EmptyState title={t('states.empty')} hint={t('states.emptyHint')} />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
