import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { NotificationLogsTable } from '@/components/dashboard/admin/NotificationLogsTable';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAdminNotificationLogs } from '@/hooks/useAdminNotificationLogs';
import { NOTIFICATION_LOG_STATUS_STYLES } from '@/mocks/adminNotificationLogs.mock';
import { useT } from '@/hooks/useT';

/**
 * قبل هذه الصفحة: لا طريقة للأدمن ليعرف أن بريد ترحيب طالب/معلم مستورَد فشل
 * فعلاً في الوصول (مثال حقيقي حصل: رفض SMTP الإرسال بسبب دومين From غير
 * موثّق) — الوحيدة المتاحة كانت انتظار شكوى المستخدم نفسه.
 */
export function AdminNotificationLogsPage() {
  const t = useT();
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useAdminNotificationLogs({ status, search: search || undefined });

  if (!user) return <Navigate to="/login" replace />;

  const logs = data?.data ?? [];

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('dashboard.adminNotificationLogs.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminNotificationLogs.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('dashboard.adminNotificationLogs.searchPlaceholder')}
            className="w-full max-w-xs rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <SmoothSelect
            className="max-w-xs"
            value={status}
            onChange={setStatus}
            placeholder={t('dashboard.adminNotificationLogs.allStatuses')}
            options={[
              { value: '', label: t('dashboard.adminNotificationLogs.allStatuses') },
              ...Object.entries(NOTIFICATION_LOG_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label })),
            ]}
          />
        </div>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState title={t('dashboard.adminNotificationLogs.empty')} />
        ) : (
          <NotificationLogsTable logs={logs} />
        )}
      </div>
    </AdminDashboardLayout>
  );
}
