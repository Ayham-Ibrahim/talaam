import { useState } from 'react';
import { calculateStudentPrice, DEFAULT_MARGIN_PERCENT } from '@/lib/pricing';
import { formatPrice } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function ListingApprovalPanel({ listing, actions, isActing }) {
  const t = useT();
  const [margin, setMargin] = useState(String(listing.marginPercent ?? DEFAULT_MARGIN_PERCENT));
  const [touched, setTouched] = useState(false);

  const marginNumber = Number(margin);
  const isValidMargin = margin.trim() !== '' && Number.isFinite(marginNumber) && marginNumber >= 0;
  const preview = isValidMargin ? calculateStudentPrice(listing.teacherPrice, marginNumber) : null;

  const handleApprove = () => {
    setTouched(true);
    if (!isValidMargin) return;
    actions.onApprove(marginNumber);
  };

  return (
    <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:p-6">
      <h3 className="text-right text-base font-bold text-ink">{t('dashboard.adminListingDetail.pricingTitle')}</h3>

      <div className="mt-4 flex items-center justify-between border-b border-line/60 pb-3">
        <span className="text-sm font-semibold text-ink">{formatPrice(listing.teacherPrice)}</span>
        <span className="text-sm text-ink-soft">{t('dashboard.adminListingDetail.teacherPrice')}</span>
      </div>

      <label className="mt-4 flex flex-col gap-1.5 text-right">
        <span className="text-sm font-semibold text-ink">{t('dashboard.adminListingDetail.marginLabel')}</span>
        <input
          type="number"
          min="0"
          step="0.5"
          dir="ltr"
          value={margin}
          onChange={(e) => setMargin(e.target.value)}
          className={`w-full rounded-btn border bg-surface p-3 text-left text-sm text-ink focus:outline-none focus:ring-2 ${
            touched && !isValidMargin ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
          }`}
        />
        {touched && !isValidMargin && <span className="text-xs text-accent-pink">{t('dashboard.adminListingDetail.marginRequired')}</span>}
      </label>

      {preview && (
        <div className="mt-4 flex flex-col gap-2 rounded-xl bg-[#FAFBFD] p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-price">{formatPrice(preview.studentPrice)}</span>
            <span className="text-sm text-ink-soft">{t('dashboard.adminListingDetail.studentPrice')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-success">{formatPrice(preview.platformRevenue)}</span>
            <span className="text-sm text-ink-soft">{t('dashboard.adminListingDetail.platformRevenue')}</span>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isActing}
          onClick={handleApprove}
          className="flex-1 rounded-xl bg-success py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {t('dashboard.adminListingDetail.approve')}
        </button>

        {listing.status === 'submitted' && (
          <button
            type="button"
            disabled={isActing}
            onClick={actions.onReject}
            className="flex-1 rounded-xl border border-accent-pink py-3 text-sm font-medium text-accent-pink transition-colors hover:bg-accent-pink/5 disabled:opacity-50"
          >
            {t('dashboard.adminListingDetail.reject')}
          </button>
        )}

        {listing.status === 'active' && (
          <button
            type="button"
            disabled={isActing}
            onClick={actions.onDisable}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-line/30 disabled:opacity-50"
          >
            {t('dashboard.adminListingDetail.disable')}
          </button>
        )}
      </div>
    </div>
  );
}
