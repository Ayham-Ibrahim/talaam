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
import { useDownloadBookingInvoice } from '@/hooks/useBooking';
import { useDownloadEnrollmentInvoice } from '@/hooks/useEnrollment';
import { saveBlob } from '@/lib/download';
import { INVOICE_STATUS_STYLES } from '@/mocks/dashboard.mock';
import { useT } from '@/hooks/useT';

const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { status: '', subject: '', search: '' };

export function InvoicesPage() {
  const t = useT();
  const { user } = useAuth();
  const { data: invoices, isLoading, isError, refetch } = useInvoices();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const downloadBookingInvoice = useDownloadBookingInvoice();
  const downloadEnrollmentInvoice = useDownloadEnrollmentInvoice();

  const handleDownload = async (invoice) => {
    if (invoice.paymentStatus !== 'paid') {
      window.alert(t('dashboard.invoices.notPaidYet'));
      return;
    }
    setDownloadingId(invoice.id);
    try {
      const mutate = invoice.kind === 'enrollment' ? downloadEnrollmentInvoice : downloadBookingInvoice;
      const blob = await mutate.mutateAsync(invoice.recordId);
      saveBlob(blob, `invoice-${invoice.id}.pdf`);
    } catch (err) {
      // بعد إصلاح client.js، الأخطاء الحقيقية (422 "لم يُدفع بعد"، إلخ) تصل
      // الآن بنص عربي واضح من الباك اند — نعرضه بدل النص العام الثابت متى توفّر.
      window.alert(err?.message || t('dashboard.invoices.downloadFailed'));
    } finally {
      setDownloadingId(null);
    }
  };

  const statusOptions = useMemo(
    () => Object.entries(INVOICE_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label })),
    [],
  );

  const subjects = useMemo(() => [...new Set((invoices ?? []).map((invoice) => invoice.subject))], [invoices]);

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    const search = filters.search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (filters.status && invoice.paymentStatus !== filters.status) return false;
      if (filters.subject && invoice.subject !== filters.subject) return false;
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
        <InvoicesFilterBar statuses={statusOptions} subjects={subjects} filters={filters} onChange={handleFilterChange} />

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            image="/fallback_images/no_billings.webp"
            imageClassName="mb-2 h-[300px] w-auto object-contain"
            title={t('dashboard.invoices.emptyTitle')}
            titleClassName="font-cairo text-[32px] font-medium leading-[60px] text-ink"
            hint={t('dashboard.invoices.emptyHint')}
            hintClassName="mt-1 max-w-2xl font-cairo text-xl font-medium leading-[37px] text-[#626262]"
          />
        ) : filteredInvoices.length === 0 ? (
          <EmptyState title={t('dashboard.invoices.empty')} />
        ) : (
          <>
            <InvoicesTable
              invoices={pageInvoices}
              onView={setSelectedInvoice}
              onDownload={handleDownload}
              downloadingId={downloadingId}
            />
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

      <InvoiceDetailsModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDownload={handleDownload}
        isDownloading={selectedInvoice != null && downloadingId === selectedInvoice.id}
      />
    </DashboardLayout>
  );
}
