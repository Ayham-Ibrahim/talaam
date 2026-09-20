import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  Star,
  CheckCircle2,
  BookOpen,
  Globe,
  GraduationCap,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Landmark,
  Globe2,
  Code2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites, useToggleFavoriteTeacher } from '@/hooks/useFavorites';

/** Figma "Foundation/Blue/Normal" — the design's own base blue, not our usual `primary` token, kept literal to match the reference exactly */
const BLUE = '#4B6898';
const PEACH = '#FDC8BC';
const ORANGE_STAR = '#FF8D28';

/** Subject → icon/color, matched by keyword against real subject names; anything unmatched still gets a real icon and a rotating brand color, never a guess at meaning */
const SUBJECT_ICON_RULES = [
  { test: /رياضيات|حساب/, icon: Calculator, color: BLUE },
  { test: /فيزياء/, icon: Atom, color: '#F74E28' },
  { test: /كيمياء/, icon: FlaskConical, color: '#B00852' },
  { test: /أحياء|علوم/, icon: Dna, color: '#2E9E6B' },
  { test: /english|انجليزي|إنجليزي/i, icon: Globe2, color: '#F74E28' },
  { test: /عربي/, icon: Globe2, color: BLUE },
  { test: /تاريخ/, icon: Landmark, color: '#B00852' },
  { test: /جغرافيا/, icon: Globe2, color: '#2E9E6B' },
  { test: /حاسوب|برمجة|حاسب/, icon: Code2, color: BLUE },
];
const SUBJECT_FALLBACK_COLORS = [BLUE, '#F74E28', '#B00852', '#2E9E6B'];
function subjectStyle(name, index) {
  const rule = SUBJECT_ICON_RULES.find((r) => r.test.test(name));
  if (rule) return rule;
  return { icon: BookOpen, color: SUBJECT_FALLBACK_COLORS[index % SUBJECT_FALLBACK_COLORS.length] };
}

/** "4.0 ★★★★☆" — always 5 slots, filled ones colored, matches the reference's `line-md:star-filled` (always solid, never outline). Forced `dir="ltr"`: this is a self-contained rating widget (number, then stars), and under the page's ambient RTL a plain flex row would otherwise flip it to "stars, then number". */
function StarsRow({ rating }) {
  const filled = Math.round(rating);
  return (
    <span dir="ltr" className="flex shrink-0 items-center gap-1">
      <span className="text-xs font-normal text-[#626262]">{rating.toFixed(1)}</span>
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className="shrink-0"
            style={{ color: i < filled ? ORANGE_STAR : '#626262', fill: i < filled ? ORANGE_STAR : '#626262' }}
          />
        ))}
      </span>
    </span>
  );
}

/** Row of pill items (languages/curricula/stages) inside a light lavender tray — each item is `flex-1` so it always fills the row whether there's 1 item or 3, and any overflow beyond 3 collapses into a trailing "+N" pill instead of wrapping */
function PillSection({ title, titleIcon: TitleIcon, items, itemIcon: ItemIcon }) {
  if (!items || items.length === 0) return null;
  const shown = items.slice(0, 3);
  const extra = items.length - shown.length;
  return (
    <div className="flex w-full flex-col items-start gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
        {title}
        <TitleIcon size={15} style={{ color: BLUE }} aria-hidden="true" />
      </span>
      <div className="flex w-full items-center gap-1.5 rounded-[10px] bg-[#F9F9FE] p-2">
        {shown.map((item) => (
          <span
            key={item}
            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-2.5 text-xs font-bold"
            style={{ color: BLUE }}
          >
            <ItemIcon size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{item}</span>
          </span>
        ))}
        {extra > 0 && (
          <span
            className="flex shrink-0 items-center justify-center self-stretch rounded-xl bg-white px-2.5 text-xs font-bold"
            style={{ color: BLUE }}
          >
            {extra}+
          </span>
        )}
      </div>
    </div>
  );
}

/** Subjects tray — same lavender container, but each item is a taller card (icon above label, own accent color) instead of a text pill */
function SubjectsSection({ title, titleIcon: TitleIcon, subjects }) {
  if (!subjects || subjects.length === 0) return null;
  const shown = subjects.slice(0, 3);
  const extra = subjects.length - shown.length;
  return (
    <div className="flex w-full flex-col items-start gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
        {title}
        <TitleIcon size={15} style={{ color: BLUE }} aria-hidden="true" />
      </span>
      <div className="flex w-full items-stretch gap-1.5 rounded-[10px] bg-[#F9F9FE] p-2">
        {shown.map((s, i) => {
          const { icon: Icon, color } = subjectStyle(s, i);
          return (
            <span
              key={s}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-3 text-xs font-bold"
              style={{ color }}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="w-full truncate text-center">{s}</span>
            </span>
          );
        })}
        {extra > 0 && (
          <span
            className="flex shrink-0 items-center justify-center rounded-xl bg-white px-2.5 text-xs font-bold"
            style={{ color: BLUE }}
          >
            {extra}+
          </span>
        )}
      </div>
    </div>
  );
}

function FooterStat({ value, label }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-0.5">
      {/* leading-none (line-height:100%) clips the tops/bottoms of Arabic glyphs once combined with truncate's overflow:hidden — Cairo's ascenders/descenders need more vertical room than an exact 1:1 line-height gives them, so this uses a slightly taller line-height instead. */}
      <span className="max-w-full truncate text-start text-sm font-bold leading-[1.3]" style={{ color: BLUE }}>
        {value}
      </span>
      <span className="max-w-full truncate text-start text-[11px] font-medium leading-[1.3] text-[#909090]">{label}</span>
    </div>
  );
}

/**
 * Teacher card — matches the Figma reference 1:1: avatar with two rotated
 * decorative squares peeking behind it, name/rating/"+N جلسة ناجحة" badge/CTA
 * button stacked to its right, then four data trays (subjects/languages/
 * curricula/stages, each capped at 3 items + an overflow "+N" pill, every
 * item box `flex-1` so it fills the row whether there's 1 item or 3 — this
 * is what keeps the sparse-data and rich-data variants the same height
 * without any conditional sizing), and a footer stats bar with a decorative
 * blue circle bleeding from its squared-off top-right corner. Every field is
 * only rendered when the teacher actually has that data (teacherService's
 * mapSearchResult) — nothing here is fabricated.
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

  const footerStats = [
    teacher.city && { key: 'city', value: teacher.city.split(/[\s-]+/)[0], label: 'الموقع' },
    teacher.experienceShort && { key: 'experience', value: teacher.experienceShort, label: 'سنوات خبرة' },
    teacher.reviewsCount > 0 && { key: 'satisfaction', value: `${Math.round((teacher.rating / 5) * 100)}%`, label: 'رضا الطلاب' },
  ].filter(Boolean);

  return (
    <div className="group relative flex h-[632px] flex-col overflow-hidden rounded-2xl bg-white text-start shadow-[0_1px_5px_rgba(0,0,0,0.1)] transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(17,24,39,0.14)]">
      <button
        type="button"
        onClick={handleToggleFavorite}
        aria-label="المفضلة"
        aria-pressed={isFavorite}
        className="absolute left-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <Heart size={20} className={isFavorite ? 'fill-accent-pink text-accent-pink' : 'text-[#2D2D2D]'} />
      </button>

      <Link
        to={profileHref}
        className="flex flex-1 flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {/* Header — avatar physically on the left (flex-row-reverse keeps it there regardless of page direction), name/rating/badge/CTA column to its right. items-end bottom-aligns the avatar against the taller text column (vertical cross-axis alignment isn't affected by the RTL quirk that hit the column-flex cases elsewhere in this file — that one was horizontal-only). From sm: up the column is capped to ~58% width (not flex-1 filling the whole row) so name/badge/button stay a single tight, same-width stack flush to the right edge — matching the reference, where the button's own width equals the name column's width, not the full card width. */}
        <div className="flex w-full flex-row-reverse items-end gap-3 sm:justify-between sm:gap-0">
          {/* 139:125 wrapper (not square) — the avatar circle itself is only ~90% of this width, left-aligned within it, leaving room for the two decorative squares to peek past its right/left edges. All offsets below are the reference's exact px values converted to % of this box, so they hold at any breakpoint. */}
          <div className="relative aspect-[139/125] h-16 shrink-0 sm:h-[92px]">
            {/* Blue-tint square — top-right, behind the avatar, boxy corners */}
            <span
              className="absolute rounded-[10%]"
              style={{
                width: '58%',
                height: '64.5%',
                top: '-13.6%',
                left: '25.9%',
                background: 'rgba(75,104,152,0.2)',
                transform: 'rotate(-27.84deg)',
              }}
              aria-hidden="true"
            />
            {/* Peach square — top-left, behind the avatar, nearly circular */}
            <span
              className="absolute rounded-full"
              style={{
                width: '58%',
                height: '64.5%',
                top: '-9.6%',
                left: '-18%',
                background: PEACH,
                transform: 'rotate(-27.84deg)',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute left-0 z-10 h-full overflow-hidden rounded-full bg-white shadow-[0_10px_24px_rgba(17,24,39,0.18)] transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              style={{ width: '89.93%', top: '-0.8%' }}
            >
              {teacher.avatar ? (
                <img src={teacher.avatar} alt={teacher.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold" style={{ color: BLUE }}>
                  {initials || teacher.name?.charAt(0) || '؟'}
                </span>
              )}
            </div>
          </div>

          {/* min-h reserves the "full" header's own natural height so every card's header ends at the same Y regardless of which fields this teacher actually has. justify-between (not the default top-packed flow) is what pins the button to the exact same bottom Y across cards — otherwise a card missing the rating/badge would pack name+button together at the top with all the slack left dangling below the button instead of between them. */}
          <div className="flex min-h-[120px] min-w-0 flex-1 flex-col items-start justify-between gap-1.5 sm:w-[58%] sm:max-w-[240px] sm:flex-none">
            <h3 className="w-full truncate text-sm font-bold text-ink sm:text-xl">{teacher.name}</h3>

            {teacher.reviewsCount > 0 && (
              <span className="hidden sm:flex">
                <StarsRow rating={teacher.rating} />
              </span>
            )}

            {teacher.completedSessions > 0 && (
              <span className="inline-flex max-w-full items-center gap-1 whitespace-normal rounded-pill bg-[#34C759] px-2 py-1 text-[11px] font-semibold text-white sm:gap-1.5 sm:whitespace-nowrap sm:px-3 sm:py-1 sm:text-sm">
                {teacher.completedSessions}+ جلسة ناجحة
                <CheckCircle2 size={13} className="shrink-0 sm:hidden" aria-hidden="true" />
                <CheckCircle2 size={15} className="hidden shrink-0 sm:block" aria-hidden="true" />
              </span>
            )}

            <span
              className="inline-flex w-full items-center justify-center whitespace-normal rounded-xl px-2 py-1.5 text-xs font-medium text-white transition-opacity duration-200 group-hover:opacity-90 sm:whitespace-nowrap sm:px-4 sm:py-2 sm:text-sm"
              style={{ background: BLUE }}
            >
              حجز جلسة
            </span>
          </div>
        </div>

        {(teacher.subjects?.length > 0 ||
          teacher.languages?.length > 0 ||
          teacher.curricula?.length > 0 ||
          teacher.stages?.length > 0) && (
          <div className="mt-4 flex w-full flex-col gap-4">
            <SubjectsSection title="المواد التي يدرسها" titleIcon={BookOpen} subjects={teacher.subjects} />
            <PillSection title="اللغات" titleIcon={Globe} items={teacher.languages} itemIcon={Globe2} />
            <PillSection title="المناهج" titleIcon={BookOpen} items={teacher.curricula} itemIcon={GraduationCap} />
            <PillSection title="المراحل الدراسية" titleIcon={GraduationCap} items={teacher.stages} itemIcon={GraduationCap} />
          </div>
        )}

        <div className="flex-1" />

        {footerStats.length > 0 && (
          <div className="relative -mx-4 -mb-4 mt-4 flex h-16 items-center overflow-hidden rounded-2xl rounded-tr-none bg-[#F9F9F9] px-3 sm:h-[68px]">
            {/* Decorative swoosh bleeding from the bottom-right corner — the exact reference path (a bezier curve, not a rotated square or circle). Hidden below xl: — the sidebar-filter pages now run 3 cards per row at lg:, which makes those cards too narrow (as little as ~200px) for the shape and readable text to coexist; percentage-sized (not the earlier fixed 130px) so it keeps scaling down instead of overflowing as cards get narrower. */}
            <svg
              className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[28%] xl:block"
              viewBox="0 0 130 59"
              preserveAspectRatio="xMaxYMax meet"
              aria-hidden="true"
            >
              <path
                d="M126.5 0H130V59H0C29.9331 29.3922 68.2876 9.76233 109.81 2.79891L126.5 0Z"
                fill={BLUE}
              />
            </svg>
            {/* Naturally-sized items spread across the whole remaining width (justify-between, no fixed gap) instead of clustering together — min-w-0 on each is what lets them still truncate gracefully instead of overflowing if the card is ever too narrow. pr-* clears the swoosh's own rendered width (as a %, matching its own sizing) so text sits next to it, never on top of it — only needed once the swoosh itself appears at xl:. */}
            <div className="relative z-10 flex w-full items-center justify-between gap-2 xl:pr-[34%]">
              {footerStats.map(({ key, ...stat }) => (
                <div key={key} className="min-w-0">
                  <FooterStat {...stat} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}

export function TeacherCardSkeleton() {
  return (
    <div className="flex h-[632px] flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-[0_1px_5px_rgba(0,0,0,0.1)]">
      <div className="flex w-full flex-row-reverse items-start gap-3">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full sm:h-[92px] sm:w-[92px]" />
        <div className="flex min-h-[120px] min-w-0 flex-1 flex-col items-start gap-1.5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-32 rounded-pill" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        <Skeleton className="h-20 w-full rounded-[10px]" />
        <Skeleton className="h-[54px] w-full rounded-[10px]" />
        <Skeleton className="h-[54px] w-full rounded-[10px]" />
      </div>
      <div className="flex-1" />
      <Skeleton className="mt-4 h-[60px] w-full rounded-2xl" />
    </div>
  );
}
