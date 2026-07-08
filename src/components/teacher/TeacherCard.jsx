import { Link } from 'react-router-dom';
import { Card, VerifiedBadge, FavoriteButton, StarRating, Avatar, PriceTag, Skeleton } from '@/components/ui';
import { useFavoritesStore } from '@/store';
import { useT } from '@/hooks/useT';

export function TeacherCard({ teacher }) {
  const t = useT();
  const isFavorite = useFavoritesStore((s) => s.isFavorite(teacher.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  return (
    <Card className="p-3 hover:shadow-lift transition-shadow animate-fade-in flex flex-col">
      {/* Top badges row */}
      <div className="flex items-center justify-between mb-2">
        {teacher.isVerified && <VerifiedBadge />}
        <FavoriteButton
          active={isFavorite}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(teacher.id);
          }}
        />
      </div>

      <Link to={`/teacher/${teacher.id}`} className="flex flex-col items-center text-center">
        {/* Photo */}
        <div className="w-full aspect-square rounded-xl overflow-hidden bg-accent-purple/10 flex items-center justify-center mb-3">
          {teacher.avatar ? (
            <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
          ) : (
            <Avatar name={teacher.name} size="xl" className="!rounded-none w-full h-full text-3xl" />
          )}
        </div>

        {/* Name + subject */}
        <h3 className="font-bold text-ink text-[15px]">{teacher.name}</h3>
        <p className="text-sm text-ink-soft mt-0.5">{teacher.typeLabel}</p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mt-2 text-xs text-ink-soft">
          <span>{teacher.stageLabel}</span>
          <span className="text-line">•</span>
          <span>{teacher.studentsCount} طالب</span>
          <span className="text-line">•</span>
          <StarRating value={teacher.rating} size={12} />
        </div>

        {/* Price */}
        <div className="mt-3 pt-3 border-t border-line w-full">
          <PriceTag amount={teacher.minPrice} suffix={`/ ${t('teacher.perSession')}`} currency={teacher.currency} />
        </div>
      </Link>
    </Card>
  );
}

export function TeacherCardSkeleton() {
  return (
    <Card className="p-3">
      <div className="flex justify-between mb-2">
        <Skeleton className="w-20 h-6 rounded-pill" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <Skeleton className="w-full aspect-square rounded-xl mb-3" />
      <Skeleton className="w-2/3 h-4 mx-auto mb-2" />
      <Skeleton className="w-1/2 h-3 mx-auto mb-3" />
      <Skeleton className="w-1/3 h-5 mx-auto" />
    </Card>
  );
}
