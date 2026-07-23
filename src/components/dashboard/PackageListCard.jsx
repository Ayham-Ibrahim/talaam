import { Link } from "react-router-dom";
import { PACKAGE_TYPE_STYLES } from "@/mocks/dashboard.mock";
import { useT } from "@/hooks/useT";

export function PackageListCard({ pkg }) {
  const t = useT();
  const typeStyle = PACKAGE_TYPE_STYLES[pkg.type];

  return (
    <Link
      to={`/dashboard/student/packages/${pkg.id}`}
      className="flex w-full flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-lift"
    >
      {/* Type badge (right) + package title/teacher (left) */}
      <div className="flex items-start justify-between gap-3">
        <div className="text-right">
          <div className="font-bold text-ink">{pkg.packageTitle}</div>
          <div className="text-sm text-ink-soft">
            {pkg.teacherName} - {pkg.subject}
          </div>
        </div>
        <span
          className="rounded-pill px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: typeStyle.bg, color: typeStyle.color }}
        >
          {typeStyle.label}
        </span>
      </div>

      {/* Curriculum tags */}
      {pkg.curriculum && (
        <div className="flex flex-wrap items-center gap-2">
          {pkg.curriculum.split("-").map((tag) => (
            <span key={tag} className="rounded-lg bg-[#F2F2F7] px-4 py-2 text-xs font-semibold text-ink-soft">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between gap-2 text-center">
        <div>
          <div className="text-xs text-primary">{t("dashboard.myPackages.total")}</div>
          <div className="font-semibold text-ink">
            {pkg.totalSessions} {t("dashboard.myPackages.sessionsUnit")}
          </div>
        </div>
        <div>
          <div className="text-xs text-primary">{t("dashboard.myPackages.used")}</div>
          <div className="font-semibold text-ink">
            {String(pkg.usedSessions).padStart(2, "0")} {t("dashboard.myPackages.sessionUnit")}
          </div>
        </div>
        <div>
          <div className="text-xs text-primary">{t("dashboard.myPackages.remaining")}</div>
          <div className="font-semibold text-ink">
            {String(pkg.remainingSessions).padStart(2, "0")} {t("dashboard.myPackages.sessionUnit")}
          </div>
        </div>
      </div>
    </Link>
  );
}
