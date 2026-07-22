import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PackageFilterTabs } from "@/components/dashboard/PackageFilterTabs";
import { PackageListCard } from "@/components/dashboard/PackageListCard";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { usePackagesList } from "@/hooks/useDashboard";
import { useT } from "@/hooks/useT";

export function PackagesPage() {
  const t = useT();
  const { user } = useAuth();
  const { data: packages, isLoading, isError, refetch } = usePackagesList();
  const [activeTab, setActiveTab] = useState("all");

  const filteredPackages = useMemo(() => {
    if (!packages) return [];
    if (activeTab === "all") return packages;
    return packages.filter((pkg) => pkg.status === activeTab);
  }, [packages, activeTab]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <PackageFilterTabs active={activeTab} onChange={setActiveTab} />

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[340px] rounded-2xl" />
            ))}
          </div>
        ) : filteredPackages.length === 0 ? (
          <EmptyState title={t("dashboard.myPackages.empty")} />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredPackages.map((pkg) => (
              <PackageListCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
