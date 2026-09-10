import { useT } from "@/hooks/useT";

const LANGUAGE_FLAGS = { ar: "/ar.png", en: "/en.png" };
const NEUTRAL_DOT = "#C7D0DF";
/** Per-subject accent dots, matching the Figma (رياضيات → #B00852, فيزياء → #6BCEEE, …) */
const SUBJECT_DOTS = ["#B00852", "#6BCEEE", "#F5A623", "#7E57C2", "#2E9E6B", "#2F80ED"];

function Chip({ label, dot, dotSize = 14, flag, textColor = "#1E1E1E" }) {
  return (
    <span
      className="inline-flex items-center gap-[3px] rounded-2xl bg-[#FAFAFA] px-2 py-2 text-sm font-medium"
      style={{ color: textColor }}
    >
      <span>{label}</span>
      {flag ? (
        <img src={flag} alt="" className="h-4 w-4 shrink-0 rounded-full object-cover" />
      ) : (
        dot && (
          <span
            className="shrink-0 rounded-full"
            style={{ width: dotSize, height: dotSize, background: dot }}
          />
        )
      )}
    </span>
  );
}

function ScopeCard({ title, children }) {
  return (
    <div className="flex flex-1 flex-col items-end justify-center gap-2 rounded-[24px] bg-white px-6 py-4 text-end shadow-[0px_1px_5px_rgba(0,0,0,0.1)] sm:px-[31px]">
      <h3 className="w-full text-lg font-bold text-[#2D2D2D]">{title}</h3>
      <div className="flex flex-wrap items-center justify-end gap-4">{children}</div>
    </div>
  );
}

/**
 * Teaching-scope cards, matching the Figma: each taxonomy is its own white
 * rounded card. Row 1 = المواد / المراحل الدراسية, row 2 = اللغات / التحضير
 * للامتحانات / المناهج. Cards with no data are dropped.
 */
export function TeacherTeachingScopeSection({ teacher }) {
  const t = useT();

  const row1 = [
    teacher.subjects?.length > 0 && (
      <ScopeCard key="subjects" title={t("teacher.subjects")}>
        {teacher.subjects.map((s, i) => (
          <Chip key={s} label={s} dot={SUBJECT_DOTS[i % SUBJECT_DOTS.length]} textColor="#2D2D2D" />
        ))}
      </ScopeCard>
    ),
    teacher.stages?.length > 0 && (
      <ScopeCard key="stages" title={t("teacher.stages")}>
        {teacher.stages.map((s) => (
          <Chip key={s} label={s} dot={NEUTRAL_DOT} dotSize={10} />
        ))}
      </ScopeCard>
    ),
  ].filter(Boolean);

  const row2 = [
    teacher.languages?.length > 0 && (
      <ScopeCard key="languages" title={t("teacher.languages")}>
        {teacher.languages.map((l) => (
          <Chip key={l.code ?? l.label} label={l.label} flag={LANGUAGE_FLAGS[l.code]} textColor="#2D2D2D" />
        ))}
      </ScopeCard>
    ),
    teacher.examPrep?.length > 0 && (
      <ScopeCard key="examPrep" title={t("teacher.examPrep")}>
        {teacher.examPrep.map((e) => (
          <Chip key={e} label={e} dot={NEUTRAL_DOT} />
        ))}
      </ScopeCard>
    ),
    teacher.curricula?.length > 0 && (
      <ScopeCard key="curricula" title={t("teacher.curricula")}>
        {teacher.curricula.map((c) => (
          <Chip key={c} label={c} dot={NEUTRAL_DOT} />
        ))}
      </ScopeCard>
    ),
  ].filter(Boolean);

  if (row1.length === 0 && row2.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-4">
      {row1.length > 0 && <div className="flex flex-col gap-4 lg:flex-row">{row1}</div>}
      {row2.length > 0 && <div className="flex flex-col gap-4 lg:flex-row">{row2}</div>}
    </div>
  );
}
