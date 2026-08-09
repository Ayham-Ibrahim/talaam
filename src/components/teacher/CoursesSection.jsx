import { useLocation, useNavigate } from 'react-router-dom';
import { Award, Laptop, Package, FlaskConical, Video, CalendarRange } from 'lucide-react';
import { EmptyState, ErrorState, FavoriteButton, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites, useToggleFavoriteCourse } from '@/hooks/useFavorites';
import { useT } from '@/hooks/useT';
import { useCurrencyStore } from '@/store';
import { formatPrice } from '@/lib/currency';
import { formatDate } from '@/lib/formatters';

const COURSE_ACCENTS = [
  { bg: '#FDEAE3', solid: '#F74E28' },
  { bg: '#EBE5FC', solid: '#7E57C2' },
  { bg: '#E3F1FD', solid: '#2F80ED' },
  { bg: '#F7E6EE', solid: '#B00852' },
  { bg: '#E3F5EC', solid: '#2E9E6B' },
];

/** Structured yes/no facts every trainee should see regardless of how detailed the free-text description is */
function CourseFactBadge({ active, icon: Icon, label }) {
  if (!active) return null;
  return (
    <span className="flex items-center gap-1 rounded-pill bg-[#F2F2F7] px-2.5 py-1 text-xs font-medium text-ink-soft">
      <Icon size={13} />
      {label}
    </span>
  );
}

function CourseCard({ course, index, selected, onSelect, isFavorite, onToggleFavorite }) {
  const t = useT();
  const currency = useCurrencyStore((s) => s.currency);
  const accent = COURSE_ACCENTS[index % COURSE_ACCENTS.length];

  return (
    <div
      style={{ '--accent': accent.solid, '--accent-bg': accent.bg }}
      className={`group flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift ${
        selected ? 'border-[var(--accent)] bg-[var(--accent-bg)]/40' : 'border-line bg-white hover:border-[var(--accent)]'
      }`}
    >
      <div className="flex items-start justify-between gap-2 text-start">
        <div>
          <h4 className="font-bold text-ink">{course.title}</h4>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
            <CalendarRange size={13} />
            {formatDate(course.startDate)} — {formatDate(course.endDate)}
          </p>
        </div>
        <FavoriteButton active={isFavorite} onClick={() => onToggleFavorite(course.id)} className="shrink-0" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <CourseFactBadge active={course.hasCertificate} icon={Award} label={t('teacher.course.hasCertificate')} />
        <CourseFactBadge active={course.requiresLaptop} icon={Laptop} label={t('teacher.course.requiresLaptop')} />
        <CourseFactBadge active={course.materialsIncluded} icon={Package} label={t('teacher.course.materialsIncluded')} />
        <CourseFactBadge active={course.hasPracticalExercises} icon={FlaskConical} label={t('teacher.course.hasPracticalExercises')} />
        <CourseFactBadge active={course.sessionsRecorded} icon={Video} label={t('teacher.course.sessionsRecorded')} />
      </div>

      <div className="flex items-baseline justify-end gap-2">
        <span className="text-2xl font-bold text-[var(--accent)]">{formatPrice(course.price, currency)}</span>
      </div>

      <button
        type="button"
        onClick={() => onSelect(course)}
        className={`w-full rounded-2xl border border-[var(--accent)] py-2.5 text-sm font-medium transition-colors duration-200 ${
          selected
            ? 'bg-[var(--accent)] text-white'
            : 'bg-transparent text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
        }`}
      >
        {t('teacher.course.chooseCourse')}
      </button>
    </div>
  );
}

export function CoursesSection({ courses, isLoading, isError, refetch, selectedCourseId, onSelect }) {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: favorites } = useFavorites();
  const toggleFavoriteCourse = useToggleFavoriteCourse();
  const favoriteCourseIds = new Set((favorites ?? []).filter((f) => f.kind === 'course').map((f) => f.id));

  const handleToggleFavorite = (courseId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    toggleFavoriteCourse.mutate(courseId);
  };

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-start font-bold text-ink">{t('teacher.course.sectionTitle')}</h3>
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState title={t('teacher.course.empty')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              selected={course.id === selectedCourseId}
              onSelect={onSelect}
              isFavorite={favoriteCourseIds.has(course.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
