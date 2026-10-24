import { useState } from 'react';
import { Pencil, Ticket } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';
import { ReasonModal } from './ReasonModal';
import { SupportPackageCouponsModal } from './SupportPackageCouponsModal';
import { EditSupportPackageModal } from './EditSupportPackageModal';
import {
  useAdminApproveSupportPackage,
  useAdminRejectSupportPackage,
  useAdminDisableSupportPackage,
  useAdminEnableSupportPackage,
} from '@/hooks/useAcademicSupporters';
import { useT } from '@/hooks/useT';

const STATUS_STYLES = {
  pending_approval: { bg: '#FEF3E2', color: '#B7791F' },
  active: { bg: '#E3F5EC', color: '#2E9E6B' },
  rejected: { bg: '#FDEFF2', color: '#B00852' },
  disabled: { bg: '#F2F2F7', color: '#6B7280' },
};

/**
 * باقات الدعم الطلابي الخاصة بهذا الداعم — تُدار من هنا حصراً (بعكس Phase 1
 * التي كانت تظهر في صفحة Listings العامة). بلا هامش منصة إطلاقاً (سعر ثابت
 * حسب الفئة)، فالموافقة هنا فعل حالة بسيط بلا إدخال نسبة.
 */
export function SupportPackagesApprovalPanel({ supporterId, supportPackages = [] }) {
  const t = useT();
  const [rejectingId, setRejectingId] = useState(null);
  const [couponsPackage, setCouponsPackage] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const approve = useAdminApproveSupportPackage(supporterId);
  const reject = useAdminRejectSupportPackage(supporterId);
  const disable = useAdminDisableSupportPackage(supporterId);
  const enable = useAdminEnableSupportPackage(supporterId);

  const isActing = approve.isPending || reject.isPending || disable.isPending || enable.isPending;

  if (!supportPackages.length) {
    return <p className="text-sm text-ink-soft">{t('dashboard.adminAcademicSupporterDetail.noPackages')}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {supportPackages.map((sp) => {
        const style = STATUS_STYLES[sp.status] ?? STATUS_STYLES.disabled;
        return (
          <div key={sp.id} className="rounded-2xl border border-line/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-right">
                <div className="font-bold text-ink">{sp.title}</div>
                <div className="text-xs text-ink-soft">
                  {t(`dashboard.addSupportPackage.tier${sp.tier === 'premium' ? 'Premium' : 'Basic'}`)}
                  {' · '}
                  {(sp.subjects ?? []).map((s) => s.name).join('، ') || '—'}
                </div>
                <div className="text-sm text-price">{formatPrice(sp.studentPrice, sp.currency)}</div>
              </div>
              <span className="rounded-pill px-3 py-1 text-xs font-bold" style={{ background: style.bg, color: style.color }}>
                {t(`dashboard.teacherSupportPackages.statuses.${sp.status}`)}
              </span>
            </div>

            {sp.description && <p className="mt-2 text-sm text-ink-soft">{sp.description}</p>}
            {sp.rejectionReason && (
              <p className="mt-2 text-xs text-accent-pink">{t('dashboard.adminListingDetail.rejectionReason')}: {sp.rejectionReason}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setEditingPackage(sp)}
                className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-xs font-medium text-ink-soft hover:bg-line/30"
              >
                <Pencil size={14} />
                {t('dashboard.addSupportPackage.edit')}
              </button>
              {sp.status === 'pending_approval' && (
                <>
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => approve.mutate(sp.id)}
                    className="rounded-xl bg-success px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {t('dashboard.adminListingDetail.approve')}
                  </button>
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => setRejectingId(sp.id)}
                    className="rounded-xl border border-accent-pink px-4 py-2 text-xs font-medium text-accent-pink hover:bg-accent-pink/5 disabled:opacity-50"
                  >
                    {t('dashboard.adminListingDetail.reject')}
                  </button>
                </>
              )}
              {sp.status === 'active' && (
                <>
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => disable.mutate(sp.id)}
                    className="rounded-xl border border-line px-4 py-2 text-xs font-medium text-ink-soft hover:bg-line/30 disabled:opacity-50"
                  >
                    {t('dashboard.adminListingDetail.disable')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCouponsPackage(sp)}
                    className="flex items-center gap-1.5 rounded-xl border border-primary px-4 py-2 text-xs font-medium text-primary hover:bg-primary/5"
                  >
                    <Ticket size={14} />
                    {t('dashboard.coupons.title')}
                  </button>
                </>
              )}
              {sp.status === 'disabled' && (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => enable.mutate(sp.id)}
                  className="rounded-xl bg-success px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {t('dashboard.adminListingDetail.enable')}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {rejectingId && (
        <ReasonModal
          titleKey="rejectTeacherTitle"
          isPending={reject.isPending}
          error={reject.isError ? reject.error : null}
          onConfirm={(reason) => reject.mutate({ id: rejectingId, reason }, { onSuccess: () => setRejectingId(null) })}
          onClose={() => setRejectingId(null)}
        />
      )}

      {couponsPackage && (
        <SupportPackageCouponsModal
          supportPackageId={couponsPackage.id}
          packageTitle={couponsPackage.title}
          onClose={() => setCouponsPackage(null)}
        />
      )}

      {editingPackage && (
        <EditSupportPackageModal
          supporterId={supporterId}
          supportPackage={editingPackage}
          onClose={() => setEditingPackage(null)}
        />
      )}
    </div>
  );
}
