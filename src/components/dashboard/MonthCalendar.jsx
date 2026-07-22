import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '@/hooks/useT';

// Saturday-first week, matching the design's right-to-left header order
const WEEKDAYS = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'اربعاء', 'خميس', 'جمعة'];
const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' });

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

export function MonthCalendar({ sessionsByDate, selectedDate, onSelectDate }) {
  const t = useT();
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate));
  const [viewMode, setViewMode] = useState('month');

  const cells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);
  const monthLabel = MONTH_LABEL_FORMATTER.format(viewDate).toUpperCase();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const VIEW_MODES = [
    { key: 'month', label: t('dashboard.viewMonth') },
    { key: 'week', label: t('dashboard.viewWeek') },
    { key: 'day', label: t('dashboard.viewDay') },
  ];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card sm:p-6">
      {/* Nav row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="الشهر التالي"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-card hover:bg-line/30"
          >
            <ChevronLeft size={18} className="text-ink" />
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="الشهر السابق"
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
    </div>
  );
}
