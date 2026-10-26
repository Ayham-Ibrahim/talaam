import { useState } from 'react';
import { TicketPercent } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { AdminListingsFilterBar } from '@/components/dashboard/admin/AdminListingsFilterBar';
import { AdminListingsTable } from '@/components/dashboard/admin/AdminListingsTable';
import { MultiPackageCouponsModal } from '@/components/dashboard/admin/MultiPackageCouponsModal';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAdminListings } from '@/hooks/useAdminListings';
import { useT } from '@/hooks/useT';

const PAGE_SIZE = 6;
const DEFAULT_FILTERS = { kind: '', status: '', q: '' };

export function AdminListingsPage() {
  const t = useT();
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [showCoupons, setShowCoupons] = useState(false);
  const { data, isLoading, isError, refetch } = useAdminListings(filters);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (!user) return <Navigate to="/login" replace />;

  const listings = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageListings = listings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{t('dashboard.adminListings.title')}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminListings.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCoupons(true)}
            className="flex items-center gap-1.5 rounded-xl border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
          >
            <TicketPercent size={16} />
            {t('dashboard.multiCoupons.open')}
          </button>
        </div>

        <AdminListingsFilterBar filters={filters} onChange={handleFilterChange} />

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState title={t('dashboard.adminListings.empty')} />
        ) : (
          <>
            <AdminListingsTable listings={pageListings} />
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {showCoupons && <MultiPackageCouponsModal onClose={() => setShowCoupons(false)} />}
    </AdminDashboardLayout>
  );
}
