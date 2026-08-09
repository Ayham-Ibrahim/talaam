import { Link } from 'react-router-dom';
import { Heart, BookOpen } from 'lucide-react';
import { Card, Avatar, Button } from '@/components/ui';
import { useCurrencyStore } from '@/store';
import { formatPrice } from '@/lib/currency';
import { useT } from '@/hooks/useT';

/**
 * A course has no standalone detail page — it only ever renders inside its
 * training center's own profile (see CoursesSection). "Profile"/"view" here
 * link to /teacher/:teacherId, same as FavoriteTeacherRow links to a teacher.
 */
export function FavoriteCourseRow({ course, onRemove }) {
  const t = useT();
  const currency = useCurrencyStore((s) => s.currency);

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="flex h-[105px] w-[105px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent-purple/10">
          {course.providerAvatar ? (
            <img src={course.providerAvatar} alt={course.providerName} className="h-full w-full object-cover" />
          ) : (
            <Avatar name={course.providerName} size="xl" className="!rounded-none h-full w-full text-3xl" />
          )}
        </div>
        <div className="text-start">
          <h3 className="text-lg font-bold text-ink">{course.title}</h3>
          <p className="mt-0.5 text-ink-soft">{course.providerName}</p>
          {course.subject && (
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-ink-soft">
              <BookOpen size={14} />
              {course.subject}
            </span>
          )}
        </div>
      </div>

      <div className="flex min-w-[240px] flex-col items-start gap-2">
        {course.price != null && (
          <span className="text-lg font-bold text-primary">{formatPrice(course.price, course.currency ?? currency)}</span>
        )}
        {course.teacherId && (
          <div className="mt-1 flex items-center gap-3">
            <Link to={`/teacher/${course.teacherId}`}>
              <Button variant="outline" size="sm">
                {t('favorites.viewCourse')}
              </Button>
            </Link>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(course.id)}
        className="flex shrink-0 flex-col items-center gap-1.5 text-ink transition-opacity hover:opacity-80"
      >
        <Heart size={28} className="fill-accent-pink text-accent-pink" />
        <span className="text-sm font-semibold">{t('favorites.remove')}</span>
      </button>
    </Card>
  );
}
