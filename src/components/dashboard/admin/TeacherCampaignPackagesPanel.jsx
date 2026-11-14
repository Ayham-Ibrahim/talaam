import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { ApiErrorList, EmptyState, Skeleton } from "@/components/ui";
import {
  useAdminCampaignPackages,
  useCreateCampaignPackage,
  useToggleCampaignPackage,
} from "@/hooks/useCampaign";
import { useTaxonomyList } from "@/hooks/useTaxonomy";
import { useT } from "@/hooks/useT";
import { formatPrice } from "@/lib/currency";

const INPUT =
  "w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const PACKAGE_FIELD_LABELS = {
  teacher_id: "المعلم",
  title: "العنوان",
  sessions_count: "عدد الجلسات",
  price: "السعر",
  schedules: "الأوقات المتاحة",
  schedule_timezone: "المنطقة الزمنية",
};

const EMPTY_PACKAGE = {
  title: "",
  description: "",
  subject_id: "",
  sessions_count: "5",
  price: "",
  // { [day_of_week]: [{ start, end }] } — يوم بلا فترات = اليوم كله
  days: {},
};

const DEFAULT_RANGE = { start: "16:00", end: "20:00" };

// الأدمن يُدخل الساعات بتوقيت متصفحه — تُرسل منطقته معها فيفسّرها الباك بها
const BROWSER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

/** ملخص نوافذ الباقة للجدول: "الإثنين 16:00–20:00، الجمعة (كل اليوم)" */
function schedulesSummary(schedules, weekdays, allDayLabel) {
  const byDay = new Map();
  for (const s of schedules ?? []) {
    const ranges = byDay.get(s.day_of_week) ?? [];
    if (s.start_time && s.end_time) {
      ranges.push(`${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)}`);
    }
    byDay.set(s.day_of_week, ranges);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(
      ([day, ranges]) =>
        `${Array.isArray(weekdays) ? weekdays[day] : day} ${ranges.length ? ranges.join("، ") : `(${allDayLabel})`}`,
    )
    .join(" · ");
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-right">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function CampaignPackageModal({ teacherId, onClose, onCreated }) {
  const t = useT();
  const weekdays = t("booking.weekdays");
  const [form, setForm] = useState(EMPTY_PACKAGE);
  const { data: subjects } = useTaxonomyList("subjects");
  const create = useCreateCampaignPackage();

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  const selectedDays = Object.keys(form.days)
    .map(Number)
    .sort((a, b) => a - b);

  const setDays = (update) =>
    setForm((f) => ({ ...f, days: update({ ...f.days }) }));
  const toggleDay = (day) =>
    setDays((days) => {
      if (day in days) delete days[day];
      else days[day] = [];
      return days;
    });
  const addRange = (day) =>
    setDays((days) => ({ ...days, [day]: [...days[day], DEFAULT_RANGE] }));
  const removeRange = (day, index) =>
    setDays((days) => ({
      ...days,
      [day]: days[day].filter((_, i) => i !== index),
    }));
  const setRange = (day, index, field, value) =>
    setDays((days) => ({
      ...days,
      [day]: days[day].map((r, i) =>
        i === index ? { ...r, [field]: value } : r,
      ),
    }));

  const rangesValid = selectedDays.every((day) =>
    form.days[day].every((r) => r.start && r.end && r.end > r.start),
  );

  const canSubmit =
    form.title.trim() &&
    Number(form.sessions_count) > 0 &&
    Number(form.price) > 0 &&
    selectedDays.length > 0 &&
    rangesValid;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    create.mutate(
      {
        teacher_id: Number(teacherId),
        title: form.title.trim(),
        description: form.description.trim() || null,
        subject_id: form.subject_id ? Number(form.subject_id) : null,
        sessions_count: Number(form.sessions_count),
        price: Number(form.price),
        schedules: selectedDays.flatMap((day) =>
          form.days[day].length
            ? form.days[day].map((r) => ({
                day_of_week: day,
                start_time: r.start,
                end_time: r.end,
              }))
            : [{ day_of_week: day }],
        ),
        schedule_timezone: BROWSER_TIMEZONE,
      },
      {
        onSuccess: () => {
          onCreated();
          onClose();
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("dashboard.adminCampaigns.cancel")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">
            {t("dashboard.adminCampaigns.addPackage")}
          </h3>
          <span className="w-8" />
        </div>

        <form
          className="grid grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2"
          onSubmit={onSubmit}
        >
          <Field label={t("dashboard.adminCampaigns.packageTitle")}>
            <input
              className={INPUT}
              value={form.title}
              onChange={set("title")}
              maxLength={180}
            />
          </Field>
          <Field label={t("dashboard.adminCampaigns.subject")}>
            <select
              className={INPUT}
              value={form.subject_id}
              onChange={set("subject_id")}
            >
              <option value="">—</option>
              {(subjects ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_ar}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("dashboard.adminCampaigns.sessionsCount")}>
            <input
              type="number"
              min={1}
              max={50}
              className={INPUT}
              value={form.sessions_count}
              onChange={set("sessions_count")}
            />
          </Field>
          <Field label={t("dashboard.adminCampaigns.price")}>
            <input
              type="number"
              min={1}
              step="0.01"
              className={INPUT}
              value={form.price}
              onChange={set("price")}
            />
          </Field>

          <div className="flex flex-col gap-3 text-right sm:col-span-2">
            <div>
              <span className="text-sm font-semibold text-ink">
                {t("dashboard.adminCampaigns.days")}
              </span>
              <p className="mt-0.5 text-xs text-ink-soft">
                {t("dashboard.adminCampaigns.daysHint")} ({BROWSER_TIMEZONE})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    day in form.days
                      ? "border border-primary bg-primary text-white"
                      : "border border-line bg-white text-ink-soft hover:border-primary hover:text-primary"
                  }`}
                >
                  {Array.isArray(weekdays) ? weekdays[day] : day}
                </button>
              ))}
            </div>

            {selectedDays.map((day) => (
              <div
                key={day}
                className="flex flex-col gap-2 rounded-xl border border-line p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">
                    {Array.isArray(weekdays) ? weekdays[day] : day}
                  </span>
                  <button
                    type="button"
                    onClick={() => addRange(day)}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-70"
                  >
                    <Plus size={14} />
                    {t("dashboard.adminCampaigns.addTimeRange")}
                  </button>
                </div>
                {form.days[day].length === 0 ? (
                  <span className="text-xs text-ink-soft">
                    {t("dashboard.adminCampaigns.allDay")}
                  </span>
                ) : (
                  form.days[day].map((range, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-ink-soft">
                        {t("dashboard.adminCampaigns.from")}
                      </span>
                      <input
                        type="time"
                        step={1800}
                        className={`${INPUT} p-2`}
                        value={range.start}
                        onChange={(e) =>
                          setRange(day, i, "start", e.target.value)
                        }
                      />
                      <span className="text-xs text-ink-soft">
                        {t("dashboard.adminCampaigns.to")}
                      </span>
                      <input
                        type="time"
                        step={1800}
                        className={`${INPUT} p-2`}
                        value={range.end}
                        onChange={(e) =>
                          setRange(day, i, "end", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeRange(day, i)}
                        aria-label={t("dashboard.adminCampaigns.removeTimeRange")}
                        className="shrink-0 rounded-full p-1.5 text-accent-pink hover:bg-accent-pink/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            ))}
            {!rangesValid && (
              <span className="text-xs text-accent-pink">
                {t("dashboard.adminCampaigns.invalidTimeRange")}
              </span>
            )}
          </div>

          <div className="sm:col-span-2">
            <Field label={t("dashboard.adminCampaigns.description")}>
              <textarea
                className={INPUT}
                rows={3}
                value={form.description}
                onChange={set("description")}
                maxLength={5000}
              />
            </Field>
          </div>

          <p className="text-right text-xs text-ink-soft sm:col-span-2">
            {t("dashboard.adminCampaigns.packageNote")}
          </p>

          {create.isError && (
            <div className="sm:col-span-2">
              <ApiErrorList
                error={create.error}
                labelFor={(p) => PACKAGE_FIELD_LABELS[p] ?? p}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || create.isPending}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 sm:col-span-2"
          >
            <Plus size={16} />
            {create.isPending
              ? t("dashboard.adminCampaigns.creating")
              : t("dashboard.adminCampaigns.createPackage")}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * باقات الحملة المخفّضة لهذا المعلم: إنشاؤها باسمه (مبلغها للمنصة والمعلم براتب ثابت)،
 * وتعطيلها وتفعيلها. يُشترط معلم موثّق وليس مركزاً تدريبياً (يتحقق الباك أيضاً).
 */
export function TeacherCampaignPackagesPanel({ teacherId, teacher }) {
  const t = useT();
  const { data: packages, isLoading } = useAdminCampaignPackages(teacherId);
  const toggle = useToggleCampaignPackage();
  const [showModal, setShowModal] = useState(false);
  const [created, setCreated] = useState(false);

  const canCreate =
    teacher?.status === "verified" && teacher?.type !== "training_center";

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-right">
          <h2 className="text-lg font-bold text-ink">
            {t("dashboard.adminCampaigns.packagesTitle")}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {t("dashboard.adminCampaigns.packagesSubtitle")}
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setCreated(false);
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus size={16} />
            {t("dashboard.adminCampaigns.addPackage")}
          </button>
        )}
      </div>

      {!canCreate && (
        <div className="rounded-2xl bg-line/30 px-4 py-3 text-right text-sm text-ink-soft">
          {t("dashboard.adminCampaigns.teacherNotEligible")}
        </div>
      )}

      {created && (
        <div className="rounded-2xl bg-success-light px-4 py-3 text-right text-sm font-medium text-success">
          {t("dashboard.adminCampaigns.packageCreated")}
        </div>
      )}

      {toggle.isError && (
        <ApiErrorList error={toggle.error} labelFor={() => null} />
      )}

      {isLoading ? (
        <Skeleton className="h-32 rounded-2xl" />
      ) : !packages?.length ? (
        <EmptyState title={t("dashboard.adminCampaigns.noPackages")} />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-right">
                {["title", "times", "sessions", "price", "status"].map((col) => (
                  <th key={col} className="px-4 py-3 font-bold text-ink">
                    {t(`dashboard.adminCampaigns.packageCols.${col}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {packages.map((p) => {
                const enabled = p.status === "active";
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {p.title}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft">
                      {schedulesSummary(
                        p.schedules,
                        t("booking.weekdays"),
                        t("dashboard.adminCampaigns.allDay"),
                      )}
                      {p.schedule_timezone && (
                        <span className="block text-[11px] opacity-70" dir="ltr">
                          {p.schedule_timezone}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {p.sessions_count}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {formatPrice(p.student_price, "AED")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={
                          toggle.isPending ||
                          !["active", "disabled"].includes(p.status)
                        }
                        onClick={() =>
                          toggle.mutate({ id: p.id, enabled: !enabled })
                        }
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          enabled
                            ? "bg-success-light text-success"
                            : "bg-line/50 text-ink-soft"
                        }`}
                      >
                        {enabled
                          ? t("dashboard.adminCampaigns.active")
                          : t("dashboard.adminCampaigns.inactive")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CampaignPackageModal
          teacherId={teacherId}
          onClose={() => setShowModal(false)}
          onCreated={() => setCreated(true)}
        />
      )}
    </section>
  );
}
