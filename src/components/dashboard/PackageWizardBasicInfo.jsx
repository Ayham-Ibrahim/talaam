import { useState } from "react";
import { Users, User } from "lucide-react";
import { SmoothSelect } from "./SmoothSelect";
import { MultiSelectChips } from "./MultiSelectChips";
import { ApiErrorList } from "@/components/ui";
import { packageErrorLabel, PACKAGE_FIELDS_WITH_INLINE_ERRORS, isScheduleErrorKey } from "@/lib/packageErrorLabel";
import { useTaxonomyList } from "@/hooks/useTaxonomy";
import { useT } from "@/hooks/useT";

/** ما تبقّى من أخطاء الباك اند بعد استبعاد ما يُعرض أصلاً كإطار أحمر تحت حقله مباشرة (curriculum_ids, stage_ids, discount_percent, description...) */
function remainingErrors(serverErrors) {
  if (!serverErrors) return null;
  const entries = Object.entries(serverErrors).filter(
    ([key]) => !PACKAGE_FIELDS_WITH_INLINE_ERRORS.has(key) && key !== "teacher_price" && !isScheduleErrorKey(key)
  );
  return entries.length > 0 ? { errors: Object.fromEntries(entries) } : null;
}

/* Training centers never reach this wizard at all (they get their own course wizard) —
   so the only two real session_format values the backend accepts apply here. */
const SESSION_TYPES = [
  { key: "individual", icon: User, bg: "#F0FAFD", color: "#6BCEEE" },
  { key: "group", icon: Users, bg: "#FEEDEA", color: "#F74E28" },
];

export function PackageWizardBasicInfo({ data, onChange, onNext, serverErrors }) {
  const t = useT();
  const [touched, setTouched] = useState(false);

  const { data: subjects = [] } = useTaxonomyList("subjects");
  const { data: curricula = [] } = useTaxonomyList("curricula");
  const { data: stages = [] } = useTaxonomyList("stages");

  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: s.name_ar,
  }));
  const curriculumOptions = curricula.map((c) => ({
    value: c.id,
    label: c.name_ar,
  }));
  const stageOptions = stages.map((s) => ({ value: s.id, label: s.name_ar }));

  const isGroup = data.session_format === "group";
  const capacityValid = isGroup ? Number(data.capacity) >= 2 : true;
  // مسافات فقط تُعتبر فارغة — نفس معيار الباك اند (CreatePackageRequest يقلّمها قبل الفحص)
  const descriptionValid = data.description.trim() !== "";
  const isValid =
    data.title.trim() !== "" &&
    data.subject_id !== "" &&
    Number(data.sessions_count) > 0 &&
    capacityValid &&
    descriptionValid;

  // خطأ الباك اند (بعد محاولة حفظ فعلية) له الأولوية دوماً على فحص الفرونت
  // إند المحلي (قبل أي محاولة) — كلاهما يُعرَض بنفس الإطار الأحمر والرسالة
  // أسفل الحقل، فلا يعرف المستخدم أبداً أين الخطأ تحديداً بدون ذلك.
  const titleError = serverErrors?.title?.[0] ?? (touched && data.title.trim() === "" ? t("dashboard.addPackage.titleRequired") : null);
  const subjectError = serverErrors?.subject_id?.[0] ?? (touched && data.subject_id === "" ? t("dashboard.addPackage.subjectRequired") : null);
  const capacityError = serverErrors?.capacity?.[0] ?? (touched && !capacityValid ? t("dashboard.addPackage.capacityInvalid") : null);
  const sessionsCountError =
    serverErrors?.sessions_count?.[0] ?? (touched && !(Number(data.sessions_count) > 0) ? t("dashboard.addPackage.sessionsCountRequired") : null);
  const descriptionError =
    serverErrors?.description?.[0] ?? (touched && !descriptionValid ? t("dashboard.addPackage.descriptionRequired") : null);

  const handleNext = () => {
    setTouched(true);
    if (!isValid) return;
    onNext();
  };

  const selectSessionFormat = (format) => {
    if (format === data.session_format) return;
    // الجدول له شكل مختلف تماماً بين الفردية (day_of_week فقط) والجماعية (date+start_time) — لا يصح نقله بين الاثنين
    onChange({
      session_format: format,
      capacity:
        format === "individual"
          ? "1"
          : data.capacity === "1"
            ? ""
            : data.capacity,
      schedules: [],
    });
  };

  const otherErrors = remainingErrors(serverErrors);

  return (
    <div className="mt-8 flex flex-col items-end gap-6">
      {otherErrors && <ApiErrorList error={otherErrors} labelFor={packageErrorLabel} className="w-full" />}

      <div className="flex w-full flex-col items-start gap-1.5">
        <label className="text-sm font-semibold text-primary">
          {t("dashboard.addPackage.titleLabel")}
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={t("dashboard.addPackage.titlePlaceholder")}
          aria-invalid={!!titleError}
          className={`w-full rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none ${
            titleError ? "border-accent-pink" : "border-[#E3E3E3] focus:border-primary"
          }`}
        />
        {titleError && <p className="text-xs text-accent-pink">{titleError}</p>}
      </div>

      <h3 className="w-full text-right text-base font-bold text-ink">
        {t("dashboard.addPackage.sessionTypeLabel")}
      </h3>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {SESSION_TYPES.map((type) => {
          const Icon = type.icon;
          const selected = data.session_format === type.key;
          return (
            <button
              key={type.key}
              type="button"
              onClick={() => selectSessionFormat(type.key)}
              className="relative flex flex-col items-center gap-2 rounded-2xl border border-[#F2F2F7] bg-white p-4 pt-8 text-center shadow-card transition-colors"
            >
              <span
                className={`absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  selected ? "border-primary" : "border-[#626262]"
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
          label={t("dashboard.addPackage.subjectLabel")}
          value={data.subject_id}
          onChange={(v) => onChange({ subject_id: v })}
          options={subjectOptions}
          placeholder={t("dashboard.addPackage.selectPlaceholder")}
          error={!!subjectError}
          errorMessage={subjectError}
        />

        <div className="flex flex-col items-start gap-1.5">
          <label className="text-sm font-semibold text-primary">
            {t("dashboard.addPackage.capacityLabel")}
          </label>
          <input
            type="number"
            min={isGroup ? 2 : 1}
            max="100"
            disabled={!isGroup}
            value={data.capacity}
            onChange={(e) => onChange({ capacity: e.target.value })}
            aria-invalid={!!capacityError}
            className={`w-full rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink disabled:bg-[#F7F8FA] disabled:text-ink-soft focus:outline-none ${
              capacityError ? "border-accent-pink" : "border-[#E3E3E3] focus:border-primary"
            }`}
          />
          {capacityError && <p className="text-xs text-accent-pink">{capacityError}</p>}
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <MultiSelectChips
          label={t("dashboard.addPackage.curriculumLabel")}
          values={data.curriculum_ids}
          onChange={(v) => onChange({ curriculum_ids: v })}
          options={curriculumOptions}
          placeholder={t("dashboard.addPackage.selectPlaceholder")}
          max={20}
        />
        <MultiSelectChips
          label={t("dashboard.addPackage.stageLabel")}
          values={data.stage_ids}
          onChange={(v) => onChange({ stage_ids: v })}
          options={stageOptions}
          placeholder={t("dashboard.addPackage.selectPlaceholder")}
          max={20}
        />
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex w-full flex-col items-start gap-1.5">
          <label className="text-sm font-semibold text-primary">
            {t("dashboard.addPackage.sessionsCountLabel")}
          </label>
          <input
            type="number"
            min="1"
            max="200"
            value={data.sessions_count}
            onChange={(e) => onChange({ sessions_count: e.target.value })}
            placeholder={t("dashboard.addPackage.sessionsCountPlaceholder")}
            aria-invalid={!!sessionsCountError}
            className={`w-full   rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none  ${
              sessionsCountError ? "border-accent-pink" : "border-[#E3E3E3] focus:border-primary"
            }`}
          />
          {sessionsCountError && <p className="text-xs text-accent-pink">{sessionsCountError}</p>}
        </div>

        <div className="flex w-full flex-col items-start gap-1.5">
          <label className="text-sm font-semibold text-primary">
            {t("dashboard.addPackage.descriptionLabel")}
          </label>

          <textarea
            value={data.description}
            onChange={(e) =>
              onChange({ description: e.target.value.slice(0, 2000) })
            }
            placeholder={t("dashboard.addPackage.descriptionPlaceholder")}
            rows={4}
            aria-invalid={!!descriptionError}
            className={`w-full rounded-lg border px-3 py-2.5 resize-none bg-transparent text-right text-sm text-ink outline-none placeholder:text-[#AEAEB2] ${
              descriptionError ? "border-accent-pink" : "border-[#E3E3E3]"
            }`}
          />
          {descriptionError && <p className="text-xs text-accent-pink">{descriptionError}</p>}
          <div className="text-left text-xs text-[#AEAEB2]">
            {data.description.length}/2000
          </div>
        </div>
      </div>
      <div className="flex w-full">
        <button
          type="button"
          onClick={handleNext}
          className="ml-auto rounded-xl border-2 border-primary bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {t("dashboard.addPackage.next")}
        </button>
      </div>
    </div>
  );
}
