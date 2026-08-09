import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, ChevronDown, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { FavoriteTeacherRow } from '@/components/favorites/FavoriteTeacherRow';
import { FavoriteCourseRow } from '@/components/favorites/FavoriteCourseRow';
import { ErrorState, Skeleton } from '@/components/ui';
import { useFavorites, useToggleFavoriteTeacher, useToggleFavoriteCourse } from '@/hooks/useFavorites';
import { useT } from '@/hooks/useT';

export function FavoritesPage() {
  const t = useT();
  const [q, setQ] = useState('');

  const { data, isLoading, isError, refetch } = useFavorites();
  const toggleFavoriteTeacher = useToggleFavoriteTeacher();
  const toggleFavoriteCourse = useToggleFavoriteCourse();

  const favoriteTeachers = useMemo(() => {
    const list = (data ?? []).filter((f) => f.kind === 'teacher');
    const query = q.trim();
    if (!query) return list;
    return list.filter((teacher) => teacher.name?.includes(query) || teacher.subjects.some((s) => s.includes(query)));
  }, [data, q]);

  const favoriteCourses = useMemo(() => {
    const list = (data ?? []).filter((f) => f.kind === 'course');
    const query = q.trim();
    if (!query) return list;
    return list.filter((course) => course.title?.includes(query) || course.providerName?.includes(query));
  }, [data, q]);

  const hasAnyFavorites = favoriteTeachers.length > 0 || favoriteCourses.length > 0;

  return (
    <PageContainer>
      <div className="container-app py-8">
        {hasAnyFavorites && (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 sm:w-[97px] sm:h-[97px] rounded-full bg-accent-pink/10 flex items-center justify-center shrink-0">
                  <Heart size={40} className="fill-accent-pink text-accent-pink" />
                </div>
                <div className="text-start">
                  <h1 className="text-2xl sm:text-[32px] font-bold text-ink">{t('favorites.title')}</h1>
                  <p className="text-ink-soft mt-2">{t('favorites.subtitle')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-surface shadow-soft rounded-pill pl-2 pr-5 py-2 shrink-0">
                <span className="font-medium text-ink whitespace-nowrap">
                  {favoriteTeachers.length + favoriteCourses.length} {t('favorites.count')}
                </span>
                <div className="w-[52px] h-[52px] rounded-full bg-line/40 flex items-center justify-center">
                  <Users size={22} className="text-primary" />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">{t('search.sortBy')}</span>
                <span className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-sm text-ink">
                  {t('search.sortRating')} <ChevronDown size={14} className="text-ink-soft" />
                </span>
              </div>

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
            </div>
          </>
        )}

        {/* List */}
        <div className="mt-6 flex flex-col gap-4">
          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[160px] rounded-card" />)
          ) : !hasAnyFavorites ? (
            <div className="flex flex-col items-center justify-center gap-8 py-20 text-center animate-fade-in">
              <div className="w-[97px] h-[97px] rounded-full bg-[#F5EDED] opacity-50 flex items-center justify-center">
                <Heart size={50} className="fill-[#DD2E44] text-[#DD2E44]" />
              </div>
              <div className="flex flex-col items-center opacity-50 max-w-[383px]">
                <p className="font-cairo text-[32px] font-medium leading-[60px] text-[#1E1E1E]">
                  {t('favorites.emptyTitle')}
                </p>
                <p className="font-cairo text-xl font-medium leading-[37px] text-[#626262]">
                  {t('favorites.emptyHint')}
                </p>
              </div>
              <Link
                to="/search"
                className="flex items-center justify-center w-[227px] h-12 rounded-lg bg-[#4B6898] border border-[#4B6898] font-cairo text-sm text-white"
              >
                {t('favorites.exploreTeachers')}
              </Link>
            </div>
          ) : (
            <>
              {favoriteTeachers.length > 0 && (
                <div className="flex flex-col gap-4">
                  {favoriteCourses.length > 0 && (
                    <h2 className="text-sm font-bold text-ink-soft">{t('favorites.teachersSectionTitle')}</h2>
                  )}
                  {favoriteTeachers.map((teacher) => (
                    <FavoriteTeacherRow key={teacher.id} teacher={teacher} onRemove={() => toggleFavoriteTeacher.mutate(teacher.id)} />
                  ))}
                </div>
              )}

              {favoriteCourses.length > 0 && (
                <div className="mt-4 flex flex-col gap-4">
                  {favoriteTeachers.length > 0 && (
                    <h2 className="text-sm font-bold text-ink-soft">{t('favorites.coursesSectionTitle')}</h2>
                  )}
                  {favoriteCourses.map((course) => (
                    <FavoriteCourseRow key={course.id} course={course} onRemove={() => toggleFavoriteCourse.mutate(course.id)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
