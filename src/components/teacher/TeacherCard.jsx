import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BadgeCheck, Sparkles, Clock3 } from 'lucide-react';
import { FavoriteButton, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites, useToggleFavoriteTeacher } from '@/hooks/useFavorites';

/**
 * Redesigned around the fields actually available on a search-result teacher
 * (see teacherService.mapSearchResult): id, name, avatar, isVerified, typeLabel.
 *
 * ASSUMPTION: `teacher.isExpert` and `teacher.yearsExperience` are NOT part of
 * mapSearchResult today, so those two badges will simply never render until a
 * backend/mapping change adds them (out of scope here — presentation only).
 * The card is written to pick them up automatically the moment they exist —
 * no future changes to this file would be needed.
 *
 * "Specialty" maps to `typeLabel` (e.g. "مدرسي" / "مدرب") — the closest
 * available field; subject-level specialty only exists on the full profile
 * fetch, not the lightweight search/list result this card is built from.
 */
export function TeacherCard({ teacher }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: favorites } = useFavorites();
  const toggleFavoriteTeacher = useToggleFavoriteTeacher();
  const isFavorite = (favorites ?? []).some((f) => f.kind === 'teacher' && f.id === teacher.id);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    toggleFavoriteTeacher.mutate(teacher.id);
  };

  const profileHref = `/teacher/${teacher.id}`;
  const initials = (teacher.name ?? '')
    .replace(/^[أا]\.\s*/, '')
    .trim()
    .charAt(0);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-card transition-shadow duration-200 hover:shadow-lift">
      {/* Soft colored header band — on-brand navy tint, not a purple placeholder */}
      <div className="h-16 shrink-0 bg-gradient-to-b from-primary-light to-primary-light/40" aria-hidden="true" />

      <FavoriteButton
        active={isFavorite}
        onClick={handleToggleFavorite}
        className="absolute left-3 top-3 z-10 cursor-pointer transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 motion-reduce:transition-none motion-reduce:hover:scale-100"
      />

      <Link
        to={profileHref}
        className="flex flex-1 cursor-pointer flex-col items-center rounded-t-none px-4 pb-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {/* Circular avatar, overlapping the header band — real photo, or a
            colored-initials fallback (no purple placeholder rectangle) */}
        <div className="-mt-9 h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-primary-light ring-4 ring-surface transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
          {teacher.avatar ? (
            <img src={teacher.avatar} alt={teacher.name} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">
              {initials || teacher.name?.charAt(0) || '؟'}
            </span>
          )}
        </div>

        <h3 className="mt-3 line-clamp-1 text-[15px] font-bold text-ink">{teacher.name}</h3>
        {teacher.typeLabel && <p className="mt-0.5 text-sm text-ink-soft">{teacher.typeLabel}</p>}

        {/* Badge pills — each hidden entirely when its data isn't available,
            never rendered empty/zero (per the no-fake-stats rule) */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
          {teacher.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-success-light px-2.5 py-1 text-[11px] font-semibold text-success">
              <BadgeCheck size={12} aria-hidden="true" />
              موثّق
            </span>
          )}
          {teacher.isExpert && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-star/10 px-2.5 py-1 text-[11px] font-semibold text-star">
              <Sparkles size={12} aria-hidden="true" />
              خبير
            </span>
          )}
          {Boolean(teacher.yearsExperience) && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-accent-pink/10 px-2.5 py-1 text-[11px] font-semibold text-accent-pink">
              <Clock3 size={12} aria-hidden="true" />
              {teacher.yearsExperience} سنوات خبرة
            </span>
          )}
        </div>

        <div className="flex-1" />

        <span className="mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-btn bg-primary py-2 text-sm font-medium text-white transition-colors duration-200 group-hover:bg-primary-hover">
          عرض الملف
        </span>
      </Link>
    </div>
  );
}

export function TeacherCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border border-line/20 bg-surface shadow-card">
      <Skeleton className="h-16 w-full rounded-none" />
      <div className="flex flex-1 flex-col items-center px-4 pb-4">
        <Skeleton className="-mt-9 h-[72px] w-[72px] shrink-0 rounded-full ring-4 ring-surface" />
        <Skeleton className="mt-3 h-4 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/2" />
        <div className="mt-2.5 flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-pill" />
          <Skeleton className="h-5 w-16 rounded-pill" />
        </div>
        <Skeleton className="mt-4 h-9 w-full rounded-btn" />
      </div>
    </div>
  );
}
