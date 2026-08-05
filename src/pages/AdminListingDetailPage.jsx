import { useState } from 'react';
import { Navigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { ListingDetailsCard } from '@/components/dashboard/admin/ListingDetailsCard';
import { ListingApprovalPanel } from '@/components/dashboard/admin/ListingApprovalPanel';
import { ReasonModal } from '@/components/dashboard/admin/ReasonModal';
import { ManualBookingModal } from '@/components/dashboard/admin/ManualBookingModal';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminListingDetail,
  useApproveListing,
  useRejectListing,
  useDisableListing,
  useCreateManualBooking,
  useCreateManualEnrollment,
} from '@/hooks/useAdminListings';
import { useT } from '@/hooks/useT';

export function AdminListingDetailPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const kind = searchParams.get('kind');
  const { data: listing, isLoading, isError, refetch } = useAdminListingDetail(id, kind);
  const [modal, setModal] = useState(null); // 'reject' | 'disable'
  const [manualBookingOpen, setManualBookingOpen] = useState(false);
  const [manualBookingResult, setManualBookingResult] = useState(null);

  const approveListing = useApproveListing(id, kind);
  const rejectListing = useRejectListing(id, kind);
  const disableListing = useDisableListing(id, kind);
  const createManualBooking = useCreateManualBooking();
  const createManualEnrollment = useCreateManualEnrollment();

  const isActing = approveListing.isPending || rejectListing.isPending || disableListing.isPending;
  const isBooking = createManualBooking.isPending || createManualEnrollment.isPending;

  if (!user) return <Navigate to="/login" replace />;

  const handleModalConfirm = (reason) => {
    if (modal === 'reject') {
      rejectListing.mutate({ listingId: id, reason }, { onSuccess: () => setModal(null) });
    } else if (modal === 'disable') {
      disableListing.mutate({ listingId: id, reason }, { onSuccess: () => setModal(null) });
    }
  };

  const handleManualBookingConfirm = ({ studentId, reason }) => {
    const payload = { student_id: studentId, reason };
    const mutation = listing.kind === 'course' ? createManualEnrollment : createManualBooking;
    const args =
      listing.kind === 'course' ? { courseId: id, payload } : { packageId: id, payload };

    mutation.mutate(args, {
      onSuccess: () => {
        setManualBookingOpen(false);
        setManualBookingResult(t('dashboard.adminManualBooking.success'));
      },
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/dashboard/admin/listings" className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-primary">
          {t('dashboard.adminListingDetail.back')}
          <ArrowRight size={15} />
        </Link>

        {listing?.status === 'active' && (
          <button
            type="button"
            onClick={() => {
              setManualBookingResult(null);
              setManualBookingOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
          >
            <UserPlus size={16} />
            {t('dashboard.adminManualBooking.button')}
          </button>
        )}
      </div>

      {manualBookingResult && (
        <div className="mb-4 rounded-2xl bg-success-light px-4 py-3 text-sm font-medium text-success">{manualBookingResult}</div>
      )}

      {!kind ? (
        <ErrorState message={t('dashboard.adminListingDetail.notFound')} />
      ) : isError ? (
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

      {manualBookingOpen && (
        <ManualBookingModal
          isPending={isBooking}
          onConfirm={handleManualBookingConfirm}
          onClose={() => setManualBookingOpen(false)}
        />
      )}
    </AdminDashboardLayout>
  );
}
