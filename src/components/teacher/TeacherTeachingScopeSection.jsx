import { useT } from "@/hooks/useT";

const LANGUAGE_FLAGS = { ar: "/ar.png", en: "/en.png" };

/** Neutral chip — curricula, stages, exam prep, languages, secondary session types.
 *  `dot` renders a leading colored dot (used to mark subjects). */
function Chip({ children, icon, dot }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-canvas px-3.5 py-1.5 text-[13px] text-ink-soft">
      {dot && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />}
      {icon}
      {children}
    </span>
  );
}

const ACCENT = "#C2185B";

/** Pink-tinted chip — the design highlights the primary session type this way */
function AccentChip({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-accent-pink/20 bg-accent-pink/10 px-3.5 py-1.5 text-[13px] font-medium text-accent-pink">
      {children}
    </span>
  );
}

function Cell({ title, children }) {
  return (
    <div className="text-start">
      <h3 className="mb-3 text-sm font-bold text-ink">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/**
 * "نطاق التدريس" — one bordered card whose grid is 4 columns on desktop:
 * row 1 = المواد / المناهج / المراحل الدراسية / التحضير للامتحانات,
 * row 2 = نوع الجلسة / اللغات. Each cell renders only when it has data.
 * `sessionTypes` is derived by the page from the teacher's bookable packages.
 */
export function TeacherTeachingScopeSection({ teacher, sessionTypes = [] }) {
  const t = useT();

  const cells = [
    teacher.subjects?.length > 0 && (
      <Cell key="subjects" title={t("teacher.subjects")}>
        {teacher.subjects.map((s) => (
          <Chip key={s} dot={ACCENT}>
            {s}
          </Chip>
        ))}
      </Cell>
    ),
    teacher.curricula?.length > 0 && (
      <Cell key="curricula" title={t("teacher.curricula")}>
        {teacher.curricula.map((c) => (
          <Chip key={c}>{c}</Chip>
        ))}
      </Cell>
    ),
    teacher.stages?.length > 0 && (
      <Cell key="stages" title={t("teacher.stages")}>
        {teacher.stages.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </Cell>
    ),
    teacher.examPrep?.length > 0 && (
      <Cell key="examPrep" title={t("teacher.examPrep")}>
        {teacher.examPrep.map((e) => (
          <Chip key={e}>{e}</Chip>
        ))}
      </Cell>
    ),
    sessionTypes.length > 0 && (
      <Cell key="sessionTypes" title={t("teacher.sessionTypes")}>
        {sessionTypes.map((s, i) =>
          i === 0 ? <AccentChip key={s}>{s}</AccentChip> : <Chip key={s}>{s}</Chip>,
        )}
      </Cell>
    ),
    teacher.languages?.length > 0 && (
      <Cell key="languages" title={t("teacher.languages")}>
        {teacher.languages.map((l) => (
          <Chip
            key={l.code ?? l.label}
            icon={
              LANGUAGE_FLAGS[l.code] && (
                <img
                  src={LANGUAGE_FLAGS[l.code]}
                  alt=""
                  className="h-4 w-4 rounded-full object-cover"
                />
              )
            }
          >
            {l.label}
          </Chip>
        ))}
      </Cell>
    ),
  ].filter(Boolean);

  if (cells.length === 0) return null;

  return (
    <div className="mt-6 grid gap-x-6 gap-y-8 rounded-2xl border border-line bg-white p-5 shadow-card sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
      {cells}
    </div>
  );
}
