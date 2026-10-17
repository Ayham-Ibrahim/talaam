import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AcademicSupporterCard, AcademicSupporterCardSkeleton } from '@/components/academicSupporter/AcademicSupporterCard';
import { EmptyState, ErrorState } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useInfiniteAcademicSupporters } from '@/hooks/useAcademicSupporterBrowse';
import { useInfiniteScrollTrigger } from '@/hooks/useInfiniteScrollTrigger';
import { useT } from '@/hooks/useT';

/** حصراً للطالب الجامعي — بوابة الدخول الوحيدة لتصفّح الداعمين الأكاديميين (لا كارد عام بالصفحة الرئيسية). */
export function AcademicSupporterBrowsePage() {
  const t = useT();
  const { user } = useAuth();
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAcademicSupporters();
  const supporters = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const sentinelRef = useInfiniteScrollTrigger({
    onIntersect: fetchNextPage,
    enabled: Boolean(hasNextPage) && !isFetchingNextPage && !isLoading,
  });

  if (!user) return <Navigate to="/login" replace />;
  if (user.student?.education_type !== 'university') return <Navigate to="/dashboard/student" replace />;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('academicSupporter.browse.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('academicSupporter.browse.subtitle')}</p>
        </div>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : !isLoading && supporters.length === 0 ? (
          <EmptyState title={t('academicSupporter.browse.empty')} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <AcademicSupporterCardSkeleton key={i} />)
                : supporters.map((s) => <AcademicSupporterCard key={s.id} supporter={s} />)}
              {isFetchingNextPage && Array.from({ length: 3 }).map((_, i) => <AcademicSupporterCardSkeleton key={`next-${i}`} />)}
            </div>
            {!isLoading && hasNextPage && <div ref={sentinelRef} aria-hidden="true" className="h-1" />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
