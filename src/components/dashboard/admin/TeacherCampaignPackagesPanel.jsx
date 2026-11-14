import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ApiErrorList, EmptyState, Skeleton } from "@/components/ui";
import {
  useAdminCampaignPackages,
  useCreateCampaignPackage,
  useTeacherAvailableDays,
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
  schedules: "الأيام المتاحة",
};

const EMPTY_PACKAGE = {
  title: "",
  description: "",
  subject_id: "",
  sessions_count: "5",
  price: "",
  days: [],
};

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
  const { data: availableDays, isLoading: daysLoading } =
    useTeacherAvailableDays(teacherId);
  const { data: subjects } = useTaxonomyList("subjects");
  const create = useCreateCampaignPackage();

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  const toggleDay = (day) =>
    setForm((f) => ({
      ...f,
      days: f.days.includes(day)
        ? f.days.filter((d) => d !== day)
        : [...f.days, day],
    }));

  const canSubmit =
    form.title.trim() &&
    Number(form.sessions_count) > 0 &&
    Number(form.price) > 0 &&
    form.days.length > 0;

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
        schedules: [...form.days].sort().map((day) => ({ day_of_week: day })),
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

          <div className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">
              {t("dashboard.adminCampaigns.days")}
            </span>
            {daysLoading ? (
              <Skeleton className="h-9 rounded-xl" />
            ) : !availableDays?.length ? (
              <span className="text-xs text-accent-pink">
                {t("dashboard.adminCampaigns.noAvailableDays")}
              </span>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {availableDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
                      form.days.includes(day)
                        ? "border border-primary bg-primary text-white"
                        : "border border-line bg-white text-ink-soft hover:border-primary hover:text-primary"
                    }`}
                  >
                    {Array.isArray(weekdays) ? weekdays[day] : day}
                  </button>
                ))}
              </div>
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
                {["title", "sessions", "price", "status"].map((col) => (
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
