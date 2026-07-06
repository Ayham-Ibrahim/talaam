import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
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

  const { data: meta } = useFilters();

  const filters = useMemo(
    () => ({
      type,
      q: q || undefined,
      minPrice: applied.minPrice ?? undefined,
      minRating: applied.minRating ?? undefined,
      sort: 'rating',
    }),
    [type, q, applied]
  );

  const { data, isLoading, isError, refetch } = useTeachers(filters);

  const handleDraftChange = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const handleApply = () => setApplied(draft);
  const handleReset = () => {
    setDraft(DEFAULT_DRAFT);
    setApplied(DEFAULT_DRAFT);
    setType(null);
  };

  return (
    <PageContainer>
      <div className="container-app py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <SearchFilters meta={meta} draft={draft} onChange={handleDraftChange} onApply={handleApply} onReset={handleReset} />

          <div className="flex-1">
            <SearchHero activeType={type} onSelectType={setType} />

            {/* Sort + search row */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="w-full max-w-sm">
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
