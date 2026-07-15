import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAvailability } from '@/hooks/useMeta';
import { useCreateBooking } from '@/hooks/useBooking';
import { useT } from '@/hooks/useT';

const WEEKDAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

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

export function BookingWidget({ teacher, selectedPackage }) {
  const t = useT();
  const today = useMemo(() => startOfDay(new Date()), []);

  const [viewDate, setViewDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [subject, setSubject] = useState('');

  const selectedDateISO = selectedDate ? toISODate(selectedDate) : null;
  const { data: availability, isLoading: slotsLoading } = useAvailability(teacher.id, selectedDateISO);
  const createBooking = useCreateBooking();

  const monthLabel = new Intl.DateTimeFormat('ar', { month: 'long', year: 'numeric' }).format(viewDate);
  const cells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const canSubmit = Boolean(selectedPackage && subject && selectedDate && selectedTime);
  const selectedSlot = availability?.slots?.find((s) => s.time === selectedTime);
  const hasAnySlot = availability?.slots?.some((s) => s.available);

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    createBooking.mutate({
      teacherId: teacher.id,
      packageId: selectedPackage.id,
      subject,
      date: selectedDateISO,
      time: selectedTime,
    });
  };

  return (
    <div className="flex h-fit flex-col gap-5 rounded-card bg-white p-5 shadow-card lg:sticky lg:top-24">
      <h2 className="text-right font-bold text-ink">{t('booking.title')}</h2>

      {/* Selected package + subject */}
      <div>
        <h3 className="mb-2 text-right text-sm font-bold text-ink">{t('booking.selectedPackage')}</h3>
        {selectedPackage ? (
          <div className="flex items-center justify-between rounded-2xl border border-line p-3">
            <span className="text-xl font-bold text-primary">${selectedPackage.price}</span>
            <div className="text-right">
              <div className="text-sm font-semibold text-ink">{selectedPackage.title}</div>
              <div className="text-xs text-ink-soft">
                {selectedPackage.note ?? `${selectedPackage.durationPerSession} ${t('teacher.sessionMinutes')}`}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-3 text-center text-sm text-ink-soft">
            {t('teacher.choosePackage')}
          </div>
        )}

        <div className="relative mt-3">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-right text-sm text-ink outline-none focus:border-primary"
          >
            <option value="">
              {t('booking.subjectLabel')} — {t('search.select')}
            </option>
            {teacher.subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronLeft size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        </div>
      </div>

      {/* Date picker */}
      <div>
        <h3 className="mb-2 text-right text-sm font-bold text-ink">{t('booking.chooseDate')}</h3>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="الشهر التالي"
            className="rounded-full p-1.5 hover:bg-line/50"
          >
            <ChevronLeft size={16} className="text-ink-soft" />
          </button>
          <span className="text-sm font-bold text-ink">{monthLabel}</span>
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="الشهر السابق"
            className="rounded-full p-1.5 hover:bg-line/50"
          >
            <ChevronRight size={16} className="text-ink-soft" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-ink-soft">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <span key={i} />;
            const isPast = date < today;
            const isSelected = selectedDate && toISODate(date) === toISODate(selectedDate);
            const isToday = toISODate(date) === toISODate(today);
            return (
              <button
                key={i}
                type="button"
                disabled={isPast}
                onClick={() => handleSelectDate(date)}
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                  isSelected
                    ? 'bg-primary font-bold text-white'
                    : isPast
                      ? 'cursor-not-allowed text-line'
                      : isToday
                        ? 'border border-primary text-primary'
                        : 'text-ink hover:bg-line/50'
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <div>
        <h3 className="mb-2 text-right text-sm font-bold text-ink">{t('booking.chooseTime')}</h3>
        {!selectedDate ? (
          <p className="py-2 text-center text-sm text-ink-soft">{t('booking.chooseDate')}</p>
        ) : slotsLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-9 rounded-xl" />
            ))}
          </div>
        ) : !hasAnySlot ? (
          <p className="py-2 text-center text-sm text-ink-soft">{t('booking.noSlots')}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {availability.slots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                className={`rounded-xl border py-2 text-xs transition-colors ${
                  selectedTime === slot.time
                    ? 'border-primary bg-primary font-bold text-white'
                    : !slot.available
                      ? 'cursor-not-allowed border-line text-line'
                      : 'border-line text-ink hover:border-primary'
                }`}
              >
                {slot.time} {slot.period}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {(selectedDate || selectedTime) && (
        <div className="rounded-2xl bg-canvas p-3">
          <h3 className="mb-2 text-right text-sm font-bold text-ink">{t('booking.summary')}</h3>
          <div className="flex flex-col gap-1.5 text-sm text-ink-soft">
            {selectedDate && (
              <span className="flex items-center justify-end gap-2">
                {new Intl.DateTimeFormat('ar', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
                  selectedDate
                )}
                <CalendarDays size={14} />
              </span>
            )}
            {selectedTime && (
              <span className="flex items-center justify-end gap-2">
                {selectedTime} {selectedSlot?.period}
                <Clock size={14} />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Total + CTA */}
      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-xl font-bold text-primary">${selectedPackage?.price ?? 0}</span>
        <span className="text-sm font-bold text-ink">{t('booking.total')}</span>
      </div>

      {createBooking.isSuccess ? (
        <div className="flex items-center justify-center gap-2 rounded-btn bg-success-light py-3 text-sm font-bold text-success">
          <CheckCircle2 size={16} /> {t('booking.success')}
        </div>
      ) : (
        <Button className="w-full justify-center" disabled={!canSubmit || createBooking.isPending} onClick={handleSubmit}>
          {createBooking.isPending ? t('booking.submitting') : t('booking.proceed')}
        </Button>
      )}
    </div>
  );
}
