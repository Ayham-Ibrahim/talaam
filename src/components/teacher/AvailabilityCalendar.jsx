import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '@/hooks/useT';

const SELECTED = '#4B6898';
/** Hourly slots offered for an individual session (teacher approves the exact time after) */
const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
/** English weekday initials — matches the design's date-picker header */
const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "10:00 صباحاً" — reads correctly in the RTL cell (time is read first, on the right) */
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
 * "التوفر" — availability card matching the Figma design: a bordered white card
 * with the month calendar on the right and the hourly time-slot chips on the
 * left. Purely presentational — BookingWidget owns the selection state and
 * passes `slotStatus(time)` → 'available' | 'busy' | 'past' | 'own'.
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
    <div
      style={{ maxWidth: 'none' }}
      className="w-full rounded-3xl bg-white px-4 py-4 shadow-[0px_1px_5px_rgba(0,0,0,0.1)] sm:px-8"
    >
      <h3 className="mb-1 text-end text-lg font-bold text-[#2D2D2D]">{t('teacher.availability')}</h3>

      <div className="flex flex-col gap-8 lg:flex-row-reverse">
        {/* Calendar — right in RTL; the grid itself is LTR to match the design */}
        <div dir="ltr" className="lg:w-[46%]">
          <div className="flex items-center justify-between py-2">
            <button
              type="button"
              onClick={onPrevMonth}
              aria-label={t('booking.prevMonth')}
              className="rounded-full p-1.5 text-[#A5A5A5] hover:bg-line/50"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-base font-bold text-[#1B1B1B]">{monthLabel}</span>
            <button
              type="button"
              onClick={onNextMonth}
              aria-label={t('booking.nextMonth')}
              className="rounded-full p-1.5 text-[#A5A5A5] hover:bg-line/50"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-sm text-[#6C6C6C]">
            {WEEKDAY_INITIALS.map((d, i) => (
              <span key={i} className="py-2">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map(({ date, outside }, i) => {
              const iso = toISODate(date);
              const isPast = date < today && iso !== todayISO;
              const allowed = allowedDays.includes(date.getDay());
              const disabled = isPast || !allowed;
              const isSelected = iso === selectedISO;
              return (
                <div key={i} className="flex items-center justify-center py-1">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelectDate(new Date(date))}
                    style={isSelected ? { background: SELECTED } : undefined}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-[15px] transition-colors ${
                      isSelected
                        ? 'font-medium text-white'
                        : disabled
                          ? 'cursor-not-allowed text-[#C6C6C6]'
                          : outside
                            ? 'text-[#C6C6C6] hover:bg-line/40'
                            : 'text-[#1B1B1B] hover:bg-line/40'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time slots — left in RTL */}
        <div className="flex-1">
          {!selectedDate ? (
            <p className="py-10 text-center text-sm text-ink-soft">{t('booking.pickDateFirst')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                    style={isSelected ? { background: SELECTED, borderColor: SELECTED } : undefined}
                    className={`h-[52px] rounded-xl border-[0.5px] border-[#E5E5EA] text-center text-sm font-medium shadow-[0px_1px_5px_rgba(0,0,0,0.1)] transition-colors ${
                      isSelected
                        ? 'text-white'
                        : unavailable
                          ? 'cursor-not-allowed text-[#C6C6C6] line-through'
                          : 'bg-white text-[#1E1E1E] hover:border-[#4B6898]'
                    }`}
                  >
                    {slotLabel(hour)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
