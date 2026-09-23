import { BookOpen, Building2, GraduationCap } from "lucide-react";
import { useT } from "@/hooks/useT";

/** Rotating icon + soft pastel per timeline entry — purely decorative, same rhythm as the reference's alternating cards */
const EXP_PALETTE = [
  { icon: Building2, card: "bg-primary/[0.06]" },
  { icon: GraduationCap, card: "bg-primary/[0.06]" },
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
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
 * Third profile section — previous experience, now its own always-full-width
 * card (no longer paired side-by-side with the subjects card), with its
 * entries laid out as a two-column grid under the section title. The old
 * single-column "connected timeline" (dot + vertical line) only made sense
 * for a strictly sequential top-to-bottom list, so it's dropped here in
 * favour of plain cards — a real "timeline" line can't sensibly connect
 * items that now sit side by side in two columns.
 */
export function TeacherCredentialsSection({ teacher }) {
  const t = useT();

  const experiences = teacher.experiences ?? [];
  const subjects = teacher.subjects ?? [];

  const hasExperiences = experiences.length > 0;
  const hasSubjects = subjects.length > 0;
  if (!hasExperiences && !hasSubjects) return null;

  return (
    <div className="mt-6 flex flex-col gap-6">
      {hasExperiences && (
        <section className="rounded-[28px] bg-white p-5 text-start shadow-[0_10px_30px_rgba(17,24,39,0.06)] sm:p-6">
          <h3 className="text-lg font-bold text-[#1E1E1E]">{t("teacher.previousExperience")}</h3>

          {/* items-start (not the grid default of stretch) lets a card with a longer description grow on its own instead of forcing its row-mate to match height */}
          <div className="mt-5 grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
            {experiences.map((exp, i) => {
              const { icon: Icon, card } = EXP_PALETTE[i % EXP_PALETTE.length];
              const isCurrent = CURRENT_RE.test(exp.period ?? "");
              // Status colour is independent of the card's decorative palette above —
              // pink for ongoing, green for finished, mirroring the reference's cue.
              const statusBadge = isCurrent ? "bg-accent-pink/15 text-accent-pink" : "bg-[#2E9E6B]/15 text-[#2E9E6B]";
              return (
                <div
                  key={exp.id}
                  className={`flex min-w-0 flex-wrap items-start gap-x-3 gap-y-2 overflow-hidden rounded-2xl p-3 ${card}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-card">
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-bold text-[#1E1E1E]">{exp.title}</h4>
                    {/* الشركة/الجهة/المؤسسة تحت العنوان مباشرة، ثم الموقع والفترة جنباً إلى جنب تحتها */}
                    {exp.company && <p className="mt-0.5 truncate text-xs font-semibold text-ink-soft">{exp.company}</p>}
                    {(exp.location || exp.period) && (
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-soft">
                        {exp.location && <span className="truncate">{exp.location}</span>}
                        {exp.period && <span className="truncate">{exp.period}</span>}
                      </div>
                    )}
                    {exp.description && (
                      <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-ink-soft">{exp.description}</p>
                    )}
                  </div>
                  {exp.period && (
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadge}`}>
                      {isCurrent ? t("teacher.experienceCurrent") : t("teacher.experienceCompleted")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {hasSubjects && <SubjectsCard title={t("teacher.subjects")} subjects={subjects} />}
    </div>
  );
}
