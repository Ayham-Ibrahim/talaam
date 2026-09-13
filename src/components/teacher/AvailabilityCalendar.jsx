import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '@/hooks/useT';

/** Hourly slots offered for an individual session (teacher approves the exact time after) */
const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
const WEEKDAY_INITIALS_AR = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "10:00 صباحاً" */
function slotLabel(hour) {
  const period = hour < 12 || hour === 24 ? 'صباحاً' : 'مساءً';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${period}`;
}

function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), outside: false });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const next = cells.length - (firstWeekday + daysInMonth) + 1;
    cells.push({ date: new Date(year, month + 1, next), outside: true });
    if (cells.length >= 42) break;
  }
  return cells;
}

/**
 * "التوفر" — soft, friendly calendar: a round-pill month calendar, and once a
 * day is picked, the hourly slots appear stacked right below it (not side by
 * side) — matches the drawer's narrow single-column flow. Purely
 * presentational — BookingWidget owns the selection state and passes
 * `slotStatus(time)` → 'available' | 'busy' | 'past' | 'own'.
 */
export function AvailabilityCalendar({
  allowedDays = [],
  viewDate,
  onPrevMonth,
  onNextMonth,
  today,
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  slotStatus = () => 'available',
}) {
  const t = useT();
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat('ar', { month: 'long', year: 'numeric' }).format(viewDate),
    [viewDate],
  );
  const cells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);
  const selectedISO = selectedDate ? toISODate(selectedDate) : null;
  const todayISO = toISODate(today);

  return (
    <div className="flex flex-col gap-5">
      {/* Calendar */}
      <div className="rounded-3xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between px-1 py-1">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label={t('booking.prevMonth')}
            className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-accent-purple/10 hover:text-accent-purple"
          >
            <ChevronRight size={18} />
          </button>
          <span className="text-sm font-bold text-ink">{monthLabel}</span>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label={t('booking.nextMonth')}
            className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-accent-purple/10 hover:text-accent-purple"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-7 text-center text-[11px] font-medium text-ink-soft/70">
          {WEEKDAY_INITIALS_AR.map((d, i) => (
            <span key={i} className="py-1.5">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map(({ date, outside }, i) => {
            const iso = toISODate(date);
            const isToday = iso === todayISO;
            const isPast = date < today && !isToday;
            const allowed = allowedDays.includes(date.getDay());
            const disabled = isPast || !allowed;
            const isSelected = iso === selectedISO;
            return (
              <div key={i} className="flex items-center justify-center py-0.5">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectDate(new Date(date))}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                    isSelected
                      ? 'bg-accent-purple font-bold text-white shadow-[0_4px_10px_rgba(126,87,194,0.4)]'
                      : disabled
                        ? 'cursor-not-allowed text-line'
                        : outside
                          ? 'text-line hover:bg-accent-purple/10'
                          : isToday
                            ? 'font-bold text-accent-purple ring-2 ring-accent-pink/40'
                            : 'text-ink hover:bg-accent-purple/10'
                  }`}
                >
                  {date.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available hours — appears once a day is chosen */}
      {selectedDate && (
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <h4 className="mb-3 text-start text-sm font-bold text-ink">{t('booking.chooseTime')}</h4>
          <div className="grid grid-cols-3 gap-2">
            {SLOT_HOURS.map((hour) => {
              const value = `${pad(hour)}:00`;
              const status = slotStatus(value);
              const unavailable = status !== 'available';
              const isSelected = selectedTime === value;
              return (
                <button
                  key={hour}
                  type="button"
                  disabled={unavailable}
                  onClick={() => onSelectTime(value)}
                  title={
                    status === 'busy'
                      ? t('booking.timeUnavailable')
                      : status === 'own'
                        ? t('booking.ownTimeConflict')
                        : undefined
                  }
                  className={`rounded-2xl px-1 py-2.5 text-center text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-accent-purple text-white shadow-[0_4px_10px_rgba(126,87,194,0.4)]'
                      : unavailable
                        ? 'cursor-not-allowed bg-canvas text-line line-through'
                        : 'bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20'
                  }`}
                >
                  {slotLabel(hour)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
