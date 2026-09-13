import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BadgeCheck, Clock3, GraduationCap, Layers, MapPin } from 'lucide-react';
import { FavoriteButton, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites, useToggleFavoriteTeacher } from '@/hooks/useFavorites';

/** Our own brand tokens, not arbitrary colors — one assigned per card, stable per teacher id (no purple, it's not part of this rotation) */
const ACCENT_PALETTE = ['#3B5998', '#C2185B', '#2E9E6B', '#2F80ED', '#F5A623'];

function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-ink-soft">
      <Icon size={14} className="shrink-0 text-ink-soft/70" />
      <span className="line-clamp-1">{children}</span>
    </div>
  );
}

/**
 * Two stacked white "layers" (a bigger back card peeking out behind the
 * smaller front one), no borders — just their own soft shadows for depth.
 * Avatar sits top-center with a verified checkmark badge on its own corner,
 * colored with the card's own accent instead of a fixed color; only fields
 * the search endpoint actually returns are rendered (teacherService.mapSearchResult).
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
  const accent = ACCENT_PALETTE[teacher.id % ACCENT_PALETTE.length];
  const stagesLabel = teacher.stages?.length > 0 ? teacher.stages.join('، ') : null;

  return (
    <div className="group relative h-[400px]">
      {/* Back layer — bigger than the front card, white, soft shadow like the reference, offset toward the bottom-right only (kept tight enough it doesn't wrap into the top-right/bottom-left corners) */}
      <div
        className="absolute -inset-1 rounded-[28px] bg-white shadow-[8px_10px_20px_rgba(17,24,39,0.10)]"
        aria-hidden="true"
      />

      {/* Front layer — the real card, ~9/10 of the back layer's width (percentage margin, true ratio at every breakpoint), its own bottom-right soft shadow, no border. Stays in normal flow — this is what gives the card its real height; making it absolute too (as a percentage-inset attempt once did) collapses the whole card to 0px since nothing would be left to size the grid row. A fixed height on the outer wrapper (rather than h-full) is what keeps every card the same height regardless of how much optional data a given teacher has — CSS grid only stretches items to match within their own row, not across rows. */}
      <div className="relative mx-[5%] my-3 flex h-[calc(100%-24px)] flex-col overflow-hidden rounded-[28px] bg-surface shadow-[8px_10px_22px_rgba(17,24,39,0.16)] transition-shadow duration-200 hover:shadow-[10px_13px_26px_rgba(17,24,39,0.2)]">
        <FavoriteButton
          active={isFavorite}
          onClick={handleToggleFavorite}
          className="absolute right-3 top-3 z-20 cursor-pointer transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 motion-reduce:transition-none motion-reduce:hover:scale-100"
        />

        <Link
          to={profileHref}
          className="relative z-10 flex flex-1 cursor-pointer flex-col items-center px-5 pb-5 pt-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {/* Avatar — top-center, soft light ring, verified checkmark on its own corner */}
          <div className="relative shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-white shadow-[0_10px_24px_rgba(17,24,39,0.22)] ring-[3px] ring-white transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              {teacher.avatar ? (
                <img src={teacher.avatar} alt={teacher.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold" style={{ color: accent }}>
                  {initials || teacher.name?.charAt(0) || '؟'}
                </span>
              )}
            </div>
            {teacher.isVerified && (
              <span
                className="absolute -top-1 end-[-2px] flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white"
                style={{ background: accent }}
              >
                <BadgeCheck size={14} aria-hidden="true" />
              </span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-1 text-[15px] font-bold text-ink">{teacher.name}</h3>
          {teacher.qualification && (
            <span
              className="mt-1.5 w-fit rounded-pill px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: `${accent}1A`, color: accent }}
            >
              {teacher.qualification}
            </span>
          )}

          {(teacher.experienceShort || stagesLabel || teacher.city || teacher.completedSessions != null) && (
            <div className="mt-3 flex w-full flex-col gap-1.5 text-start">
              {teacher.experienceShort && <InfoRow icon={Clock3}>{teacher.experienceShort}</InfoRow>}
              {stagesLabel && <InfoRow icon={GraduationCap}>{stagesLabel}</InfoRow>}
              {teacher.city && <InfoRow icon={MapPin}>{teacher.city}</InfoRow>}
              {teacher.completedSessions != null && teacher.completedSessions > 0 && (
                <InfoRow icon={Layers}>{teacher.completedSessions} حصة مكتملة</InfoRow>
              )}
            </div>
          )}

          <div className="flex-1" />

          <span
            className="mt-4 inline-flex w-full cursor-pointer items-center justify-center py-2 text-sm font-bold transition-opacity duration-200 group-hover:opacity-70"
            style={{ color: accent }}
          >
            عرض الملف الشخصي
          </span>
        </Link>
      </div>
    </div>
  );
}

export function TeacherCardSkeleton() {
  return (
    <div className="relative h-[400px]">
      <div className="absolute -inset-1 rounded-[28px] bg-white shadow-[8px_10px_20px_rgba(17,24,39,0.10)]" aria-hidden="true" />
      <div className="relative mx-[5%] my-3 flex h-[calc(100%-24px)] flex-col overflow-hidden rounded-[28px] bg-surface px-5 pb-5 pt-6 shadow-[8px_10px_22px_rgba(17,24,39,0.16)]">
        <div className="flex flex-1 flex-col items-center">
          <Skeleton className="h-20 w-20 shrink-0 rounded-full ring-[3px] ring-white" />
          <Skeleton className="mt-3 h-4 w-2/3" />
          <Skeleton className="mt-2 h-5 w-20 rounded-pill" />
          <div className="mt-3 flex w-full flex-col gap-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="mt-4 h-9 w-full rounded-btn" />
        </div>
      </div>
    </div>
  );
}
