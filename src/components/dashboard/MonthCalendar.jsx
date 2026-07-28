import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '@/hooks/useT';

// Saturday-first week, matching the design's right-to-left header order
const WEEKDAYS = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'اربعاء', 'خميس', 'جمعة'];
const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' });
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00 .. 19:00

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 1) % 7; // shift so Saturday = 0

  const cells = [];
  for (let i = leadingBlanks - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }
  return cells;
}

function buildWeekDays(viewDate) {
  const shift = (viewDate.getDay() + 1) % 7; // days since Saturday
  const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate() - shift);
  return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

function formatHourLabel(hour) {
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${String(hour).padStart(2, '0')} AM` : `${String(hour - 12).padStart(2, '0')} PM`;
}

function sessionHour(session) {
  return parseInt(session.time.split(':')[0], 10);
}

export function MonthCalendar({ sessionsByDate, selectedDate, onSelectDate }) {
  const t = useT();
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate));
  const [viewMode, setViewMode] = useState('month');

  const cells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);
  const weekDays = useMemo(() => buildWeekDays(viewDate), [viewDate]);
  const monthLabel = MONTH_LABEL_FORMATTER.format(viewDate).toUpperCase();

  const handlePrev = () => {
    if (viewMode === 'week') setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate() - 7));
    else if (viewMode === 'day') setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate() - 1));
    else setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const handleNext = () => {
    if (viewMode === 'week') setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate() + 7));
    else if (viewMode === 'day') setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate() + 1));
    else setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const VIEW_MODES = [
    { key: 'month', label: t('dashboard.viewMonth') },
    { key: 'week', label: t('dashboard.viewWeek') },
    { key: 'day', label: t('dashboard.viewDay') },
  ];

  const dayColumns = viewMode === 'day' ? [viewDate] : weekDays;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card sm:p-6">
      {/* Nav row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleNext}
            aria-label="التالي"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-card hover:bg-line/30"
          >
            <ChevronLeft size={18} className="text-ink" />
          </button>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="السابق"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-card hover:bg-line/30"
          >
            <ChevronRight size={18} className="text-ink" />
          </button>
          <span className="flex items-center gap-2 text-lg font-bold text-primary sm:text-xl">
            {monthLabel}
            <CalendarIcon size={20} />
          </span>
        </div>

        <div className="flex items-center gap-2">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => setViewMode(mode.key)}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-colors sm:px-6 sm:py-3 sm:text-base ${
                viewMode === mode.key ? 'bg-primary text-white' : 'bg-[#EDF0F5] text-ink hover:bg-line/60'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'month' ? (
        <>
          {/* Weekday header */}
          <div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="rounded-2xl bg-primary py-2.5 text-center text-xs font-medium text-white sm:py-4 sm:text-base"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="mt-1.5 grid grid-cols-7 gap-1.5 sm:mt-2 sm:gap-2">
            {cells.map(({ date, inMonth }, i) => {
              const iso = toISODate(date);
              const events = sessionsByDate[iso] ?? [];
              const isSelected = iso === selectedDate;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!inMonth}
                  onClick={() => onSelectDate(iso)}
                  className={`flex h-16 flex-col items-center justify-center gap-1.5 rounded-2xl border transition-colors sm:h-20 ${
                    isSelected
                      ? 'border-primary bg-primary text-white'
                      : inMonth
                        ? 'border-[#EDF0F5] bg-white text-ink hover:border-primary'
                        : 'border-transparent bg-white text-line'
                  }`}
                >
                  <span className="text-sm sm:text-lg">{date.getDate()}</span>
                  {events.length > 0 && (
                    <span className="flex items-center gap-1">
                      {events.slice(0, 3).map((ev) => (
                        <span key={ev.id} className="h-1.5 w-3 rounded-full" style={{ background: ev.color }} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="mt-6 flex items-start gap-1.5 sm:gap-2">
          {dayColumns.map((date) => {
            const iso = toISODate(date);
            const isSelected = iso === selectedDate;
            const dayLabel = `${WEEKDAYS[(date.getDay() + 1) % 7]} ${date.getMonth() + 1}/${date.getDate()}`;
            return (
              <div key={iso} className="flex flex-1 flex-col gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => onSelectDate(iso)}
                  className={`rounded-2xl py-2.5 text-center text-xs font-medium transition-colors sm:py-4 sm:text-base ${
                    viewMode === 'day' || isSelected ? 'bg-primary text-white' : 'bg-primary/90 text-white hover:bg-primary'
                  }`}
                >
                  {dayLabel}
                </button>
                {HOURS.map((hour) => {
                  const events = (sessionsByDate[iso] ?? []).filter((ev) => sessionHour(ev) === hour);
                  return (
                    <div
                      key={hour}
                      className={`flex h-[52px] items-center justify-center gap-1 rounded-2xl border ${
                        events.length > 0 ? 'border-[#E4E8E7] bg-white' : 'border-[#EDF0F5] bg-white'
                      }`}
                    >
                      {events.map((ev) => (
                        <span key={ev.id} className="h-1.5 w-5 rounded-full" style={{ background: ev.color }} />
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div className="flex w-[64px] shrink-0 flex-col gap-1.5 sm:gap-2">
            {viewMode === 'day' ? (
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="اليوم التالي"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-card hover:bg-line/30"
                >
                  <ChevronLeft size={14} className="text-ink" />
                </button>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="اليوم السابق"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-card hover:bg-line/30"
                >
                  <ChevronRight size={14} className="text-ink" />
                </button>
              </div>
            ) : (
              <div className="py-2.5 sm:py-4" />
            )}
            {HOURS.map((hour) => (
              <div key={hour} className="flex h-[52px] items-center justify-center text-xs text-ink-soft sm:text-sm">
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
