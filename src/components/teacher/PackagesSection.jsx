import { Medal } from 'lucide-react';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useT } from '@/hooks/useT';

// Rotating per-card accent (icon badge + price + outline button) drawn from the app's identity palette
const PACKAGE_ACCENTS = [
  { bg: '#FDEAE3', solid: '#F74E28' }, // orange
  { bg: '#EBE5FC', solid: '#7E57C2' }, // purple
  { bg: '#E3F1FD', solid: '#2F80ED' }, // blue
  { bg: '#F7E6EE', solid: '#B00852' }, // pink/red
  { bg: '#E3F5EC', solid: '#2E9E6B' }, // green
];

function PackageCard({ pkg, index, selected, onSelect }) {
  const t = useT();
  const accent = PACKAGE_ACCENTS[index % PACKAGE_ACCENTS.length];
  const hasDiscount = !!pkg.discountPercent;
  const originalPrice = hasDiscount ? Math.round(pkg.price / (1 - pkg.discountPercent / 100)) : null;

  return (
    <div
      style={{ '--accent': accent.solid, '--accent-bg': accent.bg }}
      className={`group flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift ${
        selected ? 'border-[var(--accent)] bg-[var(--accent-bg)]/40' : 'border-line bg-white hover:border-[var(--accent)]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-bg)] transition-transform duration-200 group-hover:scale-110"
        >
          <Medal size={22} className="text-[var(--accent)]" />
        </div>
        {hasDiscount && (
          <span className="rounded-pill bg-[#FEEDEA] px-2 py-1 text-xs font-bold text-[#F74E28]">
            {t('teacher.discount')} {pkg.discountPercent}%
          </span>
        )}
      </div>

      <div className="text-right">
        <h4 className="font-bold text-ink">{pkg.title}</h4>
        <p className="mt-0.5 text-xs text-ink-soft">
          {pkg.note ?? `${pkg.durationPerSession} ${t('teacher.sessionMinutes')}`}
        </p>
      </div>

      <div className="flex items-baseline justify-end gap-2">
        {hasDiscount && <span className="text-sm text-ink-soft line-through">${originalPrice}</span>}
        <span className="text-2xl font-bold text-[var(--accent)]">${pkg.price}</span>
      </div>

      <button
        type="button"
        onClick={() => onSelect(pkg)}
        className={`w-full rounded-2xl border border-[var(--accent)] py-2.5 text-sm font-medium transition-colors duration-200 ${
          selected
            ? 'bg-[var(--accent)] text-white'
            : 'bg-transparent text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
        }`}
      >
        {t('teacher.choosePackage')}
      </button>
    </div>
  );
}

export function PackagesSection({ packages, isLoading, isError, refetch, selectedPackageId, onSelect }) {
  const t = useT();

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-right font-bold text-ink">{t('teacher.packages')}</h3>
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <EmptyState title={t('teacher.packagesEmpty')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} selected={pkg.id === selectedPackageId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
