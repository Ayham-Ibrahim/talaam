import { Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { TeacherStatsGrid } from "@/components/dashboard/TeacherStatsGrid";
import { UpcomingSessionsCard } from "@/components/dashboard/UpcomingSessionsCard";
import { ActivePackagesTable } from "@/components/dashboard/ActivePackagesTable";
import { ErrorState, Skeleton } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherDashboard } from "@/hooks/useDashboard";

export function TeacherDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useTeacherDashboard();

  if (!user) return <Navigate to="/login" replace />;

  const firstName = user.name.replace(/^[أا]\.\s*/, "").split(" ")[0];

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
            name={firstName}
            sessionsThisWeek={data.upcomingSessions.length}
            imageSrc="/hero-teacher.webp"
            teal
          />
          <TeacherStatsGrid stats={data.stats} />
          <UpcomingSessionsCard sessions={data.upcomingSessions} />
          <ActivePackagesTable packages={data.activePackages} />
        </div>
      )}
    </DashboardLayout>
  );
}
