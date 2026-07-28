import { Search } from 'lucide-react';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { LISTING_STATUS_STYLES, LISTING_KIND_LABELS } from '@/mocks/adminListings.mock';
import { useT } from '@/hooks/useT';

export function AdminListingsFilterBar({ filters, onChange }) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SmoothSelect
        className="min-w-[200px] flex-1"
        value={filters.kind}
        onChange={(v) => onChange('kind', v)}
        placeholder={t('dashboard.adminListings.allKinds')}
        options={Object.entries(LISTING_KIND_LABELS).map(([value, label]) => ({ value, label }))}
      />

      <SmoothSelect
        className="min-w-[200px] flex-1"
        value={filters.status}
        onChange={(v) => onChange('status', v)}
        placeholder={t('dashboard.adminListings.allStatuses')}
        options={Object.entries(LISTING_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label }))}
      />

      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">
        <Search size={16} className="shrink-0 text-ink-soft" />
        <input
          type="text"
          value={filters.q}
          onChange={(e) => onChange('q', e.target.value)}
          placeholder={t('dashboard.adminListings.searchPlaceholder')}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
        />
      </div>
    </div>
  );
}
