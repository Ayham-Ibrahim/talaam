import { BookOpen, CalendarDays, Layers, Medal, Users } from 'lucide-react';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useT } from '@/hooks/useT';
import { useCurrencyStore } from '@/store';
import { formatPrice } from '@/lib/currency';

// Rotating per-card accent (icon badge + price + outline button) drawn from the app's identity palette
const PACKAGE_ACCENTS = [
  { bg: '#FDEAE3', solid: '#F74E28' }, // orange
  { bg: '#EBE5FC', solid: '#7E57C2' }, // purple
  { bg: '#E3F1FD', solid: '#2F80ED' }, // blue
  { bg: '#F7E6EE', solid: '#B00852' }, // pink/red
  { bg: '#E3F5EC', solid: '#2E9E6B' }, // green
];

/** Compact weekday+time summary for a group package's fixed schedule, e.g. "إثنين 5:00، أربعاء 5:00" */
function scheduleSummary(schedules, weekdays) {
  if (!schedules?.length) return null;
  return schedules
    .map((s) => `${weekdays[s.day_of_week]} ${(s.start_time ?? '').slice(0, 5)}`)
    .join('، ');
}

function PackageCard({ pkg, index, selected, onSelect }) {
  const t = useT();
  const currency = useCurrencyStore((s) => s.currency);
  const accent = PACKAGE_ACCENTS[index % PACKAGE_ACCENTS.length];
  const hasDiscount = !!pkg.discountPercent;
  const originalPrice = hasDiscount ? Math.round(pkg.price / (1 - pkg.discountPercent / 100)) : null;
  const isGroup = pkg.sessionFormat === 'group';
  const weekdays = t('booking.weekdays');
  const schedule = isGroup ? scheduleSummary(pkg.schedules, weekdays) : null;
  const stages = pkg.stages ?? [];
  const grades = pkg.grades ?? [];

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

      <div className="text-start">
        <h4 className="font-bold text-ink">{pkg.title}</h4>
        {pkg.description && <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{pkg.description}</p>}
      </div>

      {/* Subject + format pills */}
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {pkg.subject && (
          <span className="rounded-pill bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-soft">{pkg.subject}</span>
        )}
        <span className="inline-flex items-center gap-1 rounded-pill bg-[var(--accent-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)]">
          {isGroup ? <Users size={11} /> : <BookOpen size={11} />}
          {isGroup ? t('teacher.groupFormat') : t('teacher.individualFormat')}
        </span>
      </div>

      {/* المرحلة/الصفوف التي تستهدفها هذه الباقة تحديداً — قد تختلف باقات نفس المعلم عن بعضها */}
      {(stages.length > 0 || grades.length > 0) && (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {stages.map((stage) => (
            <span key={stage} className="rounded-pill bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
              {stage}
            </span>
          ))}
          {grades.length > 0 && (
            <span className="rounded-pill bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
              {t('teacher.gradePrefix')} {[...grades].sort((a, b) => a - b).join('، ')}
            </span>
          )}
        </div>
      )}

      {/* Facts row: sessions count, duration, seats (group only) */}
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-ink-soft">
        {pkg.durationPerSession != null && (
          <span>
            {pkg.durationPerSession} {t('teacher.sessionMinutes')}
          </span>
        )}
        {pkg.sessionsCount != null && (
          <span className="inline-flex items-center gap-1">
            <Layers size={12} />
            {pkg.sessionsCount} {t('teacher.sessionsCountLabel')}
          </span>
        )}
        {isGroup && pkg.capacity != null && (
          <span className="inline-flex items-center gap-1">
            <Users size={12} />
            {pkg.enrolledCount ?? 0}/{pkg.capacity} {t('teacher.seatsLabel')}
          </span>
        )}
      </div>

      {schedule && (
        <div className="flex items-start justify-end gap-1.5 text-xs text-ink-soft">
          <span className="text-end">{schedule}</span>
          <CalendarDays size={12} className="mt-0.5 shrink-0" />
        </div>
      )}

      <div className="flex items-baseline justify-end gap-2">
        {hasDiscount && (
          <span className="text-sm text-ink-soft line-through">{formatPrice(originalPrice, currency)}</span>
        )}
        <span className="text-2xl font-bold text-[var(--accent)]">{formatPrice(pkg.price, currency)}</span>
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
      <h3 className="mb-3 text-start font-bold text-ink">{t('teacher.packages')}</h3>
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
