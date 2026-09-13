import { BookOpen } from "lucide-react";
import { useT } from "@/hooks/useT";

const LANGUAGE_FLAGS = { ar: "/ar.png", en: "/en.png" };
const NEUTRAL_DOT = "#C7D0DF";

/** Per-language gradient (built from our own brand tokens, not arbitrary colors) + decorative landmark */
const LANGUAGE_STYLES = {
  en: { gradient: "from-primary to-primary-hover", landmark: "/big-ben.png" },
  ar: { gradient: "from-accent-purple to-accent-pink", landmark: "/khalifa-tower.png" },
};
const DEFAULT_LANGUAGE_GRADIENT = "from-accent-purple to-primary";

function Chip({ label, dot, dotSize = 14, flag, textColor = "#1E1E1E" }) {
  return (
    <span
      className="inline-flex items-center gap-[3px] rounded-2xl bg-[#FAFAFA] px-2 py-2 text-sm font-medium"
      style={{ color: textColor }}
    >
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
      <span>{label}</span>
    </span>
  );
}

/** Subjects card — a plain row list (icon + name), no trailing label/chevron, one shared icon for every subject */
function SubjectsCard({ title, subjects }) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-[24px] bg-white p-5 text-start shadow-[0px_1px_5px_rgba(0,0,0,0.1)] sm:p-6">
      <h3 className="text-lg font-bold text-[#2D2D2D]">{title}</h3>

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

/** One colorful language card — flag + name, with the language's landmark bleeding off the bottom corner */
function LanguageCard({ code, label }) {
  const gradient = LANGUAGE_STYLES[code]?.gradient ?? DEFAULT_LANGUAGE_GRADIENT;
  const landmark = LANGUAGE_STYLES[code]?.landmark;
  const flag = LANGUAGE_FLAGS[code];

  return (
    <div
      className={`relative flex h-28 flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white shadow-[0_10px_24px_rgba(17,24,39,0.14)] sm:h-32`}
    >
      <div className="relative z-10 flex items-center gap-2">
        {flag && <img src={flag} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-white/50" />}
        <h4 className="text-sm font-bold sm:text-base">{label}</h4>
      </div>

      {landmark && (
        <img
          src={landmark}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 end-1 h-20 w-auto object-contain opacity-95 sm:h-24"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}

/** Languages card — a 2-up grid of colorful per-language cards, replacing the plain chip row */
function LanguagesCard({ title, languages }) {
  return (
    <div className="flex-1 rounded-[24px] bg-white p-5 text-start shadow-[0px_1px_5px_rgba(0,0,0,0.1)] sm:p-6">
      <h3 className="text-lg font-bold text-[#2D2D2D]">{title}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {languages.map((l) => (
          <LanguageCard key={l.code ?? l.label} code={l.code} label={l.label} />
        ))}
      </div>
    </div>
  );
}

function ScopeCard({ title, children }) {
  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-2 rounded-[24px] bg-white px-6 py-4 text-start shadow-[0px_1px_5px_rgba(0,0,0,0.1)] sm:px-[31px]">
      <h3 className="w-full text-lg font-bold text-[#2D2D2D]">{title}</h3>
      <div className="flex flex-wrap items-center justify-start gap-4">{children}</div>
    </div>
  );
}

/**
 * Teaching-scope cards, matching the Figma: each taxonomy is its own white
 * rounded card. Row 1 = المواد / اللغات, row 2 = المراحل الدراسية / التحضير
 * للامتحانات / المناهج. Cards with no data are dropped.
 */
export function TeacherTeachingScopeSection({ teacher }) {
  const t = useT();

  const row1 = [
    teacher.subjects?.length > 0 && (
      <SubjectsCard key="subjects" title={t("teacher.subjects")} subjects={teacher.subjects} />
    ),
    teacher.languages?.length > 0 && (
      <LanguagesCard key="languages" title={t("teacher.languages")} languages={teacher.languages} />
    ),
  ].filter(Boolean);

  const row2 = [
    teacher.stages?.length > 0 && (
      <ScopeCard key="stages" title={t("teacher.stages")}>
        {teacher.stages.map((s) => (
          <Chip key={s} label={s} dot={NEUTRAL_DOT} dotSize={10} />
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
