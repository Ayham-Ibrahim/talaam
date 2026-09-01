import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CalendarClock, Check, X } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ApiErrorList, Avatar, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { usePendingBookingRequests, useApproveBookingRequest, useRejectBookingRequest } from '@/hooks/useBooking';
import { useT } from '@/hooks/useT';
import { formatDate, formatDateTime } from '@/lib/formatters';

function RequestRow({ request, onApprove, onReject, isPending, error }) {
  const t = useT();
  const [reason, setReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar name={request.studentName} src={request.studentAvatar} size="md" />
          <div className="text-right">
            <div className="text-sm font-semibold text-ink">{request.studentName}</div>
            <div className="text-xs text-ink-soft">{request.packageTitle}</div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-sm text-ink">
          {request.requestedSlots.map((slot, i) => (
            <div key={i} className="flex items-center gap-2">
              {request.requestedSlots.length > 1 && (
                <span className="text-xs font-bold text-primary">
                  {t('dashboard.bookingRequests.sessionLabel')} {i + 1}
                </span>
              )}
              {formatDate(slot.date)} · {slot.start_time?.slice(0, 5)}
              <CalendarClock size={16} className="text-ink-soft" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onApprove(request.id)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            <Check size={15} />
            {t('dashboard.bookingRequests.approve')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowRejectForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-[#FF383C] bg-[#FDF0F0] px-4 py-2.5 text-sm text-[#FF383C] hover:bg-[#FF383C]/10 disabled:opacity-50"
          >
            <X size={15} />
            {t('dashboard.bookingRequests.reject')}
          </button>
        </div>
      </div>

      {/* حتى يعرف المعلم لأي باقة ومن الطالب صاحب الطلب دون فتحه — الاسم
          والعنوان وحدهما لا يكفيان عند تراكم عدة طلبات لنفس الباقة أو لنفس
          الطالب في نفس اليوم. */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-ink-soft">
        {request.subject && (
          <span>
            {t('dashboard.bookingRequests.subjectLabel')}: {request.subject}
          </span>
        )}
        <span>
          {t('dashboard.bookingRequests.requestedAtLabel')}: {formatDateTime(request.createdAt)}
        </span>
      </div>

      {/* كان فشل الموافقة/الرفض (تعارض جدول، حالة تغيّرت...) صامتاً تماماً من
          منظور المعلم — الخطأ يصل من الباك اند برسالة عربية واضحة ومحدَّدة
          (راجع ScheduleConflictService) لكن لا شيء كان يعرضها على الشاشة. */}
      {error && (
        <div className="border-t border-line pt-3">
          <ApiErrorList error={error} labelFor={() => null} />
        </div>
      )}

      {showRejectForm && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('dashboard.bookingRequests.reasonPlaceholder')}
            className="min-w-[200px] flex-1 rounded-lg border border-[#E3E3E3] px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => onReject(request.id, reason)}
            className="rounded-xl bg-[#FF383C] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.bookingRequests.confirmReject')}
          </button>
        </div>
      )}
    </div>
  );
}

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
              <RequestRow
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
