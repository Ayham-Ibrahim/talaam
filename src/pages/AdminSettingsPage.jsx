import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { SettingsCategorySection } from '@/components/dashboard/admin/SettingsCategorySection';
import { AuditLogTable } from '@/components/dashboard/admin/AuditLogTable';
import { AdminReviewsTable } from '@/components/dashboard/admin/AdminReviewsTable';
import { ReasonModal } from '@/components/dashboard/admin/ReasonModal';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminSettings,
  useUpdateSetting,
  useAdminAuditLog,
  useAdminReviews,
  useHideReview,
  useUnhideReview,
} from '@/hooks/useAdminSettings';
import { SETTINGS_CATEGORY_LABELS } from '@/mocks/adminSettings.mock';
import { AUDIT_ACTION_LABELS } from '@/mocks/adminAuditLog.mock';
import { useT } from '@/hooks/useT';

const TABS = [
  { key: 'settings', labelKey: 'tabSettings' },
  { key: 'auditLog', labelKey: 'tabAuditLog' },
  { key: 'reviews', labelKey: 'tabReviews' },
];

export function AdminSettingsPage() {
  const t = useT();
  const { user } = useAuth();
  const [tab, setTab] = useState('settings');
  const [auditAction, setAuditAction] = useState('');
  const [reviewsVisibility, setReviewsVisibility] = useState('');
  const [hideTarget, setHideTarget] = useState(null);

  const settingsQuery = useAdminSettings();
  const updateSetting = useUpdateSetting();

  const auditLogQuery = useAdminAuditLog({ action: auditAction });
  const reviewsQuery = useAdminReviews({ visibility: reviewsVisibility });
  const hideReview = useHideReview();
  const unhideReview = useUnhideReview();

  const groupedSettings = useMemo(() => {
    if (!settingsQuery.data) return {};
    return settingsQuery.data.reduce((acc, setting) => {
      (acc[setting.category] ??= []).push(setting);
      return acc;
    }, {});
  }, [settingsQuery.data]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('dashboard.adminSettings.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminSettings.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={`rounded-2xl px-6 py-3 text-sm font-bold transition-colors ${
                tab === tabItem.key ? 'bg-primary text-white' : 'border border-line bg-white text-ink hover:bg-line/30'
              }`}
            >
              {t(`dashboard.adminSettings.${tabItem.labelKey}`)}
            </button>
          ))}
        </div>

        {tab === 'settings' &&
          (settingsQuery.isError ? (
            <ErrorState onRetry={settingsQuery.refetch} />
          ) : settingsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(groupedSettings).map(([category, settings]) => (
                <SettingsCategorySection
                  key={category}
                  title={SETTINGS_CATEGORY_LABELS[category] ?? category}
                  settings={settings}
                  isPending={updateSetting.isPending}
                  onSave={(key, value) => updateSetting.mutate({ key, value })}
                />
              ))}
            </div>
          ))}

        {tab === 'auditLog' && (
          <div className="flex flex-col gap-4">
            <SmoothSelect
              className="min-w-[220px] max-w-xs"
              value={auditAction}
              onChange={setAuditAction}
              placeholder={t('dashboard.adminAuditLog.allActions')}
              options={Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => ({ value, label }))}
            />

            {auditLogQuery.isError ? (
              <ErrorState onRetry={auditLogQuery.refetch} />
            ) : auditLogQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-2xl" />
                ))}
              </div>
            ) : (auditLogQuery.data?.data ?? []).length === 0 ? (
              <EmptyState title={t('dashboard.adminAuditLog.empty')} />
            ) : (
              <AuditLogTable entries={auditLogQuery.data.data} />
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="flex flex-col gap-4">
            <SmoothSelect
              className="min-w-[220px] max-w-xs"
              value={reviewsVisibility}
              onChange={setReviewsVisibility}
              placeholder={t('dashboard.adminReviews.allReviews')}
              options={[
                { value: 'visible', label: t('dashboard.adminReviews.visibleOnly') },
                { value: 'hidden', label: t('dashboard.adminReviews.hiddenOnly') },
              ]}
            />

            {reviewsQuery.isError ? (
              <ErrorState onRetry={reviewsQuery.refetch} />
            ) : reviewsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
            ) : (reviewsQuery.data?.data ?? []).length === 0 ? (
              <EmptyState title={t('dashboard.adminReviews.empty')} />
            ) : (
              <AdminReviewsTable
                reviews={reviewsQuery.data.data}
                isActing={hideReview.isPending || unhideReview.isPending}
                onHide={(review) => setHideTarget(review)}
                onUnhide={(id) => unhideReview.mutate(id)}
              />
            )}
          </div>
        )}
      </div>

      {hideTarget && (
        <ReasonModal
          titleKey="hideReviewTitle"
          isPending={hideReview.isPending}
          onClose={() => setHideTarget(null)}
          onConfirm={(reason) => hideReview.mutate({ id: hideTarget.id, reason }, { onSuccess: () => setHideTarget(null) })}
        />
      )}
    </AdminDashboardLayout>
  );
}
