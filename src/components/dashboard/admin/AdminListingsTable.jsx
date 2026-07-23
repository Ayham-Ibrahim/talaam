import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { ListingStatusBadge } from './ListingStatusBadge';
import { LISTING_KIND_LABELS, PROVIDER_TYPE_LABELS } from '@/mocks/adminListings.mock';
import { formatDate, formatPrice } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function AdminListingsTable({ listings }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminListings.colListing')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminListings.colProvider')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminListings.colPrice')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminListings.colStatus')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminListings.colSubmitted')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminListings.colActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {listings.map((listing, i) => (
            <tr key={listing.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
              <td className="px-4 py-4 text-right">
                <div className="font-semibold text-ink">{listing.title}</div>
                <div className="text-xs text-ink-soft">
                  {LISTING_KIND_LABELS[listing.kind]} · {listing.subjectName}
                </div>
              </td>
              <td className="px-4 py-4 text-right text-ink-soft">
                {listing.providerName}
                <div className="text-xs">{PROVIDER_TYPE_LABELS[listing.providerType]}</div>
              </td>
              <td className="px-4 py-4 text-right">
                <div className="font-semibold text-ink">{formatPrice(listing.teacherPrice)}</div>
                {listing.studentPrice != null && (
                  <div className="text-xs text-price">{formatPrice(listing.studentPrice)}</div>
                )}
              </td>
              <td className="px-4 py-4 text-right">
                <ListingStatusBadge status={listing.status} />
              </td>
              <td className="px-4 py-4 text-right text-ink-soft">{formatDate(listing.submittedAt)}</td>
              <td className="px-4 py-4 text-right">
                <Link
                  to={`/dashboard/admin/listings/${listing.id}`}
                  className="inline-flex items-center gap-1.5 text-primary hover:opacity-70"
                >
                  <Eye size={18} />
                  {t('dashboard.adminListings.view')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
