import { useEffect, useRef, useState } from "react";
import { GraduationCap, Users, User, ChevronDown, X } from "lucide-react";
import { useT } from "@/hooks/useT";

/* DOM order renders right-to-left, so step "1" (last) lands active/rightmost. */
const STEPS = [
  { no: 4, key: "review" },
  { no: 3, key: "pricing" },
  { no: 2, key: "scheduling" },
  { no: 1, key: "basicInfo" },
];

/* DOM order renders right-to-left, so "فردية" (last) lands selected/rightmost by default. */
const SESSION_TYPES = [
  {
    key: "individual",
    icon: User,
    bg: "#F0FAFD",
    color: "#6BCEEE",
  },
  {
    key: "group",
    icon: Users,
    bg: "#FEEDEA",
    color: "#F74E28",
  },

  {
    key: "training",
    icon: GraduationCap,
    bg: "#F7E6EE",
    color: "#B00852",
  },
];

function StepIndicator() {
  const t = useT();
  return (
    <div className="flex items-center justify-center gap-2 px-16">
      {STEPS.map((step, i) => {
        const isActive = step.no === 1;
        const isConnectorActive = STEPS[i + 1]?.no === 1;
        return (
          <div
            key={step.no}
            className="flex flex-1 items-center gap-2 last:flex-none"
          >
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-medium ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-[#E5E5EA] text-[#626262]"
                }`}
              >
                {step.no}
              </span>
              <span className="whitespace-nowrap text-sm font-medium text-ink">
                {t(`dashboard.addPackage.steps.${step.key}`)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`h-0.5 flex-1 rounded-full ${isConnectorActive ? "bg-primary" : "bg-[#E5E5EA]"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Custom dropdown — native <select> can't be restyled, so this renders its own smooth, brand-colored option panel. */
function SmoothSelect({ label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className="flex flex-col items-start gap-1.5">
      <label className="text-sm font-semibold text-primary">{label}</label>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-3 text-sm transition-colors duration-150 ${
            open ? "border-primary" : "border-[#E3E3E3] hover:border-primary/40"
          }`}
        >
          <ChevronDown
            size={16}
            className={`shrink-0 text-ink-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
          <span className={selected ? "text-ink" : "text-[#AEAEB2]"}>
            {selected ? selected.label : placeholder}
          </span>
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full origin-top animate-fade-in overflow-hidden rounded-2xl bg-white p-2 shadow-lift">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full rounded-xl px-4 py-3 text-right text-sm transition-colors duration-150 ${
                    isSelected
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-ink hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function AddPackageModal({ onClose }) {
  const t = useT();
  const [sessionType, setSessionType] = useState("individual");
  const [subject, setSubject] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [description, setDescription] = useState("");

  const subjectOptions = [
    { value: "math", label: "رياضيات" },
    { value: "english", label: "اللغة الانكليزية" },
  ];
  const curriculumOptions = [
    { value: "ig-american", label: "IG , American" },
    { value: "ielts", label: "IELTS" },
  ];

  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-card sm:p-8">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t("dashboard.teacherPackages.close")}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
        >
          <X size={18} />
        </button>
      )}

      <StepIndicator />

      <div className="mt-8 flex flex-col items-end gap-6">
        <h3 className="w-full text-right text-base font-bold text-ink">
          {t("dashboard.addPackage.sessionTypeLabel")}
        </h3>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {SESSION_TYPES.map((type) => {
            const Icon = type.icon;
            const selected = sessionType === type.key;
            return (
              <button
                key={type.key}
                type="button"
                onClick={() => setSessionType(type.key)}
                className="relative flex flex-col items-center gap-2 rounded-2xl border border-[#F2F2F7] bg-white p-4 pt-8 text-center shadow-card transition-colors"
              >
                <span
                  className={`absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selected ? "border-primary " : "border-[#626262]"
                  }`}
                >
                  {selected && (
                    <span className="h-3 w-3 rounded-full bg-primary" />
                  )}
                </span>

                <div
                  className="flex h-[60px] w-[60px] items-center justify-center rounded-xl"
                  style={{ background: type.bg }}
                >
                  <Icon size={30} style={{ color: type.color }} />
                </div>

                <h4 className="font-bold text-[#2D2D2D]">
                  {t(`dashboard.addPackage.sessionTypes.${type.key}.title`)}
                </h4>
                <p className="text-sm text-ink-soft">
                  {t(`dashboard.addPackage.sessionTypes.${type.key}.desc`)}
                </p>
                <span
                  className="rounded-pill px-3 py-1 text-sm"
                  style={{ background: type.bg, color: type.color }}
                >
                  {t(`dashboard.addPackage.sessionTypes.${type.key}.badge`)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <SmoothSelect
            label={t("dashboard.addPackage.curriculumLabel")}
            value={curriculum}
            onChange={setCurriculum}
            options={curriculumOptions}
            placeholder={t("dashboard.addPackage.selectPlaceholder")}
          />
          <SmoothSelect
            label={t("dashboard.addPackage.subjectLabel")}
            value={subject}
            onChange={setSubject}
            options={subjectOptions}
            placeholder={t("dashboard.addPackage.selectPlaceholder")}
          />
        </div>

        <div className="flex w-full flex-col items-start gap-1.5">
          <label className="text-sm font-semibold text-primary">
            {t("dashboard.addPackage.descriptionLabel")}
          </label>
          <div className="w-full rounded-lg border border-[#E3E3E3] px-3 py-2.5">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 100))}
              placeholder={t("dashboard.addPackage.descriptionPlaceholder")}
              rows={4}
              className="w-full resize-none bg-transparent text-right text-sm text-ink outline-none placeholder:text-[#AEAEB2]"
            />
            <div className="text-left text-xs text-[#AEAEB2]">
              {description.length}/100
            </div>
          </div>
        </div>

        <div className="flex w-full">
          <button
            type="button"
            className="ml-auto rounded-xl border-2 border-primary bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary-hover"
          >
            {t("dashboard.addPackage.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
