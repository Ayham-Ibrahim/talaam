import { useState } from 'react';
import { BookOpen, CalendarDays, Check, Clock, Layers, Users, X } from 'lucide-react';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useT } from '@/hooks/useT';
import { useCurrencyStore } from '@/store';
import { convertPrice } from '@/lib/currency';
import { formatDate, isPastDate, lastScheduleDate } from '@/lib/formatters';

const CURRENCY_SYMBOL = { USD: '$', EUR: '€', GBP: '£' };

/** Rotating gradient palette — assigned by card position, so it's varied per card but stable across re-renders */
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #5B8DEF 0%, #3D63C9 100%)',
  'linear-gradient(135deg, #8B7BEA 0%, #4E3FB0 100%)',
  'linear-gradient(135deg, #EA7BA0 0%, #F0A868 100%)',
  'linear-gradient(135deg, #34C3B8 0%, #2E8FC0 100%)',
  'linear-gradient(135deg, #E0607A 0%, #B33B63 100%)',
  'linear-gradient(135deg, #6DC0E0 0%, #4A6FE0 100%)',
];

/** "50 $" — number then symbol, matching the design */
function priceLabel(amountUSD, code) {
  const value = convertPrice(amountUSD ?? 0, code).toLocaleString('en-US');
  return `${value} ${CURRENCY_SYMBOL[code] ?? code}`;
}

/**
 * Group packages have no recurring weekly pattern — the teacher picks an
 * explicit calendar date per session, so `schedules` is a flat list of
 * {date, start_time} sorted ascending.
 */
function scheduleDates(schedules) {
  return [...(schedules ?? [])].map((s) => s.date).filter(Boolean).sort();
}

/* ─────────────────────────── Details modal ─────────────────────────── */

function DetailRow({ icon: Icon, children }) {
  return (
    <div className="flex items-center justify-end gap-2 text-sm text-[#626262]">
      <span className="text-end">{children}</span>
      {Icon && <Icon size={15} className="shrink-0 text-ink-soft" />}
    </div>
  );
}

function PackageDetailsModal({ pkg, onClose }) {
  const t = useT();
  const currency = useCurrencyStore((s) => s.currency);
  const isGroup = pkg.sessionFormat === 'group';
  const dates = isGroup ? scheduleDates(pkg.schedules) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-start shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-full p-1 text-ink-soft hover:bg-line/50"
          >
            <X size={18} />
          </button>
          <div className="text-end">
            <h3 className="text-lg font-bold text-[#1E1E1E]">{pkg.title}</h3>
            {pkg.subject && <p className="text-sm font-medium text-[#626262]">{pkg.subject}</p>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <span
            className={`rounded-3xl px-3 py-1.5 text-xs font-medium ${
              isGroup ? 'bg-[#E9F8FC] text-[#6BCEEE]' : 'bg-[#FEEDEA] text-[#F74E28]'
            }`}
          >
            {t(`teacher.packageBadge.${isGroup ? 'group' : 'individual'}`)}
          </span>
          {pkg.curricula?.map((c) => (
            <span key={c} className="rounded-3xl bg-[#EDF0F5] px-3 py-1.5 text-xs font-semibold text-[#4B6898]">
              {c}
            </span>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-line pt-4">
          {pkg.sessionsCount != null && (
            <DetailRow icon={Layers}>
              {pkg.sessionsCount} {t('teacher.sessionsCountLabel')}
            </DetailRow>
          )}
          {pkg.durationPerSession != null && (
            <DetailRow icon={Clock}>
              {pkg.durationPerSession} {t('teacher.sessionMinutes')}
            </DetailRow>
          )}
          {isGroup && pkg.capacity != null && (
            <DetailRow icon={CalendarDays}>
              {pkg.enrolledCount ?? 0}/{pkg.capacity} {t('teacher.seatsReservedSuffix')}
            </DetailRow>
          )}
          {pkg.stages?.map((s) => <DetailRow key={s}>{s}</DetailRow>)}
          {pkg.grades?.length > 0 && (
            <DetailRow>
              {t('teacher.gradePrefix')} {[...pkg.grades].sort((a, b) => a - b).join('، ')}
            </DetailRow>
          )}
        </div>

        {dates.length > 0 && (
          <div className="mt-4 border-t border-line pt-4">
            <h4 className="mb-2 text-end text-sm font-bold text-ink">{t('teacher.scheduleLabel')}</h4>
            <ul className="space-y-1 text-end text-sm text-[#626262]">
              {dates.map((d) => (
                <li key={d}>{formatDate(d)}</li>
              ))}
            </ul>
          </div>
        )}

        {pkg.description && (
          <p className="mt-4 whitespace-pre-line border-t border-line pt-4 text-end text-sm leading-relaxed text-[#626262]">
            {pkg.description}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="text-2xl font-bold text-[#4B6898]">{priceLabel(pkg.price, currency)}</span>
          <span className="text-sm font-bold text-ink">{t('booking.total')}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Card ─────────────────────────────── */

function PackageCard({ pkg, index, selected, onSelect, onDetails }) {
  const t = useT();
  const currency = useCurrencyStore((s) => s.currency);
  const isGroup = pkg.sessionFormat === 'group';
  const isEnded = isGroup && isPastDate(lastScheduleDate(pkg.schedules));

  const capacity = pkg.capacity ?? 0;
  const enrolled = Math.min(pkg.enrolledCount ?? 0, capacity);
  const reservedPct = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <div
      style={{ background: gradient }}
      className={`relative flex min-h-[290px] flex-col rounded-2xl p-5 text-start shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition ${
        isEnded ? 'opacity-60 grayscale-[30%]' : ''
      } ${selected ? 'ring-4 ring-white/80' : ''}`}
    >
      {/* Session-type badge */}
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm">
        {isGroup ? <Users size={13} /> : <BookOpen size={13} />}
        {t(`teacher.packageBadge.${isGroup ? 'group' : 'individual'}`)}
      </span>

      {/* Title + subject — no attendee avatars, just the package's own data */}
      <div className="mt-4">
        <h4 className="text-lg font-bold leading-snug text-white">{pkg.title}</h4>
        {pkg.subject && <p className="text-sm font-medium text-white/75">{pkg.subject}</p>}
      </div>

      {/* Sessions / duration line — replaces the reference's "N Files" row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-medium text-white/90">
        {pkg.sessionsCount != null && (
          <span className="inline-flex items-center gap-1.5">
            <Layers size={15} />
            {pkg.sessionsCount} {t('teacher.sessionsCountLabel')}
          </span>
        )}
        {pkg.durationPerSession != null && (
          <span className="inline-flex items-center gap-1.5">
            <Clock size={15} />
            {pkg.durationPerSession} {t('teacher.sessionMinutes')}
          </span>
        )}
      </div>

      {/* Group seats — replaces the reference's "Teacher: Name" line with real, varying data */}
      {isGroup && capacity > 0 && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90">
            <CalendarDays size={15} />
            {enrolled}/{capacity} {t('teacher.seatsReservedSuffix')}
          </span>
          <div className="relative mt-1.5 h-[7px] w-full overflow-hidden rounded-full bg-white/20">
            <div className="absolute right-0 top-0 h-full rounded-full bg-white" style={{ width: `${reservedPct}%` }} />
          </div>
        </div>
      )}

      {pkg.curricula?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pkg.curricula.map((c) => (
            <span key={c} className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white/85">
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Bottom block — pinned to the card bottom, price above the buttons */}
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <span dir="ltr" className="text-2xl font-bold leading-none text-white">
          {isEnded ? t('teacher.packageEnded') : priceLabel(pkg.price, currency)}
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={isEnded}
            onClick={() => onSelect(pkg)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-sm font-semibold text-[#1E1E1E] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {selected && <Check size={15} strokeWidth={3} />}
            {isGroup ? t('teacher.bookSeat') : t('teacher.choosePackage')}
          </button>
          <button
            type="button"
            onClick={() => onDetails(pkg)}
            className="flex-1 rounded-2xl border border-white/60 py-3 text-sm text-white transition-colors hover:bg-white/10"
          >
            {t('teacher.viewDetails')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Section ───────────────────────────── */

export function PackagesSection({ packages, isLoading, isError, refetch, selectedPackageId, onSelect }) {
  const t = useT();
  const [detailsPkg, setDetailsPkg] = useState(null);

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-start text-lg font-bold text-[#1E1E1E]">{t('teacher.packages')}</h3>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[290px] rounded-2xl" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <EmptyState title={t('teacher.packagesEmpty')} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={i}
              selected={pkg.id === selectedPackageId}
              onSelect={onSelect}
              onDetails={setDetailsPkg}
            />
          ))}
        </div>
      )}

      {detailsPkg && <PackageDetailsModal pkg={detailsPkg} onClose={() => setDetailsPkg(null)} />}
    </div>
  );
}
