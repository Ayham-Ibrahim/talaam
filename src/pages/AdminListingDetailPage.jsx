import { useState } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { ListingDetailsCard } from '@/components/dashboard/admin/ListingDetailsCard';
import { ListingApprovalPanel } from '@/components/dashboard/admin/ListingApprovalPanel';
import { ReasonModal } from '@/components/dashboard/admin/ReasonModal';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAdminListingDetail, useApproveListing, useRejectListing, useDisableListing } from '@/hooks/useAdminListings';
import { useT } from '@/hooks/useT';

export function AdminListingDetailPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const { data: listing, isLoading, isError, refetch } = useAdminListingDetail(id);
  const [modal, setModal] = useState(null); // 'reject' | 'disable'

  const approveListing = useApproveListing(id);
  const rejectListing = useRejectListing(id);
  const disableListing = useDisableListing(id);

  const isActing = approveListing.isPending || rejectListing.isPending || disableListing.isPending;

  if (!user) return <Navigate to="/login" replace />;

  const handleModalConfirm = (reason) => {
    if (modal === 'reject') {
      rejectListing.mutate({ listingId: id, reason }, { onSuccess: () => setModal(null) });
    } else if (modal === 'disable') {
      disableListing.mutate({ listingId: id, reason }, { onSuccess: () => setModal(null) });
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="mb-4 flex justify-end">
        <Link to="/dashboard/admin/listings" className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-primary">
          {t('dashboard.adminListingDetail.back')}
          <ArrowRight size={15} />
        </Link>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      ) : !listing ? (
        <ErrorState message={t('dashboard.adminListingDetail.notFound')} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ListingDetailsCard listing={listing} />
          <ListingApprovalPanel
            listing={listing}
            isActing={isActing}
            actions={{
              onApprove: (marginPercent) => approveListing.mutate({ listingId: id, marginPercent }),
              onReject: () => setModal('reject'),
              onDisable: () => setModal('disable'),
            }}
          />
        </div>
      )}

      {modal && (
        <ReasonModal
          titleKey={modal === 'reject' ? 'rejectListingTitle' : 'disableListingTitle'}
          isPending={isActing}
          onConfirm={handleModalConfirm}
          onClose={() => setModal(null)}
        />
      )}
    </AdminDashboardLayout>
  );
}
