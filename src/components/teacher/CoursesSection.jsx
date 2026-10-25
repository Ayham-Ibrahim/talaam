import { useLocation, useNavigate } from 'react-router-dom';
import { Award, Laptop, Package, FlaskConical, Video, CalendarRange, Check, GraduationCap } from 'lucide-react';
import { ErrorState, FavoriteButton, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites, useToggleFavoriteCourse } from '@/hooks/useFavorites';
import { useT } from '@/hooks/useT';
import { useCurrencyStore } from '@/store';
import { formatPrice } from '@/lib/currency';
import { formatDate, isPastDate } from '@/lib/formatters';

/** نفس تدرّجات بطاقات باقات المعلم (PackagesSection.jsx) حرفياً — هوية بصرية واحدة لكل بطاقات الباقات بالمنصة */
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #5B8DEF 0%, #3D63C9 100%)',
  'linear-gradient(135deg, #8B7BEA 0%, #4E3FB0 100%)',
  'linear-gradient(135deg, #EA7BA0 0%, #F0A868 100%)',
  'linear-gradient(135deg, #34C3B8 0%, #2E8FC0 100%)',
  'linear-gradient(135deg, #E0607A 0%, #B33B63 100%)',
  'linear-gradient(135deg, #6DC0E0 0%, #4A6FE0 100%)',
];

/** Structured yes/no facts every trainee should see regardless of how detailed the free-text description is */
function CourseFactBadge({ active, icon: Icon, label }) {
  if (!active) return null;
  return (
    <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white/85">
      <Icon size={13} />
      {label}
    </span>
  );
}

function CourseCard({ course, index, selected, onSelect, isFavorite, onToggleFavorite }) {
  const t = useT();
  const currency = useCurrencyStore((s) => s.currency);
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const isEnded = isPastDate(course.endDate);

  return (
    <div
      style={{ background: gradient }}
      className={`relative flex min-h-[290px] flex-col rounded-2xl p-5 text-start shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition ${
        isEnded ? 'opacity-60 grayscale-[30%]' : ''
      } ${selected ? 'ring-4 ring-white/80' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm">
          <GraduationCap size={13} />
          {t('teacher.course.sectionTitle')}
        </span>
        <FavoriteButton active={isFavorite} onClick={() => onToggleFavorite(course.id)} className="shrink-0" />
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-bold leading-snug text-white">{course.title}</h4>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white/75">
          <CalendarRange size={13} />
          {formatDate(course.startDate)} — {formatDate(course.endDate)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <CourseFactBadge active={course.hasCertificate} icon={Award} label={t('teacher.course.hasCertificate')} />
        <CourseFactBadge active={course.requiresLaptop} icon={Laptop} label={t('teacher.course.requiresLaptop')} />
        <CourseFactBadge active={course.materialsIncluded} icon={Package} label={t('teacher.course.materialsIncluded')} />
        <CourseFactBadge active={course.hasPracticalExercises} icon={FlaskConical} label={t('teacher.course.hasPracticalExercises')} />
        <CourseFactBadge active={course.sessionsRecorded} icon={Video} label={t('teacher.course.sessionsRecorded')} />
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-4">
        <span dir="ltr" className="text-2xl font-bold leading-none text-white">
          {isEnded ? t('teacher.course.ended') : formatPrice(course.price, currency)}
        </span>

        <button
          type="button"
          disabled={isEnded}
          onClick={() => onSelect(course)}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-sm font-semibold text-[#1E1E1E] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selected && <Check size={15} strokeWidth={3} />}
          {isEnded ? t('teacher.course.ended') : t('teacher.course.chooseCourse')}
        </button>
      </div>
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

  if (!isLoading && !isError && courses.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-start font-bold text-ink">{t('teacher.course.sectionTitle')}</h3>
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[290px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
