import { Navigate } from 'react-router-dom';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { AdminSessionsPanel } from '@/components/dashboard/admin/AdminSessionsPanel';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';

/** صفحة "الجلسات": كل جلسات المنصة للأدمن — نفس جدول ملف المعلم/الطالب بلا تقييد بطرف بعينه */
export function AdminSessionsPage() {
  const t = useT();
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('dashboard.adminSessions.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminSessions.subtitle')}</p>
        </div>

        <AdminSessionsPanel all />
      </div>
    </AdminDashboardLayout>
  );
}
