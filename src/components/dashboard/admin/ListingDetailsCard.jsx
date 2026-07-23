import { AlertTriangle } from 'lucide-react';
import { ListingStatusBadge } from './ListingStatusBadge';
import { LISTING_KIND_LABELS, PROVIDER_TYPE_LABELS, SESSION_FORMAT_LABELS } from '@/mocks/adminListings.mock';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

function InfoRow({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-3">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

export function ListingDetailsCard({ listing }) {
  const t = useT();

  return (
    <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-4 text-right">
        <ListingStatusBadge status={listing.status} />
        <div>
          <h2 className="text-lg font-bold text-ink">{listing.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{LISTING_KIND_LABELS[listing.kind]}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <InfoRow label={t('dashboard.adminListingDetail.provider')} value={listing.providerName} />
        <InfoRow label={t('dashboard.adminListingDetail.providerType')} value={PROVIDER_TYPE_LABELS[listing.providerType]} />
        <InfoRow label={t('dashboard.adminListingDetail.subject')} value={listing.subjectName} />
        <InfoRow label={t('dashboard.adminListingDetail.sessionsCount')} value={listing.sessionsCount} />
        {listing.sessionFormat && (
          <InfoRow label={t('dashboard.adminListingDetail.sessionFormat')} value={SESSION_FORMAT_LABELS[listing.sessionFormat]} />
        )}
        {listing.capacity && <InfoRow label={t('dashboard.adminListingDetail.capacity')} value={listing.capacity} />}
        <InfoRow label={t('dashboard.adminListingDetail.submittedAt')} value={formatDate(listing.submittedAt)} />
      </div>

      {listing.description && (
        <p className="mt-4 text-right text-sm leading-relaxed text-ink-soft">{listing.description}</p>
      )}

      {listing.rejectionReason && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-accent-pink/10 p-3 text-right">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-pink" />
          <div>
            <div className="text-xs font-bold text-accent-pink">{t('dashboard.adminListingDetail.rejectionReason')}</div>
            <div className="text-sm text-ink">{listing.rejectionReason}</div>
          </div>
        </div>
      )}

      {listing.disabledReason && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#F2F2F7] p-3 text-right">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-ink-soft" />
          <div>
            <div className="text-xs font-bold text-ink-soft">{t('dashboard.adminListingDetail.disabledReason')}</div>
            <div className="text-sm text-ink">{listing.disabledReason}</div>
          </div>
        </div>
      )}
    </div>
  );
}
