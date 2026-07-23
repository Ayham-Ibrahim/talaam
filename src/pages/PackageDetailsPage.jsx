import { ArrowRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PackageDetailSummary } from '@/components/dashboard/PackageDetailSummary';
import { PackageSpecsRow } from '@/components/dashboard/PackageSpecsRow';
import { PackageSidebarSummary } from '@/components/dashboard/PackageSidebarSummary';
import { PackageRebookBanner } from '@/components/dashboard/PackageRebookBanner';
import { PackageSessionsList } from '@/components/dashboard/PackageSessionsList';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { usePackageDetails } from '@/hooks/useDashboard';
import { useT } from '@/hooks/useT';

export function PackageDetailsPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = usePackageDetails(id);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center justify-end gap-2 text-sm">
        <span className="font-bold text-ink">{t('dashboard.myPackages.detailsTitle')}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <Link to="/dashboard/student/packages" className="font-bold text-primary hover:underline">
          {t('dashboard.nav.packages')}
        </Link>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : !data?.package ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Link
              to="/dashboard/student/packages"
              aria-label="رجوع"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover"
            >
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 flex-col gap-4">
              <PackageDetailSummary pkg={data.package} />
              <PackageSpecsRow pkg={data.package} />
              {data.package.remainingSessions > 0 && data.package.remainingSessions <= 2 && <PackageRebookBanner />}
              <PackageSessionsList sessions={data.sessions} showType={false} />
            </div>

            <div className="w-full shrink-0 lg:w-[300px]">
              <PackageSidebarSummary pkg={data.package} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
