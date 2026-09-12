import { Pill } from "@/components/ui";
import { useT } from "@/hooks/useT";

/**
 * Third profile section — previous experience (bulleted timeline) alongside
 * academic qualifications (pills). Full-width row; on desktop the two cards
 * sit side by side, otherwise they stack.
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
        <section className="rounded-2xl bg-white p-5 text-start shadow-card sm:p-6">
          <h3 className="font-bold text-ink">{t("teacher.previousExperience")}</h3>
          <ul className="mt-4 space-y-3">
            {experiences.map((exp) => (
              <li key={exp.id} className="flex gap-2.5 text-sm leading-relaxed text-ink-soft">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  {exp.title}
                  {exp.period ? ` (${exp.period})` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasQualifications && (
        <section className="rounded-2xl bg-white p-5 text-start shadow-card sm:p-6">
          <h3 className="font-bold text-ink">{t("teacher.qualifications")}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {qualifications.map((q) => (
              <Pill key={q} dot="#C7D0DF">
                {q}
              </Pill>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
