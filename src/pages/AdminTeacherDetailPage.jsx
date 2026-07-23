import { useState } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { TeacherProfileSummaryCard } from '@/components/dashboard/admin/TeacherProfileSummaryCard';
import { VerificationDocumentsList } from '@/components/dashboard/admin/VerificationDocumentsList';
import { TeacherBadgesPanel } from '@/components/dashboard/admin/TeacherBadgesPanel';
import { ReasonModal } from '@/components/dashboard/admin/ReasonModal';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminTeacherDetail,
  useApproveTeacher,
  useRejectTeacher,
  useSuspendTeacher,
  useReactivateTeacher,
  useApproveDocument,
  useRejectDocument,
  useGrantBadge,
  useRevokeBadge,
} from '@/hooks/useAdmin';
import { useT } from '@/hooks/useT';

export function AdminTeacherDetailPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useAdminTeacherDetail(id);
  const [modal, setModal] = useState(null); // { type: 'rejectTeacher' | 'suspendTeacher' | 'rejectDocument', documentId? }

  const approveTeacher = useApproveTeacher(id);
  const rejectTeacher = useRejectTeacher(id);
  const suspendTeacher = useSuspendTeacher(id);
  const reactivateTeacher = useReactivateTeacher(id);
  const approveDocument = useApproveDocument(id);
  const rejectDocument = useRejectDocument(id);
  const grantBadge = useGrantBadge(id);
  const revokeBadge = useRevokeBadge(id);

  const isActing =
    approveTeacher.isPending ||
    rejectTeacher.isPending ||
    suspendTeacher.isPending ||
    reactivateTeacher.isPending ||
    approveDocument.isPending ||
    rejectDocument.isPending ||
    grantBadge.isPending ||
    revokeBadge.isPending;

  if (!user) return <Navigate to="/login" replace />;

  const handleModalConfirm = (reason) => {
    if (modal?.type === 'rejectTeacher') {
      rejectTeacher.mutate({ teacherId: id, reason }, { onSuccess: () => setModal(null) });
    } else if (modal?.type === 'suspendTeacher') {
      suspendTeacher.mutate({ teacherId: id, reason }, { onSuccess: () => setModal(null) });
    } else if (modal?.type === 'rejectDocument') {
      rejectDocument.mutate(
        { documentId: modal.documentId, reason },
        { onSuccess: () => setModal(null) }
      );
    }
  };

  const modalTitleKey =
    modal?.type === 'rejectTeacher'
      ? 'rejectTeacherTitle'
      : modal?.type === 'suspendTeacher'
        ? 'suspendTeacherTitle'
        : 'rejectDocumentTitle';

  return (
    <AdminDashboardLayout>
      <div className="mb-4 flex justify-end">
        <Link to="/dashboard/admin/teachers" className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-primary">
          {t('dashboard.adminTeacherDetail.back')}
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
      ) : !data?.teacher ? (
        <ErrorState message={t('dashboard.adminTeacherDetail.notFound')} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
          <div className="flex flex-col gap-6">
            <TeacherProfileSummaryCard
              teacher={data.teacher}
              isActing={isActing}
              actions={{
                onApprove: () => approveTeacher.mutate(id),
                onReject: () => setModal({ type: 'rejectTeacher' }),
                onSuspend: () => setModal({ type: 'suspendTeacher' }),
                onReactivate: () => reactivateTeacher.mutate(id),
              }}
            />
            <TeacherBadgesPanel
              awards={data.badgeAwards}
              catalog={data.badgeCatalog}
              isActing={isActing}
              onGrant={(badgeId) => grantBadge.mutate(badgeId)}
              onRevoke={(awardId) => revokeBadge.mutate(awardId)}
            />
          </div>

          <div>
            <h3 className="mb-3 text-right text-base font-bold text-ink">{t('dashboard.adminTeacherDetail.documentsTitle')}</h3>
            <VerificationDocumentsList
              documents={data.documents}
              isActing={isActing}
              onApprove={(documentId) => approveDocument.mutate(documentId)}
              onReject={(documentId) => setModal({ type: 'rejectDocument', documentId })}
            />
          </div>
        </div>
      )}

      {modal && (
        <ReasonModal
          titleKey={modalTitleKey}
          isPending={isActing}
          onConfirm={handleModalConfirm}
          onClose={() => setModal(null)}
        />
      )}
    </AdminDashboardLayout>
  );
}
