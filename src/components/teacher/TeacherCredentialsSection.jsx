import { BookOpen, Building2, GraduationCap } from "lucide-react";
import { useT } from "@/hooks/useT";

/** Rotating icon + soft pastel per timeline entry — purely decorative, same rhythm as the reference's alternating cards */
const EXP_PALETTE = [
  { icon: Building2, card: "bg-accent-purple/[0.06]" },
  { icon: GraduationCap, card: "bg-accent-purple/[0.06]" },
  { icon: BookOpen, card: "bg-accent-pink/[0.06]" },
];

const CURRENT_RE = /الآن|الان|حالياً|حاليا|present|current/i;

/** Subjects card — a plain row list (icon + name), no trailing label/chevron, one shared icon for every subject */
function SubjectsCard({ title, subjects }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-white p-5 text-start shadow-[0_10px_30px_rgba(17,24,39,0.06)] sm:p-6">
      <h3 className="text-lg font-bold text-[#1E1E1E]">{title}</h3>

      <div className="mt-3 flex flex-col divide-y divide-[#F0F0F5] pe-24 sm:pe-32">
        {subjects.map((s) => (
          <div key={s} className="flex items-center gap-3 py-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/10 text-accent-purple">
              <BookOpen size={18} />
            </span>
            <span className="text-sm font-bold text-[#2D2D2D]">{s}</span>
          </div>
        ))}
      </div>

      {/* Decorative illustration — full PNG visible (object-contain), inset with a small margin on every side */}
      <div className="pointer-events-none absolute inset-y-3 end-3 w-24 sm:inset-y-4 sm:end-4 sm:w-32">
        <img
          src="/desk-lamp-illustration.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain"
          onError={(e) => {
            e.currentTarget.parentElement.style.display = "none";
          }}
        />
      </div>
    </div>
  );
}

/**
 * Third profile section — previous experience as a connected timeline,
 * alongside the subjects list. Full-width row; on desktop the two cards sit
 * side by side, otherwise they stack.
 */
export function TeacherCredentialsSection({ teacher }) {
  const t = useT();

  const experiences = teacher.experiences ?? [];
  const subjects = teacher.subjects ?? [];

  const hasExperiences = experiences.length > 0;
  const hasSubjects = subjects.length > 0;
  if (!hasExperiences && !hasSubjects) return null;

  const twoUp = hasExperiences && hasSubjects;

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

      {hasSubjects && <SubjectsCard title={t("teacher.subjects")} subjects={subjects} />}
    </div>
  );
}
