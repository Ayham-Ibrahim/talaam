import { useState } from "react";
import { Copy, Plus } from "lucide-react";
import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";
import { ApiErrorList, EmptyState, Skeleton } from "@/components/ui";
import { useAdminCampaigns, useSaveCampaign } from "@/hooks/useCampaign";
import { useT } from "@/hooks/useT";

const INPUT =
  "w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const CAMPAIGN_FIELD_LABELS = { name: "اسم الحملة", slug: "الرابط", ends_at: "تاريخ الانتهاء" };

function campaignLink(slug) {
  return `${window.location.origin}/campaign/${slug}`;
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-right">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

/* ─────────────── الحملات ─────────────── */

const EMPTY_CAMPAIGN = { name: "", slug: "", starts_at: "", ends_at: "" };

function CampaignsSection() {
  const t = useT();
  const { data: campaigns, isLoading } = useAdminCampaigns();
  const save = useSaveCampaign();
  const [form, setForm] = useState(EMPTY_CAMPAIGN);
  const [copied, setCopied] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const canSubmit = form.name.trim() && /^[a-z0-9-]+$/.test(form.slug);

  const copy = async (slug) => {
    try {
      await navigator.clipboard.writeText(campaignLink(slug));
      setCopied(slug);
    } catch {
      setCopied(null);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="text-right">
        <h2 className="text-lg font-bold text-ink">{t("dashboard.adminCampaigns.campaignsTitle")}</h2>
        <p className="mt-1 text-sm text-ink-soft">{t("dashboard.adminCampaigns.campaignsSubtitle")}</p>
      </div>

      <form
        className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-5 shadow-card sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          save.mutate(
            {
              name: form.name.trim(),
              slug: form.slug,
              starts_at: form.starts_at || null,
              ends_at: form.ends_at || null,
            },
            { onSuccess: () => setForm(EMPTY_CAMPAIGN) },
          );
        }}
      >
        <Field label={t("dashboard.adminCampaigns.name")}>
          <input className={INPUT} value={form.name} onChange={set("name")} maxLength={150} />
        </Field>
        <Field label={t("dashboard.adminCampaigns.slug")}>
          <input
            className={INPUT}
            dir="ltr"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
            placeholder="summer-2026"
            maxLength={80}
          />
        </Field>
        <Field label={t("dashboard.adminCampaigns.startsAt")}>
          <input type="date" className={INPUT} value={form.starts_at} onChange={set("starts_at")} />
        </Field>
        <Field label={t("dashboard.adminCampaigns.endsAt")}>
          <input type="date" className={INPUT} value={form.ends_at} onChange={set("ends_at")} />
        </Field>
        {form.slug && (
          <p className="text-right text-xs text-ink-soft sm:col-span-2" dir="ltr">
            {campaignLink(form.slug)}
          </p>
        )}
        {save.isError && (
          <div className="sm:col-span-2">
            <ApiErrorList error={save.error} labelFor={(p) => CAMPAIGN_FIELD_LABELS[p] ?? p} />
          </div>
        )}
        <button
          type="submit"
          disabled={!canSubmit || save.isPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 sm:col-span-2"
        >
          <Plus size={16} />
          {t("dashboard.adminCampaigns.createCampaign")}
        </button>
      </form>

      {isLoading ? (
        <Skeleton className="h-32 rounded-2xl" />
      ) : !campaigns?.length ? (
        <EmptyState title={t("dashboard.adminCampaigns.noCampaigns")} />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-right">
                {["name", "link", "users", "period", "status"].map((col) => (
                  <th key={col} className="px-4 py-3 font-bold text-ink">
                    {t(`dashboard.adminCampaigns.cols.${col}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold text-ink">{c.name}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => copy(c.slug)}
                      className="inline-flex items-center gap-1.5 text-primary hover:opacity-70"
                      dir="ltr"
                    >
                      <Copy size={14} />
                      /campaign/{c.slug}
                    </button>
                    {copied === c.slug && (
                      <span className="mr-2 text-xs text-success">{t("dashboard.adminCampaigns.copied")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.users_count ?? 0}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {(c.starts_at ?? "").slice(0, 10) || "—"} → {(c.ends_at ?? "").slice(0, 10) || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={save.isPending}
                      onClick={() => save.mutate({ id: c.id, is_active: !c.is_active })}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        c.is_active ? "bg-success-light text-success" : "bg-line/50 text-ink-soft"
                      }`}
                    >
                      {c.is_active ? t("dashboard.adminCampaigns.active") : t("dashboard.adminCampaigns.inactive")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** الحملات الإعلانية وروابطها — باقاتها المخفضة تُنشأ من صفحة المعلم (تبويب "الباقات المخفضة") */
export function AdminCampaignsPage() {
  const t = useT();
  return (
    <AdminDashboardLayout>
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t("dashboard.adminCampaigns.title")}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t("dashboard.adminCampaigns.subtitle")}</p>
        </div>
        <CampaignsSection />
      </div>
    </AdminDashboardLayout>
  );
}
