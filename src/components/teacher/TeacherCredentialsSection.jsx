import { useState } from "react";
import { Award, BookOpen, Building2, GraduationCap } from "lucide-react";
import { useT } from "@/hooks/useT";

/** Rotating icon + soft pastel per timeline entry — purely decorative, same rhythm as the reference's alternating cards */
const EXP_PALETTE = [
  { icon: Building2, card: "bg-accent-purple/[0.06]" },
  { icon: GraduationCap, card: "bg-accent-purple/[0.06]" },
  { icon: BookOpen, card: "bg-accent-pink/[0.06]" },
];

const CURRENT_RE = /الآن|الان|حالياً|حاليا|present|current/i;

/** Same neon navy used across the header/philosophy sections — kept for one consistent "identity" family */
const NEON_GRADIENT = "linear-gradient(135deg, #0E1A4D 0%, #17237E 60%, #1B2E9C 100%)";

/** One qualification, styled as a dark "achievement badge" card — decorative ruler ticks, no invented stats */
function QualificationBadgeCard({ label }) {
  const t = useT();
  const [badgeMissing, setBadgeMissing] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 text-start shadow-[0_8px_20px_rgba(15,23,90,0.25)]"
      style={{ background: NEON_GRADIENT }}
    >
      <div className="relative z-10 max-w-[75%]">
        <span className="text-xs font-medium text-white/55">{t("teacher.qualificationBadge")}</span>
        <h4 className="mt-0.5 truncate text-base font-bold text-white">{label}</h4>
      </div>

      {/* Badge icon — opposite corner from the text; falls back to a plain award glyph until the SVG asset exists */}
      <span className="absolute end-3 top-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#5FE4FF] ring-1 ring-white/20">
        {badgeMissing ? (
          <Award size={20} />
        ) : (
          <img
            src="/qualification-badge.svg"
            alt=""
            aria-hidden="true"
            className="h-6 w-6 object-contain"
            onError={() => setBadgeMissing(true)}
          />
        )}
      </span>

      {/* Decorative ruler ticks — pure texture, no data claim */}
      <div className="relative z-10 mt-4 flex h-4 items-end gap-[3px]" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-[#5FE4FF]/50"
            style={{ height: i % 4 === 0 ? "100%" : i % 2 === 0 ? "65%" : "40%" }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Third profile section — previous experience as a connected timeline,
 * alongside a decorative academic-qualifications card. Full-width row; on
 * desktop the two cards sit side by side, otherwise they stack.
 */
export function TeacherCredentialsSection({ teacher }) {
  const t = useT();

  const experiences = teacher.experiences ?? [];
  const qualifications = teacher.qualifications ?? [];

  const hasExperiences = experiences.length > 0;
  const hasQualifications = qualifications.length > 0;
  if (!hasExperiences && !hasQualifications) return null;

  const twoUp = hasExperiences && hasQualifications;

  return (
    <div className={`mt-6 grid gap-6 ${twoUp ? "lg:grid-cols-2" : ""}`}>
      {hasExperiences && (
        <section className="rounded-[28px] bg-white p-5 text-start shadow-[0_10px_30px_rgba(17,24,39,0.06)] sm:p-6">
          <h3 className="text-lg font-bold text-[#1E1E1E]">{t("teacher.previousExperience")}</h3>

          <ul className="relative mt-5 flex flex-col gap-3">
            {/* connecting line — centered under each dot's column; only meaningful with 2+ dots to connect */}
            {experiences.length > 1 && (
              <span className="absolute bottom-6 end-4 top-6 w-px bg-line" aria-hidden="true" />
            )}

            {experiences.map((exp, i) => {
              const { icon: Icon, card } = EXP_PALETTE[i % EXP_PALETTE.length];
              const isCurrent = CURRENT_RE.test(exp.period ?? "");
              // Status colour is independent of the card's decorative palette above —
              // pink for ongoing, green for finished, mirroring the reference's cue.
              const statusBadge = isCurrent ? "bg-accent-pink/15 text-accent-pink" : "bg-[#2E9E6B]/15 text-[#2E9E6B]";
              return (
                <li key={exp.id} className="relative flex items-stretch gap-3">
                  <div className="relative z-10 flex w-8 shrink-0 items-start justify-center pt-4">
                    <span className="h-3 w-3 rounded-full bg-accent-purple ring-4 ring-white" />
                  </div>

                  <div className={`flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 overflow-hidden rounded-2xl p-3 ${card}`}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-accent-purple shadow-card">
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-[#1E1E1E]">{exp.title}</h4>
                      {exp.period && <p className="mt-0.5 text-xs text-ink-soft">{exp.period}</p>}
                    </div>
                    {exp.period && (
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadge}`}>
                        {isCurrent ? t("teacher.experienceCurrent") : t("teacher.experienceCompleted")}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {hasQualifications && (
        <section className="rounded-[28px] bg-white p-5 text-start shadow-[0_10px_30px_rgba(17,24,39,0.06)] sm:p-6">
          <h3 className="text-lg font-bold text-[#1E1E1E]">{t("teacher.qualifications")}</h3>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {qualifications.map((q) => (
              <QualificationBadgeCard key={q} label={q} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
