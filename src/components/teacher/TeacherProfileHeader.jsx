import { BookText, CalendarDays, Check, GraduationCap, Layers, MapPin, Star } from "lucide-react";
import { FavoriteButton } from "@/components/ui";
import { useT } from "@/hooks/useT";

const fmt = (n) => (n == null ? null : Number(n).toLocaleString("en-US"));
const HERO_GRADIENT = "linear-gradient(89.95deg, #9E074A 3.11%, #243757 98.69%)";
const SHAPE_GRADIENT = "linear-gradient(180deg, #C962B3 0%, #8C74C5 100%)";

export function TeacherProfileHeader({ teacher, isFavorite, onToggleFavorite }) {
  const t = useT();

  const badges = (teacher.badges ?? [])
    .map((b) => (typeof b === "string" ? { label: b, icon: "🏅" } : b))
    .slice(0, 4);

  const teachingType = teacher.teachingMethods?.slice(0, 2).join(" / ") || teacher.typeLabel;

  const stats = [
    teacher.completedSessions > 0 && {
      icon: Layers,
      label: t("teacher.stats.completedSessions"),
      value: `+${fmt(teacher.completedSessions)}`,
    },
    (teacher.experienceShort || teacher.experienceLabel) && {
      icon: CalendarDays,
      label: t("teacher.stats.experience"),
      value: teacher.experienceShort || teacher.experienceLabel,
    },
    teachingType && {
      icon: BookText,
      label: t("teacher.stats.teachingType"),
      value: teachingType,
    },
    teacher.satisfactionRate != null && {
      icon: GraduationCap,
      label: t("teacher.stats.retention"),
      value: `${teacher.satisfactionRate}%`,
    },
  ].filter(Boolean);

  const infoBits = [
    teacher.reviewsCount > 0 && (
      <span key="rating" className="inline-flex items-center gap-1.5">
        <Star size={20} className="fill-[#FF8D28] text-[#FF8D28]" />
        <span>
          {String(teacher.rating).replace(".", ",")} ({fmt(teacher.reviewsCount)} {t("teacher.reviews")})
        </span>
      </span>
    ),
    teacher.experienceLabel && (
      <span key="exp" className="inline-flex items-center gap-1.5">
        <CalendarDays size={20} className="shrink-0" />
        {teacher.experienceLabel}
      </span>
    ),
    teacher.city && (
      <span key="loc" className="inline-flex items-center gap-1.5">
        <MapPin size={20} className="shrink-0" />
        {teacher.city}
      </span>
    ),
  ].filter(Boolean);

  return (
    <div>
      {/* ── Gradient hero ────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[24px] shadow-[0px_1px_5px_rgba(0,0,0,0.1)]"
        style={{ background: HERO_GRADIENT }}
      >
        {/* Soft white glow */}
        <div className="pointer-events-none absolute -left-20 top-4 h-[420px] w-[60%] rounded-full bg-white/40 blur-[160px]" />
        {/* Rotated decorative shape behind the photo */}
        <div
          className="pointer-events-none absolute -right-6 top-14 hidden h-[214px] w-[246px] rotate-[13deg] rounded-[32px] sm:block"
          style={{ background: SHAPE_GRADIENT }}
        />

        <div className="relative flex flex-col items-stretch sm:flex-row">
          {/* Photo — first in DOM so it lands on the right in RTL */}
          <div className="relative z-10 h-56 w-full shrink-0 self-end sm:h-[300px] sm:w-[300px] lg:h-[320px] lg:w-[360px]">
            <img
              src={teacher.avatar || "/teacher.webp"}
              alt={teacher.name}
              decoding="async"
              className="h-full w-full object-cover object-top"
            />
            {onToggleFavorite && (
              <FavoriteButton
                active={isFavorite}
                onClick={onToggleFavorite}
                className="absolute left-3 top-3"
              />
            )}
          </div>

          {/* Text column — right-aligned */}
          <div className="relative z-10 flex flex-1 flex-col items-end px-6 py-7 text-end sm:px-10 sm:py-8">
            {teacher.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-2xl bg-white px-2.5 py-1 text-xs font-semibold text-[#34C759]">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#34C759]">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </span>
                {t("teacher.verified")}
              </span>
            )}

            <h1 className="mt-2 text-[26px] font-bold leading-tight text-white sm:text-[32px]">
              {teacher.name}
            </h1>
            <p className="mt-1 text-lg font-bold text-white sm:text-xl">{teacher.typeLabel}</p>

            {infoBits.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-base font-medium text-white">
                {infoBits.map((bit, i) => (
                  <span key={i} className="flex items-center gap-4">
                    {i > 0 && <span className="h-3.5 w-px bg-white/60" />}
                    {bit}
                  </span>
                ))}
              </div>
            )}

            {badges.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                {badges.map((badge) => (
                  <span
                    key={badge.label}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FAFAFA] px-2.5 py-2 text-xs font-medium text-[#1E1E1E]"
                  >
                    {badge.label}
                    <span className="text-sm leading-none">{badge.icon ?? "🏅"}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats card ──────────────────────────────────────────────── */}
      {stats.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-6 rounded-[24px] bg-[#F9F9FE] px-6 py-6 sm:px-10">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-1 items-center justify-end gap-4">
              <div className="flex flex-col items-end text-end">
                <span className="text-base font-medium text-[#1E1E1E] sm:text-lg">{label}</span>
                <span className="text-lg font-bold text-[#1E1E1E] sm:text-xl">{value}</span>
              </div>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EDF0F5]">
                <Icon size={28} strokeWidth={1.6} className="text-[#4B6898]" />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
