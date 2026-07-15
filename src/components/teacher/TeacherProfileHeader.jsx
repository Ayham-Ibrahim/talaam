import { Check, Play, Star } from "lucide-react";
import { useT } from "@/hooks/useT";

const BADGE_ICONS = {
  0: "🎓", // مؤهلات مراجعة
  1: "🛡️", // فحص أمني
  2: "🥇", // معلم مميز
  3: "🏅", // مركز معتمد
};

export function TeacherProfileHeader({ teacher }) {
  const t = useT();

  return (
    <div className="relative overflow-hidden rounded-card bg-[linear-gradient(89.95deg,#4B6898_3.11%,#243757_98.69%)] shadow-soft">
      {/* Soft glow behind the text */}
      <div className="pointer-events-none absolute -left-10 top-6 h-64 w-[50%] max-w-md rounded-full bg-white/60 blur-[150px]" />

      <div className="relative flex flex-col items-stretch sm:flex-row">
        {/* Photo — first in DOM so it renders on the right in RTL, matching the design */}
        <div className="relative h-48 w-full shrink-0 sm:h-72 sm:w-[300px] lg:h-80 lg:w-[360px]">
          {teacher.avatar ? (
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="h-full w-full object-contain object-top"
            />
          ) : (
            <img
              src="/teacher.png"
              alt={teacher.name}
              className="h-full w-full object-cover object-top"
            />
          )}
          <button
            type="button"
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-pill bg-black/40 py-1  px-2.5 backdrop-blur-sm transition-colors hover:bg-black/55"
            aria-label={t("teacher.intro")}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
              <Play size={12} className="fill-primary text-primary" />
            </span>
            <div className="text-[11px] flex flex-col items-start  font-medium text-white">
              <span>{t("teacher.intro")} </span>
              <span>
                {" "}
                {teacher.introVideoDuration &&
                  `· ${teacher.introVideoDuration}`}
              </span>
            </div>
          </button>
        </div>

        {/* Text column */}
        <div className="flex-1 px-6 py-8 text-right sm:px-10 sm:py-10">
          {teacher.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-white px-2 py-1 text-xs font-semibold text-[#34C759]">
              {t("teacher.verified")}
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#34C759]">
                <Check size={11} className="text-white" strokeWidth={3} />
              </span>
            </span>
          )}

          <h1 className="mt-2 text-2xl font-bold text-[#1E1E1E] sm:text-3xl">
            {teacher.name}
          </h1>
          <p className="mt-0.5 font-bold text-[#B00852]">{teacher.typeLabel}</p>

          <div className="mt-3 flex flex-wrap items-center justify-start gap-4">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-white">
              <Star size={16} className="fill-star text-star" />
              {teacher.rating} ({teacher.reviewsCount}
              {t("teacher.reviews")})
            </span>
            <span className="h-3.5 w-px bg-white/60" />
            <span className="text-sm font-medium text-white">
              {t("teacher.moreThan")} {teacher.experienceYears}{" "}
              {t("teacher.yearsExp")}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap justify-start gap-2">
            {teacher.badges?.slice(0, 4).map((badge, i) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-pill bg-[#FAFAFA] px-2.5 py-2 text-xs font-medium text-[#1E1E1E]"
              >
                {badge}
                <span className="text-sm leading-none">
                  {BADGE_ICONS[i] ?? "🏅"}
                </span>
              </span>
            ))}
          </div>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white">
            {teacher.bio}
          </p>
        </div>
      </div>
    </div>
  );
}
