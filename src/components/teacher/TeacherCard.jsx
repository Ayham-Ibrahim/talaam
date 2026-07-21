import { Link } from 'react-router-dom';
import { Card, VerifiedBadge, FavoriteButton, StarRating, Avatar, PriceTag, Skeleton } from '@/components/ui';
import { useFavoritesStore } from '@/store';
import { useT } from '@/hooks/useT';
import { motion } from 'framer-motion';

export function TeacherCard({ teacher }) {
  const t = useT();
  const isFavorite = useFavoritesStore((s) => s.isFavorite(teacher.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  return (
    <Card className="group p-3 transition-all duration-300 flex flex-col relative overflow-hidden h-full">
      {/* Top badges row */}
      <div className="flex items-center justify-between mb-2 relative z-10 transition-transform duration-300">
        {teacher.isVerified && <VerifiedBadge />}
        <FavoriteButton
          active={isFavorite}
          className="opacity-0 lg:opacity-100 lg:group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(teacher.id);
          }}
        />
      </div>

      <Link to={`/teacher/${teacher.id}`} className="flex flex-col items-center text-center flex-1 z-10">
        {/* Photo */}
        <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-accent-purple/10 flex items-center justify-center mb-3">
          {teacher.avatar ? (
            <motion.img 
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              src={teacher.avatar} 
              alt={teacher.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <Avatar name={teacher.name} size="xl" className="!rounded-none w-full h-full text-3xl" />
          )}
        </div>

        {/* Name + subject */}
        <h3 className="font-bold text-ink text-[15px]">{teacher.name}</h3>
        <p className="text-sm text-ink-soft mt-0.5">{teacher.typeLabel}</p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mt-2 text-[11px] text-ink-soft">
          <span>{teacher.stageLabel}</span>
          <span className="text-line">•</span>
          <span>{teacher.studentsCount} طالب</span>
          <span className="text-line">•</span>
          <StarRating value={teacher.rating} size={12} />
        </div>

        {/* Spacer to push price to bottom if cards are different heights */}
        <div className="flex-1" />

        {/* Price */}
        <div className="mt-3 pt-3 w-full relative">
          <div className="absolute top-0 left-4 right-4 h-px bg-line/60" />
          <PriceTag amount={teacher.minPrice} suffix={`/ ${t('teacher.perSession')}`} currency={teacher.currency} />
        </div>
      </Link>
    </Card>
  );
}

export function TeacherCardSkeleton() {
  return (
    <Card className="p-3 shadow-none border border-line/20">
      <div className="flex justify-between mb-2">
        <Skeleton className="w-20 h-6 rounded-pill" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <Skeleton className="w-full aspect-[4/5] rounded-xl mb-3" />
      <Skeleton className="w-2/3 h-4 mx-auto mb-2" />
      <Skeleton className="w-1/2 h-3 mx-auto mb-3" />
      <Skeleton className="w-1/3 h-5 mx-auto" />
    </Card>
  );
}
