import { useState } from "react";
import { Award } from "lucide-react";
import { useT } from "@/hooks/useT";

/** Same neon navy used across the header/philosophy sections — kept for one consistent "identity" family */
const NEON_GRADIENT = "linear-gradient(135deg, #0E1A4D 0%, #17237E 60%, #1B2E9C 100%)";

const NEUTRAL_DOT = "#C7D0DF";

/**
 * Language name → slug, matched by keyword rather than an exact-string or
 * `code` lookup — the admin taxonomy has multiple real spellings in the wild
 * ("العربية" vs "اللغة العربية", "الإنجليزية" vs "الانجليزية" vs "اللغة
 * الانجليزية", ...) and the backend `code` field isn't consistently "ar"/"en"
 * across environments, so neither is a safe key on its own.
 */
const LANGUAGE_RULES = [
  { test: /عرب/, slug: "ar" },
  { test: /انجليز|إنجليز|english/i, slug: "en" },
  { test: /ترك|turkish/i, slug: "tr" },
  { test: /فرنس|french/i, slug: "fr" },
];
function languageSlug(label) {
  return LANGUAGE_RULES.find((r) => r.test.test(label ?? ""))?.slug ?? null;
}

/** /public/<slug>.png — ask whoever supplies new language logos to drop them here, named by slug (e.g. tr.png, fr.png) */
const LANGUAGE_FLAGS = { ar: "/ar.png", en: "/en.png", tr: "/tr.png", fr: "/fr.png" };

/** Per-language gradient — reuses the site's own named identity gradients (login/register/CTA), not arbitrary colors */
const LANGUAGE_STYLES = {
  en: { gradient: "bg-hero-gradient", landmark: "/big-ben.png" },
  ar: { gradient: "bg-profile-gradient", landmark: "/khalifa-tower.png" },
};
const DEFAULT_LANGUAGE_GRADIENT = "bg-search-gradient";

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

/** Qualifications card — a grid of dark achievement-badge cards, one per qualification */
function QualificationsCard({ title, qualifications }) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-[24px] bg-white p-5 text-start shadow-[0px_1px_5px_rgba(0,0,0,0.1)] sm:p-6">
      <h3 className="text-lg font-bold text-[#2D2D2D]">{title}</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {qualifications.map((q) => (
          <QualificationBadgeCard key={q} label={q} />
        ))}
      </div>
    </div>
  );
}

/** One colorful language card — flag + name, with the language's landmark bleeding off the bottom corner */
function LanguageCard({ label }) {
  const slug = languageSlug(label);
  const gradient = LANGUAGE_STYLES[slug]?.gradient ?? DEFAULT_LANGUAGE_GRADIENT;
  const landmark = LANGUAGE_STYLES[slug]?.landmark;
  const flag = LANGUAGE_FLAGS[slug];
  const [flagMissing, setFlagMissing] = useState(false);

  return (
    <div
      className={`relative flex h-28 flex-col overflow-hidden rounded-2xl ${gradient} p-4 text-white shadow-[0_10px_24px_rgba(17,24,39,0.14)] sm:h-32`}
    >
      <div className="relative z-10 flex items-center gap-2">
        {flag && !flagMissing && (
          <img
            src={flag}
            alt=""
            className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-white/50"
            onError={() => setFlagMissing(true)}
          />
        )}
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
          <LanguageCard key={l.code ?? l.label} label={l.label} />
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
 * rounded card. Row 1 = المؤهلات العلمية / اللغات, row 2 = المراحل الدراسية /
 * التحضير للامتحانات / المناهج / طريقة التدريس. Cards with no data are dropped.
 */
export function TeacherTeachingScopeSection({ teacher }) {
  const t = useT();

  const row1 = [
    teacher.qualifications?.length > 0 && (
      <QualificationsCard key="qualifications" title={t("teacher.qualifications")} qualifications={teacher.qualifications} />
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
    teacher.teachingMethods?.length > 0 && (
      <ScopeCard key="teachingMethods" title={t("teacher.teachingMethods")}>
        {teacher.teachingMethods.map((m) => (
          <Chip key={m} label={m} dot={NEUTRAL_DOT} />
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
