import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { usePackageBusySlots } from '@/hooks/useBooking';
import { useT } from '@/hooks/useT';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatHHmm(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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

function firstEmptyIndex(list) {
  const idx = list.findIndex((s) => !s);
  return idx === -1 ? list.length : idx;
}

/**
 * حجز يدوي لباقة فردية — يوازي منطق BookingWidget (اختيار يوم من الأيام
 * المتاحة + وقت لكل جلسة على حدة) لكن بلا فحص "تعارض الطالب نفسه" (لا حساب
 * حالياً لجلب جدول طالب مُختار عشوائياً من الأدمن)؛ الشرط الملزم الفعلي يبقى
 * على الباك اند (ScheduleConflictService) وقت التأكيد — هذا فقط يمنع إرسال
 * الطلب أصلاً بمواعيد غير ضمن أيام توفّر المعلم، ويعرض أوقاته المشغولة استشارياً.
 */
export function AdminSlotPicker({ packageId, schedules, sessionsCount, slots, onChange }) {
  const t = useT();
  const weekdays = t('booking.weekdays');
  const today = useMemo(() => startOfDay(new Date()), []);
  const allowedDays = useMemo(() => schedules.map((s) => s.day_of_week), [schedules]);

  const [viewDate, setViewDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [activeIndex, setActiveIndex] = useState(() => firstEmptyIndex(slots));

  const { data: busySlots } = usePackageBusySlots(packageId, selectedDate ? toISODate(selectedDate) : null);

  const isEditingSlot = activeIndex < sessionsCount;
  const monthLabel = new Intl.DateTimeFormat('ar', { month: 'long', year: 'numeric' }).format(viewDate);
  const cells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const handleSelectDate = (date) => {
    if (!allowedDays.includes(date.getDay())) return;
    setSelectedDate(date);
  };

  const handleConfirmSlot = () => {
    if (!selectedDate || !selectedTime) return;
    const next = [...slots];
    next[activeIndex] = { date: selectedDate, time: selectedTime };
    onChange(next);
    setActiveIndex(firstEmptyIndex(next));
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleEditSlot = (index) => {
    setActiveIndex(index);
    setSelectedDate(slots[index]?.date ?? null);
    setSelectedTime(slots[index]?.time ?? '');
  };

  const handleRemoveSlot = (index) => {
    const next = [...slots];
    next[index] = null;
    onChange(next);
    setActiveIndex(index);
    setSelectedDate(null);
    setSelectedTime('');
  };

  if (allowedDays.length === 0) {
    return <p className="py-2 text-center text-sm text-ink-soft">{t('booking.noSlotsAvailable')}</p>;
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line p-3">
      <div className="flex items-center justify-between text-sm font-bold text-ink">
        <span>{t('booking.availableDaysTitle')}</span>
        {sessionsCount > 1 && (
          <span className="text-xs font-medium text-primary">
            {t('booking.sessionLabel')} {Math.min(activeIndex + 1, sessionsCount)} {t('booking.ofLabel')} {sessionsCount}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {allowedDays.map((d) => (
          <span key={d} className="rounded-pill bg-primary-light px-3 py-1 text-xs font-bold text-primary">
            {weekdays[d]}
          </span>
        ))}
      </div>

      {slots.some(Boolean) && (
        <ul className="flex flex-col gap-1.5">
          {slots.map((slot, i) =>
            slot ? (
              <li
                key={i}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${
                  activeIndex === i ? 'border-primary bg-primary-light/40' : 'border-line'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(i)}
                    aria-label={t('booking.removeSlot')}
                    className="rounded-full p-1 text-[#FF383C] hover:bg-[#FF383C]/10"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditSlot(i)}
                    aria-label={t('booking.editSlot')}
                    className="rounded-full p-1 text-primary hover:bg-primary/10"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <span className="text-ink">
                  {t('booking.sessionLabel')} {i + 1}: {new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short' }).format(slot.date)} · {slot.time}
                </span>
              </li>
            ) : null
          )}
        </ul>
      )}

      {isEditingSlot && (
        <>
          <div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                aria-label={t('booking.nextMonth')}
                className="rounded-full p-1.5 hover:bg-line/50"
              >
                <ChevronLeft size={16} className="text-ink-soft" />
              </button>
              <span className="text-sm font-bold text-ink">{monthLabel}</span>
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                aria-label={t('booking.prevMonth')}
                className="rounded-full p-1.5 hover:bg-line/50"
              >
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
                const isPast = date < today;
                const matchesAllowedDay = allowedDays.includes(date.getDay());
                const isDisabled = isPast || !matchesAllowedDay;
                const isSelected = selectedDate && toISODate(date) === toISODate(selectedDate);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDate(date)}
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

          {selectedDate && (
            <div className="flex flex-col items-start gap-1.5">
              <label className="text-sm font-semibold text-primary">{t('booking.chooseTime')}</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full rounded-lg border border-[#E3E3E3] px-3 py-3 text-sm text-ink focus:border-primary focus:outline-none"
              />
              {busySlots?.length > 0 && (
                <p className="text-xs text-ink-soft">
                  {t('booking.unavailableTimesLabel')}{' '}
                  {busySlots.map((slot) => `${formatHHmm(slot.start)}–${formatHHmm(slot.end)}`).join('، ')}
                </p>
              )}
            </div>
          )}

          {selectedDate && selectedTime && (
            <button
              type="button"
              onClick={handleConfirmSlot}
              className="w-full rounded-xl border-2 border-primary bg-primary/5 py-2.5 text-sm font-bold text-primary hover:bg-primary/10"
            >
              {slots[activeIndex] ? t('booking.updateSlot') : t('booking.confirmSlot')}
            </button>
          )}
        </>
      )}
    </div>
  );
}
