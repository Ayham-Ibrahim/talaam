import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { AdminAcademicSupportersFilterBar } from '@/components/dashboard/admin/AdminAcademicSupportersFilterBar';
import { AdminAcademicSupportersTable } from '@/components/dashboard/admin/AdminAcademicSupportersTable';
import { AddAcademicSupporterAccountModal } from '@/components/dashboard/admin/AddAcademicSupporterAccountModal';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAcademicSupporters } from '@/hooks/useAcademicSupporters';
import { useT } from '@/hooks/useT';

const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { status: '', search: '' };

export function AdminAcademicSupportersPage() {
  const t = useT();
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { data, isLoading, isError, refetch } = useAdminAcademicSupporters({ ...filters, page, per_page: PAGE_SIZE });

  const handleAddSuccess = () => {
    setSuccessMessage(t('dashboard.adminAcademicSupporters.addSuccess'));
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (!user) return <Navigate to="/login" replace />;

  const supporters = data?.data ?? [];
  const totalPages = data?.lastPage ?? 1;
  const currentPage = data?.currentPage ?? page;

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{t('dashboard.adminAcademicSupporters.title')}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminAcademicSupporters.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus size={16} />
            {t('dashboard.adminAcademicSupporters.addSupporter')}
          </button>
        </div>

        {successMessage && (
          <div className="rounded-2xl bg-success-light px-4 py-3 text-sm font-medium text-success">{successMessage}</div>
        )}

        <AdminAcademicSupportersFilterBar filters={filters} onChange={handleFilterChange} />

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : supporters.length === 0 ? (
          <EmptyState title={t('dashboard.adminAcademicSupporters.empty')} />
        ) : (
          <>
            <AdminAcademicSupportersTable supporters={supporters} />
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {showAddModal && (
        <AddAcademicSupporterAccountModal onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} />
      )}
    </AdminDashboardLayout>
  );
}
