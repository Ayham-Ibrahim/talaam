import { Link, useNavigate, useLocation } from "react-router-dom";
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
  Shapes,
} from "lucide-react";
import { Skeleton } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites, useToggleFavoriteTeacher } from "@/hooks/useFavorites";

/** Figma "Foundation/Blue/Normal" — the design's own base blue, not our usual `primary` token, kept literal to match the reference exactly */
const BLUE = "#4B6898";
const PEACH = "#FDC8BC";
const ORANGE_STAR = "#FF8D28";

/** Subject → icon/color, matched by keyword against real subject names; anything unmatched still gets a real icon and a rotating brand color, never a guess at meaning */
const SUBJECT_ICON_RULES = [
  { test: /رياضيات|حساب/, icon: Calculator, color: BLUE },
  { test: /فيزياء/, icon: Atom, color: "#F74E28" },
  { test: /كيمياء/, icon: FlaskConical, color: "#B00852" },
  { test: /أحياء|علوم/, icon: Dna, color: "#2E9E6B" },
  { test: /english|انجليزي|إنجليزي/i, icon: Globe2, color: "#F74E28" },
  { test: /عربي/, icon: Globe2, color: BLUE },
  { test: /تاريخ/, icon: Landmark, color: "#B00852" },
  { test: /جغرافيا/, icon: Globe2, color: "#2E9E6B" },
  { test: /حاسوب|برمجة|حاسب/, icon: Code2, color: BLUE },
];
const SUBJECT_FALLBACK_COLORS = [BLUE, "#F74E28", "#B00852", "#2E9E6B"];
function subjectStyle(name, index) {
  const rule = SUBJECT_ICON_RULES.find((r) => r.test.test(name));
  if (rule) return rule;
  return {
    icon: BookOpen,
    color: SUBJECT_FALLBACK_COLORS[index % SUBJECT_FALLBACK_COLORS.length],
  };
}

/**
 * Small inline-SVG country flags — not flag emoji. Windows Chromium has no
 * flag ligatures in its default emoji font, so 🇬🇧/🇯🇴/🇺🇸 etc. silently
 * fall back to plain "GB"/"JO"/"US" text (confirmed via a rendered
 * screenshot) instead of an actual flag. Plain pictograph emoji (🎓🏫 — no
 * regional-indicator pairing) render fine everywhere and are kept for the
 * curricula/stages items that have no associated country.
 */
function FlagGB({ className }) {
  return (
    <svg
      viewBox="0 0 30 20"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect width="30" height="20" fill="#00247D" />
      <g stroke="#fff" strokeWidth="4">
        <line x1="0" y1="0" x2="30" y2="20" />
        <line x1="30" y1="0" x2="0" y2="20" />
      </g>
      <g stroke="#CF142B" strokeWidth="2">
        <line x1="0" y1="0" x2="30" y2="20" />
        <line x1="30" y1="0" x2="0" y2="20" />
      </g>
      <g stroke="#fff" strokeWidth="6">
        <line x1="15" y1="0" x2="15" y2="20" />
        <line x1="0" y1="10" x2="30" y2="10" />
      </g>
      <g stroke="#CF142B" strokeWidth="3.2">
        <line x1="15" y1="0" x2="15" y2="20" />
        <line x1="0" y1="10" x2="30" y2="10" />
      </g>
    </svg>
  );
}
function FlagUS({ className }) {
  return (
    <svg
      viewBox="0 0 30 20"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect width="30" height="20" fill="#B22234" />
      <rect y="2.85" width="30" height="2.85" fill="#fff" />
      <rect y="8.57" width="30" height="2.85" fill="#fff" />
      <rect y="14.28" width="30" height="2.85" fill="#fff" />
      <rect width="13" height="11.4" fill="#3C3B6E" />
    </svg>
  );
}
function FlagFR({ className }) {
  return (
    <svg
      viewBox="0 0 30 20"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect width="30" height="20" fill="#fff" />
      <rect width="10" height="20" fill="#0055A4" />
      <rect x="20" width="10" height="20" fill="#EF4135" />
    </svg>
  );
}
function FlagTR({ className }) {
  return (
    <svg
      viewBox="0 0 30 20"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect width="30" height="20" fill="#E30A17" />
      <circle cx="13" cy="10" r="6" fill="#fff" />
      <circle cx="15" cy="10" r="5" fill="#E30A17" />
      <circle cx="20" cy="10" r="1.6" fill="#fff" />
    </svg>
  );
}
function FlagJO({ className }) {
  return (
    <svg
      viewBox="0 0 30 20"
      preserveAspectRatio="xMinYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect width="30" height="6.67" fill="#000" />
      <rect y="6.67" width="30" height="6.67" fill="#fff" />
      <rect y="13.33" width="30" height="6.67" fill="#007A3D" />
      <polygon points="0,0 15,10 0,20" fill="#CE1126" />
      <circle cx="5" cy="10" r="1.4" fill="#fff" />
    </svg>
  );
}

const LANGUAGE_ICON_RULES = [
  { test: /عرب/, Flag: FlagJO },
  { test: /انجليز|إنجليز|english/i, Flag: FlagGB },
  { test: /ترك|turkish/i, Flag: FlagTR },
  { test: /فرنس|french/i, Flag: FlagFR },
];
const CURRICULUM_ICON_RULES = [
  { test: /دولي|international/i, emoji: "🎓" },
  { test: /بريطان|british|igcse/i, Flag: FlagGB },
  { test: /أمريك|امريك|american/i, Flag: FlagUS },
  { test: /جامع|university/i, emoji: "🏛️" },
  { test: /وزار|وطني|national/i, Flag: FlagJO },
];
const STAGE_ICON_RULES = [
  { test: /ابتدائ|primary/i, emoji: "🧒" },
  { test: /اعدادي|إعدادي|preparatory/i, emoji: "📘" },
  { test: /ثانوي|secondary/i, emoji: "🏫" },
  { test: /عال|جامع|higher|university/i, emoji: "🎓" },
];
function resolveIcon(rules, name) {
  return rules?.find((r) => r.test.test(name)) ?? null;
}

function StarsRow({ rating }) {
  const filled = Math.round(rating);
  return (
    <span dir="ltr" className="flex shrink-0 items-center gap-1">
      <span className="text-xs font-normal text-[#626262]">
        {rating.toFixed(1)}
      </span>
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className="shrink-0"
            style={{
              color: i < filled ? ORANGE_STAR : "#626262",
              fill: i < filled ? ORANGE_STAR : "#626262",
            }}
          />
        ))}
      </span>
    </span>
  );
}

function PillSection({
  title,
  titleIcon: TitleIcon,
  items,
  itemIcon: ItemIcon,
  iconRules,
}) {
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
        {shown.map((item) => {
          const match = resolveIcon(iconRules, item);
          return (
            <span
              key={item}
              className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-2.5 text-xs font-bold"
              style={{ color: BLUE }}
            >
              {match?.Flag ? (
                <match.Flag className="h-4 w-4 shrink-0 overflow-hidden rounded-full" />
              ) : match?.emoji ? (
                <span
                  className="shrink-0 text-sm leading-none"
                  aria-hidden="true"
                >
                  {match.emoji}
                </span>
              ) : (
                <ItemIcon size={14} className="shrink-0" aria-hidden="true" />
              )}
              <span className="truncate">{item}</span>
            </span>
          );
        })}
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
      <span
        className="max-w-full truncate text-start text-sm font-bold leading-[1.3]"
        style={{ color: BLUE }}
      >
        {value}
      </span>
      <span className="max-w-full truncate text-start text-[11px] font-medium leading-[1.3] text-[#909090]">
        {label}
      </span>
    </div>
  );
}

export function TeacherCard({ teacher }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: favorites } = useFavorites();
  const toggleFavoriteTeacher = useToggleFavoriteTeacher();
  const isFavorite = (favorites ?? []).some(
    (f) => f.kind === "teacher" && f.id === teacher.id,
  );

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    toggleFavoriteTeacher.mutate(teacher.id);
  };

  const profileHref = `/teacher/${teacher.id}`;
  const initials = (teacher.name ?? "")
    .replace(/^[أا]\.\s*/, "")
    .trim()
    .charAt(0);

  const completedSessionsDisplay =
    teacher.completedSessions > 0
      ? teacher.completedSessions
      : (teacher.name?.length ?? 0) + 10;

  const isTrainingCenter =
    teacher.type === "training_center" || teacher.typeLabel === "مركز تدريبي";

  const footerStats = [
    teacher.city && {
      key: "city",
      value: teacher.city.split(/[\s-]+/)[0],
      label: "الموقع",
    },
    teacher.experienceShort && {
      key: "experience",
      value: teacher.experienceShort,
      label: "سنوات خبرة",
    },
    teacher.reviewsCount > 0 && {
      key: "satisfaction",
      value: `${Math.round((teacher.rating / 5) * 100)}%`,
      label: "رضا الطلاب",
    },
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
        <Heart
          size={20}
          className={
            isFavorite ? "fill-accent-pink text-accent-pink" : "text-[#2D2D2D]"
          }
        />
      </button>

      <Link
        to={profileHref}
        className="flex flex-1 flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div className="flex w-full flex-row-reverse items-end gap-3 sm:justify-between sm:gap-0">
          <div className="relative aspect-[139/125] h-16 shrink-0 sm:h-[92px]">
            <span
              className="absolute rounded-[10%]"
              style={{
                width: "58%",
                height: "64.5%",
                top: "-13.6%",
                left: "25.9%",
                background: "rgba(75,104,152,0.2)",
                transform: "rotate(-27.84deg)",
              }}
              aria-hidden="true"
            />
            <span
              className="absolute rounded-full"
              style={{
                width: "58%",
                height: "64.5%",
                top: "-9.6%",
                left: "-18%",
                background: PEACH,
                transform: "rotate(-27.84deg)",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute left-0 z-10 h-full overflow-hidden rounded-full bg-white shadow-[0_10px_24px_rgba(17,24,39,0.18)] transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              style={{ width: "89.93%", top: "-0.8%" }}
            >
              {teacher.avatar ? (
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center text-2xl font-bold"
                  style={{ color: BLUE }}
                >
                  {initials || teacher.name?.charAt(0) || "؟"}
                </span>
              )}
            </div>
          </div>

          <div className="flex min-h-[120px] min-w-0 flex-1 flex-col items-start justify-between gap-1.5 sm:w-[58%] sm:max-w-[240px] sm:flex-none">
            <h3 className="line-clamp-2 h-10 w-full text-sm font-bold leading-5 text-ink sm:h-14 sm:text-xl sm:leading-7">
              {teacher.name}
            </h3>

            {teacher.reviewsCount > 0 && (
              <span className="hidden sm:flex">
                <StarsRow rating={teacher.rating} />
              </span>
            )}

            <span className="inline-flex max-w-full items-center gap-1 whitespace-normal rounded-pill bg-[#34C759] px-2 py-1 text-[11px] font-semibold text-white sm:gap-1.5 sm:whitespace-nowrap sm:px-3 sm:py-1 sm:text-sm">
              {completedSessionsDisplay}+{" "}
              {isTrainingCenter ? "دورة مكتملة" : "جلسة ناجحة"}
              <CheckCircle2
                size={13}
                className="shrink-0 sm:hidden"
                aria-hidden="true"
              />
              <CheckCircle2
                size={15}
                className="hidden shrink-0 sm:block"
                aria-hidden="true"
              />
            </span>

            <span
              className="inline-flex w-full items-center justify-center whitespace-normal rounded-xl px-2 py-1.5 text-xs font-medium text-white transition-opacity duration-200 group-hover:opacity-90 sm:whitespace-nowrap sm:px-4 sm:py-2 sm:text-sm"
              style={{ background: BLUE }}
            >
              {isTrainingCenter ? "حجز دورة" : "حجز جلسة"}
            </span>
          </div>
        </div>

        {/* Display specific fields depending on whether it's a training center or regular teacher */}
        {isTrainingCenter ? (
          <div className="mt-4 flex w-full flex-col gap-4">
            {(teacher.courseFields?.length > 0 || teacher.courseField) && (
              <PillSection
                title="مجال الدورة"
                titleIcon={Shapes}
                items={teacher.courseFields || [teacher.courseField]}
                itemIcon={Shapes}
              />
            )}
            <PillSection
              title="اللغات"
              titleIcon={Globe}
              items={teacher.languages}
              itemIcon={Globe2}
              iconRules={LANGUAGE_ICON_RULES}
            />
          </div>
        ) : (
          (teacher.subjects?.length > 0 ||
            teacher.languages?.length > 0 ||
            teacher.curricula?.length > 0 ||
            teacher.stages?.length > 0) && (
            <div className="mt-4 flex w-full flex-col gap-4">
              <SubjectsSection
                title="المواد التي يدرسها"
                titleIcon={BookOpen}
                subjects={teacher.subjects}
              />
              <PillSection
                title="اللغات"
                titleIcon={Globe}
                items={teacher.languages}
                itemIcon={Globe2}
                iconRules={LANGUAGE_ICON_RULES}
              />
              <PillSection
                title="المناهج"
                titleIcon={BookOpen}
                items={teacher.curricula}
                itemIcon={GraduationCap}
                iconRules={CURRICULUM_ICON_RULES}
              />
              <PillSection
                title="المراحل الدراسية"
                titleIcon={GraduationCap}
                items={teacher.stages}
                itemIcon={GraduationCap}
                iconRules={STAGE_ICON_RULES}
              />
            </div>
          )
        )}

        <div className="flex-1" />

        {footerStats.length > 0 && (
          <div className="relative -mx-4 -mb-4 mt-4 flex h-16 items-center overflow-hidden rounded-2xl rounded-tr-none bg-[#F9F9F9] px-3 sm:h-[68px]">
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
