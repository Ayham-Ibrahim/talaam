import { useState } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, KeyRound } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { AdminStudentProfileEditor } from '@/components/dashboard/admin/AdminStudentProfileEditor';
import { ChangeStudentPasswordModal } from '@/components/dashboard/admin/ChangeStudentPasswordModal';
import { Avatar, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStudentDetail } from '@/hooks/useAdminStudents';
import { useT } from '@/hooks/useT';

/**
 * يوازي AdminTeacherDetailPage تماماً لكن أبسط بكثير — لا توثيق ولا وثائق
 * ولا شارات، فقط ملخّص الحساب + إكمال/تعديل الملف الأكاديمي نيابة عن الطالب.
 */
export function AdminStudentDetailPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const { data: student, isLoading, isError, refetch } = useAdminStudentDetail(id);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <AdminDashboardLayout>
      <div className="mb-4 flex justify-end">
        <Link to="/dashboard/admin/students" className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-primary">
          {t('dashboard.adminStudentDetail.back')}
          <ArrowRight size={15} />
        </Link>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : !student ? (
        <ErrorState message={t('dashboard.adminStudentDetail.notFound')} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-card sm:flex-row">
            <div className="flex items-center gap-3">
              <Avatar name={student.name} src={student.avatar_path} size="lg" />
              <div className="text-right">
                <div className="text-base font-bold text-ink">{student.name}</div>
                <div className="text-sm text-ink-soft" dir="ltr">{student.email}</div>
                {student.phone && (
                  <div className="text-sm text-ink-soft" dir="ltr">{student.phone}</div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary-light"
            >
              <KeyRound size={16} />
              {t('dashboard.adminStudents.changePassword')}
            </button>
          </div>

          <AdminStudentProfileEditor studentId={id} student={student} />
        </div>
      )}

      {showPasswordModal && student && (
        <ChangeStudentPasswordModal student={student} onClose={() => setShowPasswordModal(false)} />
      )}
    </AdminDashboardLayout>
  );
}
