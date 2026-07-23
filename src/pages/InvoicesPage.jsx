import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { InvoicesFilterBar } from '@/components/dashboard/InvoicesFilterBar';
import { InvoicesTable } from '@/components/dashboard/InvoicesTable';
import { InvoiceDetailsModal } from '@/components/dashboard/InvoiceDetailsModal';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useInvoices } from '@/hooks/useDashboard';
import { INVOICE_STATUS_STYLES } from '@/mocks/dashboard.mock';
import { useT } from '@/hooks/useT';

const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { status: '', date: '', search: '' };

function toIsoDate(ddmmyyyy) {
  const [d, m, y] = ddmmyyyy.split('/');
  return `${y}-${m}-${d}`;
}

export function InvoicesPage() {
  const t = useT();
  const { user } = useAuth();
  const { data: invoices, isLoading, isError, refetch } = useInvoices();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const statusOptions = useMemo(
    () => Object.entries(INVOICE_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label })),
    [],
  );

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    const search = filters.search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (filters.status && invoice.paymentStatus !== filters.status) return false;
      if (filters.date && toIsoDate(invoice.issueDate) !== filters.date) return false;
      if (search && !`${invoice.id} ${invoice.teacherName} ${invoice.packageTitle}`.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    });
  }, [invoices, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageInvoices = filteredInvoices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <InvoicesFilterBar statuses={statusOptions} filters={filters} onChange={handleFilterChange} />

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState icon={Receipt} title={t('dashboard.invoices.emptyTitle')} hint={t('dashboard.invoices.emptyHint')} />
        ) : filteredInvoices.length === 0 ? (
          <EmptyState title={t('dashboard.invoices.empty')} />
        ) : (
          <>
            <InvoicesTable invoices={pageInvoices} onView={setSelectedInvoice} onDownload={() => {}} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
              <span className="text-sm text-ink-soft">
                {t('dashboard.invoices.showingPrefix')} {(currentPage - 1) * PAGE_SIZE + 1} -{' '}
                {Math.min(currentPage * PAGE_SIZE, filteredInvoices.length)} {t('dashboard.invoices.showingOf')}{' '}
                {filteredInvoices.length} {t('dashboard.invoices.unit')}
              </span>
            </div>
          </>
        )}
      </div>

      <InvoiceDetailsModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </DashboardLayout>
  );
}
