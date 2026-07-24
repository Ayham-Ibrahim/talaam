import { CalendarDays } from "lucide-react";
import { SESSION_TYPE_STYLES } from "@/mocks/dashboard.mock";
import { useT } from "@/hooks/useT";

export function ActivePackagesTable({ packages }) {
  const t = useT();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h3 className="flex items-center gap-2 font-bold text-ink">
          {t("dashboard.activePackagesTitle")}
          <CalendarDays size={20} className="text-primary" />
        </h3>
        <button
          type="button"
          className="text-sm font-bold text-primary hover:underline"
        >
          {t("dashboard.viewAll")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr>
              <th className="px-2 py-4 text-right font-bold text-ink">
                {t("dashboard.activePackages.package")}
              </th>
              <th className="px-2 py-4 text-center font-bold text-ink">
                {t("dashboard.activePackages.type")}
              </th>
              <th className="px-2 py-4 text-center font-bold text-ink">
                {t("dashboard.activePackages.subject")}
              </th>
              <th className="px-2 py-4 text-center font-bold text-ink">
                {t("dashboard.activePackages.curriculum")}
              </th>
              <th className="px-2 py-4 text-center font-bold text-ink">
                {t("dashboard.activePackages.sessionsCount")}
              </th>
              <th className="px-2 py-4 text-center font-bold text-ink">
                {t("dashboard.activePackages.action")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {packages.map((pkg) => {
              const typeStyle = SESSION_TYPE_STYLES[pkg.sessionType];
              return (
                <tr key={pkg.id}>
                  <td className="px-2 py-4 text-right font-semibold text-ink">
                    {pkg.packageTitle}
                  </td>
                  <td
                    className="px-2 py-4 text-center font-semibold"
                    style={{ color: typeStyle?.color }}
                  >
                    {typeStyle?.label}
                  </td>
                  <td className="px-2 py-4 text-center text-ink-soft">
                    {pkg.subject}
                  </td>
                  <td className="px-2 py-4 text-center text-ink-soft" dir="ltr">
                    {pkg.curriculum}
                  </td>
                  <td className="px-2 py-4 text-center text-ink-soft">
                    {pkg.sessionsCount}
                  </td>
                  <td className="px-2 py-4 text-center">
                    <button
                      type="button"
                      className="rounded-xl border-2 border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                    >
                      {t("dashboard.activePackages.details")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
