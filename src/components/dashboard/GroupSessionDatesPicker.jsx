import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useT } from '@/hooks/useT';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

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
  const cells = Array.from({ length: firstDay.getDay() }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

/**
 * الباقة الجماعية: المعلم يختار تاريخ كل جلسة صراحةً من روزنامة — بلا تكرار
 * أسبوعي تلقائي. عدد التواريخ يجب أن يساوي sessions_count بالضبط
 * (PackageService::syncSchedules يرفض أي عدد آخر).
 */
export function GroupSessionDatesPicker({ schedules, onChange, sessionsCount }) {
  const t = useT();
  const weekdays = t('booking.weekdays');
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewDate, setViewDate] = useState(today);

  const monthLabel = new Intl.DateTimeFormat('ar', { month: 'long', year: 'numeric' }).format(viewDate);
  const cells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);
  const selectedDates = schedules.map((s) => s.date);
  const target = Number(sessionsCount) || 0;

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const toggleDate = (date) => {
    const iso = toISODate(date);
    if (selectedDates.includes(iso)) {
      onChange(schedules.filter((s) => s.date !== iso));
      return;
    }
    if (target > 0 && schedules.length >= target) return;
    onChange([...schedules, { date: iso, start_time: '' }].sort((a, b) => a.date.localeCompare(b.date)));
  };

  const updateTime = (date, start_time) => {
    onChange(schedules.map((s) => (s.date === date ? { ...s, start_time } : s)));
  };

  const removeDate = (date) => onChange(schedules.filter((s) => s.date !== date));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-primary">
        {t('dashboard.addPackage.datesSelectedPrefix')} {schedules.length} {t('dashboard.addPackage.datesSelectedOf')} {target}
      </p>

      <div className="rounded-2xl border border-line p-4">
        <div className="flex items-center justify-between">
          <button type="button" onClick={handleNextMonth} aria-label={t('booking.nextMonth')} className="rounded-full p-1.5 hover:bg-line/50">
            <ChevronLeft size={16} className="text-ink-soft" />
          </button>
          <span className="text-sm font-bold text-ink">{monthLabel}</span>
          <button type="button" onClick={handlePrevMonth} aria-label={t('booking.prevMonth')} className="rounded-full p-1.5 hover:bg-line/50">
            <ChevronRight size={16} className="text-ink-soft" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-ink-soft">
          {weekdays.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <span key={i} />;
            const iso = toISODate(date);
            const isPast = date < today;
            const isSelected = selectedDates.includes(iso);
            const isMaxedOut = !isSelected && target > 0 && schedules.length >= target;
            const isDisabled = isPast || isMaxedOut;
            return (
              <button
                key={i}
                type="button"
                disabled={isDisabled}
                onClick={() => toggleDate(date)}
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                  isSelected
                    ? 'bg-primary font-bold text-white'
                    : isDisabled
                      ? 'cursor-not-allowed text-line'
                      : 'text-ink hover:bg-line/50'
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {schedules.length > 0 && (
        <div className="flex flex-col gap-2">
          {schedules.map((s) => (
            <div key={s.date} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-3">
              <span className="min-w-[140px] text-sm font-semibold text-ink" dir="ltr">
                {s.date}
              </span>
              <input
                type="time"
                value={s.start_time}
                onChange={(e) => updateTime(s.date, e.target.value)}
                className="rounded-lg border border-[#E3E3E3] px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeDate(s.date)}
                aria-label={t('dashboard.addPackage.scheduleRemove')}
                className="mr-auto flex h-9 w-9 items-center justify-center rounded-full text-accent-pink hover:bg-accent-pink/10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
