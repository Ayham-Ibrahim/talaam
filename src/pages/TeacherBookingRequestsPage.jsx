import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { BookingRequestRow } from '@/components/dashboard/BookingRequestRow';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { PolicyNotice } from '@/components/common/PolicyNotice';
import { useAuth } from '@/hooks/useAuth';
import { usePendingBookingRequests, useApproveBookingRequest, useRejectBookingRequest } from '@/hooks/useBooking';
import { useT } from '@/hooks/useT';

export function TeacherBookingRequestsPage() {
  const t = useT();
  const { user } = useAuth();
  const { data: requests, isLoading, isError, refetch } = usePendingBookingRequests();
  const approve = useApproveBookingRequest();
  const reject = useRejectBookingRequest();
  // أي طلب هو صاحب آخر محاولة موافقة/رفض — يُستخدم لعرض خطأ الفشل (إن وُجد)
  // على صفّه هو تحديداً بدل تجاهله تماماً أو خلطه بصفوف أخرى.
  const [activeRequestId, setActiveRequestId] = useState(null);

  if (!user) return <Navigate to="/login" replace />;
  if (user.teacherType === 'training_center') return <Navigate to="/dashboard/teacher" replace />;

  const handleApprove = (id) => {
    setActiveRequestId(id);
    approve.mutate(id);
  };

  const handleReject = (id, reason) => {
    setActiveRequestId(id);
    reject.mutate({ bookingId: id, reason: reason || undefined });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-ink">{t('dashboard.bookingRequests.title')}</h2>

        <PolicyNotice policySlug="teacher-policy">{t('policyNotice.bookingRequests')}</PolicyNotice>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : !requests || requests.length === 0 ? (
          <EmptyState title={t('dashboard.bookingRequests.empty')} />
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((request) => (
              <BookingRequestRow
                key={request.id}
                request={request}
                isPending={(approve.isPending || reject.isPending) && activeRequestId === request.id}
                error={activeRequestId === request.id ? (approve.error ?? reject.error) : null}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
