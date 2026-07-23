import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { TaxonomyTypeTabs } from '@/components/dashboard/admin/TaxonomyTypeTabs';
import { TaxonomyTable } from '@/components/dashboard/admin/TaxonomyTable';
import { TaxonomyFormModal } from '@/components/dashboard/admin/TaxonomyFormModal';
import { ConfirmModal } from '@/components/dashboard/admin/ConfirmModal';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTaxonomyItems, useCreateTaxonomyItem, useUpdateTaxonomyItem, useDeleteTaxonomyItem } from '@/hooks/useAdminTaxonomy';
import { TAXONOMY_TYPES } from '@/mocks/adminTaxonomy.mock';
import { useT } from '@/hooks/useT';

export function AdminTaxonomyPage() {
  const t = useT();
  const { user } = useAuth();
  const [activeType, setActiveType] = useState(TAXONOMY_TYPES[0].key);
  const [formItem, setFormItem] = useState(undefined); // undefined = closed, null = add, object = edit
  const [deleteItem, setDeleteItem] = useState(null);

  const typeConfig = TAXONOMY_TYPES.find((tp) => tp.key === activeType);
  const { data: items, isLoading, isError, refetch } = useTaxonomyItems(activeType);

  const createItem = useCreateTaxonomyItem(activeType);
  const updateItem = useUpdateTaxonomyItem(activeType);
  const deleteItemMutation = useDeleteTaxonomyItem(activeType);
  const isActing = createItem.isPending || updateItem.isPending;

  if (!user) return <Navigate to="/login" replace />;

  const handleSave = (payload) => {
    if (formItem) {
      updateItem.mutate({ id: formItem.id, payload }, { onSuccess: () => setFormItem(undefined) });
    } else {
      createItem.mutate(payload, { onSuccess: () => setFormItem(undefined) });
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{t('dashboard.adminTaxonomy.title')}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminTaxonomy.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => setFormItem(null)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus size={16} />
            {t('dashboard.adminTaxonomy.addTitle')}
          </button>
        </div>

        <TaxonomyTypeTabs active={activeType} onChange={setActiveType} />

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title={t('dashboard.adminTaxonomy.empty')} />
        ) : (
          <TaxonomyTable items={items} typeConfig={typeConfig} onEdit={setFormItem} onDelete={setDeleteItem} />
        )}
      </div>

      {formItem !== undefined && (
        <TaxonomyFormModal
          typeConfig={typeConfig}
          item={formItem}
          isPending={isActing}
          onSave={handleSave}
          onClose={() => setFormItem(undefined)}
        />
      )}

      {deleteItem && (
        <ConfirmModal
          title={t('dashboard.adminTaxonomy.deleteTitle')}
          message={deleteItem.name_ar}
          confirmLabel={t('dashboard.adminTaxonomy.delete')}
          cancelLabel={t('dashboard.adminTaxonomy.cancel')}
          isPending={deleteItemMutation.isPending}
          onConfirm={() => deleteItemMutation.mutate(deleteItem.id, { onSuccess: () => setDeleteItem(null) })}
          onClose={() => setDeleteItem(null)}
        />
      )}
    </AdminDashboardLayout>
  );
}
