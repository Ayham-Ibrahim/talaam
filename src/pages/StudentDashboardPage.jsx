import { Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { UpcomingSessionsCard } from "@/components/dashboard/UpcomingSessionsCard";
import { PackageWidget } from "@/components/dashboard/PackageWidget";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ErrorState, Skeleton } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useStudentDashboard } from "@/hooks/useDashboard";

export function StudentDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useStudentDashboard();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-6" dir="rtl">
          <Skeleton className="h-40 rounded-card" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <WelcomeBanner
            name={user.name.split(" ")[0]}
            sessionsThisWeek={data.stats.upcomingSessionsCount}
          />
          <StatsGrid stats={data.stats} />
          <UpcomingSessionsCard sessions={data.upcomingSessions} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]">
            <PackageWidget pkg={data.currentPackage} />
            <ActivityFeed activities={data.activities} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
