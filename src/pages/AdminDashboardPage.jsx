import { Navigate } from 'react-router-dom';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { AdminStatsGrid } from '@/components/dashboard/admin/AdminStatsGrid';
import { PendingVerificationsCard } from '@/components/dashboard/admin/PendingVerificationsCard';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAdminOverview } from '@/hooks/useAdmin';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useAdminOverview();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <AdminDashboardLayout>
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-6" dir="rtl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <AdminStatsGrid stats={data.stats} />
          <PendingVerificationsCard teachers={data.pendingVerifications} />
        </div>
      )}
    </AdminDashboardLayout>
  );
}
