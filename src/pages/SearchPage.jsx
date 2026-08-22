import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { SearchHero } from '@/components/search/SearchHero';
import { SearchFilters } from '@/components/search/SearchFilters';
import { TeacherCard, TeacherCardSkeleton } from '@/components/teacher/TeacherCard';
import { EmptyState, ErrorState } from '@/components/ui';
import { useTeachers } from '@/hooks/useTeachers';
import { useFilters } from '@/hooks/useMeta';
import { useT } from '@/hooks/useT';

const DEFAULT_DRAFT = { level: null, grade: null, subject: null, stage: null, language: null, availability: null, minPrice: null, minRating: null };

export function SearchPage() {
  const t = useT();
  const [searchParams] = useSearchParams();

  const [type, setType] = useState(null);
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [applied, setApplied] = useState(DEFAULT_DRAFT);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: meta } = useFilters();

  const filters = useMemo(
    () => ({
      // `type` (hero pills) and `applied.level` (sidebar select) both drive the
      // same teacher_type filter — the hero pill wins when both are set.
      type: type ?? applied.level,
      subject: applied.subject ?? undefined,
      stage: applied.stage ?? undefined,
      language: applied.language ?? undefined,
      q: q || undefined,
      minPrice: applied.minPrice ?? undefined,
      minRating: applied.minRating ?? undefined,
      sort: 'rating',
    }),
    [type, q, applied]
  );

  const { data, isLoading, isError, refetch } = useTeachers(filters);

  const handleDraftChange = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  // Applying/resetting on mobile collapses the drawer back down so the
  // (now updated) results are immediately visible instead of staying
  // hidden behind the open filter panel.
  const handleApply = () => {
    setApplied(draft);
    setFiltersOpen(false);
  };
  const handleReset = () => {
    setDraft(DEFAULT_DRAFT);
    setApplied(DEFAULT_DRAFT);
    setType(null);
    setFiltersOpen(false);
  };

  return (
    <PageContainer>
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
            <SearchFilters meta={meta} draft={draft} onChange={handleDraftChange} onApply={handleApply} onReset={handleReset} />
          </div>

          <div className="flex-1">
            <SearchHero activeType={type} onSelectType={setType} />

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
                        draft={draft}
                        onChange={handleDraftChange}
                        onApply={handleApply}
                        onReset={handleReset}
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
                <span className="text-sm font-bold text-primary">{t('search.sortBy')}</span>
                <span className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-sm text-ink">
                  {t('search.sortRating')} <ChevronDown size={14} className="text-ink-soft" />
                </span>
              </div>
            </div>

            {/* Results grid */}
            <div className="mt-6">
              {isError ? (
                <ErrorState onRetry={refetch} />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => <TeacherCardSkeleton key={i} />)
                    : data?.data?.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)}
                </div>
              )}
              {!isLoading && !isError && data?.data?.length === 0 && (
                <EmptyState title={t('states.empty')} hint={t('states.emptyHint')} />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
