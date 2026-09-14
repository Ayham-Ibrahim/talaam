import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BadgeCheck, GraduationCap, Globe, Layers, MapPin, Star, Users, Wallet } from 'lucide-react';
import { FavoriteButton, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites, useToggleFavoriteTeacher } from '@/hooks/useFavorites';
import { useCurrencyStore } from '@/store';
import { convertPrice } from '@/lib/currency';

const CURRENCY_SYMBOL = { USD: '$', EUR: '€', GBP: '£' };

/** Our own brand tokens, not arbitrary colors — one assigned per card, stable per teacher id (no purple, it's not part of this rotation) */
const ACCENT_PALETTE = ['#3B5998', '#C2185B', '#2E9E6B', '#2F80ED', '#F5A623'];

/** One stat cell — no label, just the value (already worded to carry its own meaning, e.g. "50+ جلسة") with a colored dot or icon prefix */
function StatCell({ value, dot, icon: Icon }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-sm font-bold text-ink">
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} aria-hidden="true" />}
      {Icon && <Icon size={14} className="shrink-0 text-ink-soft" aria-hidden="true" />}
      <span className="truncate">{value}</span>
    </div>
  );
}

/** A labeled row of pill chips (subjects/curricula) — the array-shaped data, styled like the reference's "investors" row. Shows every item, no overflow cap. */
function ChipSection({ label, items, accent }) {
  return (
    <div className="text-start">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-ink-soft/55">{label}</span>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-pill border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: `${accent}33`, color: accent, background: `${accent}0D` }}
          >
            {item}
          </span>
        ))}
      </div>
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
  const currency = useCurrencyStore((s) => s.currency);
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
  const languagesLabel = teacher.languages?.length > 0 ? teacher.languages.join('، ') : null;
  const priceLabel =
    teacher.minPrice != null && teacher.maxPrice != null
      ? teacher.minPrice === teacher.maxPrice
        ? `${convertPrice(teacher.minPrice, currency).toLocaleString('en-US')} ${CURRENCY_SYMBOL[currency] ?? currency} / الساعة`
        : `${convertPrice(teacher.minPrice, currency).toLocaleString('en-US')}–${convertPrice(teacher.maxPrice, currency).toLocaleString('en-US')} ${CURRENCY_SYMBOL[currency] ?? currency} / الساعة`
      : null;

  // كل خلية تُبنى فقط عندما تتوفّر بيانات حقيقية لها (لا سقف ثابت)، والألوان
  // تدويرية من هويتنا لا اعتباطية. بلا عناوين فوق القيم — كل قيمة مكتوبة
  // لتحمل معناها بنفسها (مثال: "50+ جلسة"). ترتيب ثابت بطلب صريح: عمود
  // الخبرة/اللغات وعمود الجلسات/السعر/الطلاب جنباً إلى جنب في صف أول من
  // عمودين، ثم الموقع والمرحلة أسفلهما في صف ثانٍ بعمود واحد.
  const rightColumn = [
    teacher.experienceShort && { key: 'experience', value: teacher.experienceShort, dot: accent },
    languagesLabel && { key: 'languages', value: languagesLabel, icon: Globe },
  ].filter(Boolean);
  const leftColumn = [
    teacher.completedSessions > 0 && { key: 'sessions', value: `${teacher.completedSessions}+ جلسة`, icon: Layers },
    priceLabel && { key: 'price', value: priceLabel, icon: Wallet },
    teacher.totalStudents > 0 && { key: 'students', value: `${teacher.totalStudents}+ طالب`, icon: Users },
  ].filter(Boolean);
  const belowRows = [
    teacher.city && { key: 'city', value: teacher.city, icon: MapPin },
    stagesLabel && { key: 'stage', value: stagesLabel, icon: GraduationCap },
  ].filter(Boolean);

  return (
    <div className="group relative h-[500px]">
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
          className="relative z-10 flex flex-1 cursor-pointer flex-col px-5 pb-5 pt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {/* Header row — avatar physically on the left, name/rating/badges to its right. flex-row-reverse (not just swapping start/end) so the avatar lands on the physical left regardless of page direction — the heart button above is pinned to the physical top-right the same way. */}
          <div className="flex w-full flex-row-reverse items-center gap-2 text-start sm:gap-3">
            <div className="relative shrink-0">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-white shadow-[0_10px_24px_rgba(17,24,39,0.22)] ring-[3px] ring-white transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:h-24 sm:w-24">
                {teacher.avatar ? (
                  <img src={teacher.avatar} alt={teacher.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-base font-bold sm:text-3xl" style={{ color: accent }}>
                    {initials || teacher.name?.charAt(0) || '؟'}
                  </span>
                )}
              </div>
              {teacher.isVerified && (
                <span
                  className="absolute -top-1 end-[-2px] flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-white sm:h-8 sm:w-8"
                  style={{ background: accent }}
                >
                  <BadgeCheck size={12} className="shrink-0 sm:hidden" aria-hidden="true" />
                  <BadgeCheck size={18} className="hidden shrink-0 sm:block" aria-hidden="true" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 sm:pr-8">
              <div className="flex min-w-0 items-center gap-1.5">
                <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-ink sm:flex-initial sm:text-lg">{teacher.name}</h3>
                {teacher.reviewsCount > 0 && (
                  <span className="hidden shrink-0 items-center gap-0.5 text-sm font-bold text-star sm:flex">
                    <Star size={13} className="fill-star text-star" />
                    {teacher.rating.toFixed(1)}
                  </span>
                )}
              </div>

              {(teacher.qualification || teacher.availableToday) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {teacher.qualification && (
                    <span
                      className="w-fit whitespace-nowrap rounded-pill px-2.5 py-1 text-xs font-semibold"
                      style={{ background: `${accent}1A`, color: accent }}
                    >
                      {teacher.qualification}
                    </span>
                  )}
                  {teacher.availableToday && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill bg-success-light px-2.5 py-1 text-xs font-semibold text-success">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
                      متاح اليوم
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {(rightColumn.length > 0 || leftColumn.length > 0) && (
            <div className="mt-5 flex w-full gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                {rightColumn.map(({ key, ...cell }) => (
                  <StatCell key={key} {...cell} />
                ))}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                {leftColumn.map(({ key, ...cell }) => (
                  <StatCell key={key} {...cell} />
                ))}
              </div>
            </div>
          )}

          {belowRows.length > 0 && (
            <div className={`flex w-full flex-col gap-4 ${rightColumn.length > 0 || leftColumn.length > 0 ? 'mt-4' : 'mt-5'}`}>
              {belowRows.map(({ key, ...cell }) => (
                <StatCell key={key} {...cell} />
              ))}
            </div>
          )}

          {(teacher.subjects?.length > 0 || teacher.curricula?.length > 0) && (
            <div className="mt-4 flex w-full flex-col gap-3">
              {teacher.subjects?.length > 0 && <ChipSection label="المواد" items={teacher.subjects} accent={accent} />}
              {teacher.curricula?.length > 0 && <ChipSection label="المناهج" items={teacher.curricula} accent={accent} />}
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
    <div className="relative h-[500px]">
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
