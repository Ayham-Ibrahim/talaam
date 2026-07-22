import { CalendarDays, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui";
import { useT } from "@/hooks/useT";

export function PackageListCard({ pkg }) {
  const t = useT();
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pkg.usagePercent / 100) * circumference;

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-card">
      {/* Teacher info (right) + package title (left) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <div className="font-semibold text-ink">{pkg.teacherName}</div>
            <div className="text-sm text-ink-soft">{pkg.subject}</div>
          </div>
          <Avatar
            name={pkg.teacherName}
            src={pkg.teacherAvatar}
            size="sm"
            className="!h-[54px] !w-[54px]"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-ink">{pkg.packageTitle}</span>
          <Crown size={22} className="text-primary" />
        </div>
      </div>

      {/* Stats (right) + donut (left) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="text-center">
            <div className="text-xs text-primary">
              {t("dashboard.myPackages.total")}
            </div>
            <div className="font-semibold text-ink">
              {pkg.totalSessions} {t("dashboard.myPackages.sessionsUnit")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-primary">
              {t("dashboard.myPackages.used")}
            </div>
            <div className="font-semibold text-ink">
              {String(pkg.usedSessions).padStart(2, "0")}{" "}
              {t("dashboard.myPackages.sessionUnit")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-primary">
              {t("dashboard.myPackages.remaining")}
            </div>
            <div className="font-semibold text-ink">
              {String(pkg.remainingSessions).padStart(2, "0")}{" "}
              {t("dashboard.myPackages.sessionUnit")}
            </div>
          </div>
        </div>

        <div className="relative flex h-[100px] w-[100px] shrink-0 items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id={`package-progress-gradient-${pkg.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4B6898" />
                <stop offset="100%" stopColor="#C7D0DF" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#F5F5F5"
              strokeWidth="9"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={`url(#package-progress-gradient-${pkg.id})`}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="absolute text-lg font-bold text-ink">
            {pkg.usagePercent}%
          </span>
        </div>
      </div>

      {/* Expiry */}
      <div className="flex items-center justify-end gap-1.5 text-sm text-ink">
        <span>
          {t("dashboard.myPackages.expiryDate")} : {pkg.expiryDate}
        </span>
        <CalendarDays size={18} className="text-ink" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          to={`/dashboard/student/packages/${pkg.id}`}
          className="flex-1 rounded-xl border border-primary py-3 text-center text-sm font-medium text-primary hover:bg-primary/5"
        >
          {t("dashboard.myPackages.details")}
        </Link>
        <button
          type="button"
          className="flex-1 rounded-xl border border-primary bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {t("dashboard.myPackages.rebook")}
        </button>
      </div>
    </div>
  );
}
