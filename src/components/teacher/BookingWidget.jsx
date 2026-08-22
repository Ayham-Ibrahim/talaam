import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Pencil, Trash2 } from 'lucide-react';
import { Button, ApiErrorList } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useRequestIndividualBooking, useCreateGroupBooking } from '@/hooks/useBooking';
import { useT } from '@/hooks/useT';
import { useCurrencyStore } from '@/store';
import { formatPrice } from '@/lib/currency';

/** Backend TIME columns serialize as "H:i:s" — trim to "H:i" for display */
function formatTime(t) {
  return t ? t.slice(0, 5) : t;
}

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
 * جماعية: جدول ثابت وضعه المعلم — الطالب ينضم مباشرة بلا اختيار، ثم يُحوَّل لدفع Stripe.
 * فردية: المعلم حدّد فقط الأيام المتاحة (بلا وقت) — الطالب يختار يوماً ووقتاً
 *   مستقلَّين لكل جلسة من جلسات الباقة على حدة (وليس موعداً واحداً يتكرر أسبوعياً
 *   تلقائياً على الجميع)، ويقدّم طلب حجز واحد يحمل كل هذه المواعيد معاً. لا دفع
 *   الآن — بانتظار موافقة المعلم، وبعدها يظهر زر "أكمل الدفع" في لوحة الطالب.
 */
export function BookingWidget({ selectedPackage }) {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const currency = useCurrencyStore((s) => s.currency);
  const weekdays = t('booking.weekdays');
  const today = useMemo(() => startOfDay(new Date()), []);

  const isGroup = selectedPackage?.sessionFormat === 'group';
  const schedules = selectedPackage?.schedules ?? [];
  const allowedDays = useMemo(() => schedules.map((s) => s.day_of_week), [schedules]);
  const sessionsCount = selectedPackage?.sessionsCount ?? 1;

  const [viewDate, setViewDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  // كل عنصر { date: Date, time: 'HH:mm' } أو null إن لم تُختَر هذه الجلسة بعد
  const [slots, setSlots] = useState(() => Array(sessionsCount).fill(null));
  const [activeIndex, setActiveIndex] = useState(0);

  // باقة جديدة (أو عدد جلسات مختلف) → إعادة تصفير كامل التقدّم السابق
  useEffect(() => {
    setSlots(Array(sessionsCount).fill(null));
    setActiveIndex(0);
    setSelectedDate(null);
    setSelectedTime('');
  }, [selectedPackage?.id, sessionsCount]);

  const requestIndividual = useRequestIndividualBooking(selectedPackage?.id);
  const createGroup = useCreateGroupBooking(selectedPackage?.id);

  const monthLabel = new Intl.DateTimeFormat('ar', { month: 'long', year: 'numeric' }).format(viewDate);
  const cells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const isEditingSlot = activeIndex < sessionsCount;
  const filledCount = slots.filter(Boolean).length;
  const allSlotsFilled = filledCount === sessionsCount;
  const canSubmitIndividual = allSlotsFilled;
  const canSubmitGroup = Boolean(selectedPackage) && schedules.length > 0;
  const isPending = requestIndividual.isPending || createGroup.isPending;
  const isSuccess = requestIndividual.isSuccess || createGroup.isSuccess;

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleSelectDate = (date) => {
    if (!allowedDays.includes(date.getDay())) return;
    setSelectedDate(date);
  };

  const firstEmptyIndex = (list) => {
    const idx = list.findIndex((s) => !s);
    return idx === -1 ? list.length : idx;
  };

  const handleConfirmSlot = () => {
    if (!selectedDate || !selectedTime) return;
    setSlots((prev) => {
      const next = [...prev];
      next[activeIndex] = { date: selectedDate, time: selectedTime };
      setActiveIndex(firstEmptyIndex(next));
      return next;
    });
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleEditSlot = (index) => {
    setActiveIndex(index);
    setSelectedDate(slots[index]?.date ?? null);
    setSelectedTime(slots[index]?.time ?? '');
  };

  const handleRemoveSlot = (index) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setActiveIndex(index);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (isGroup) {
      if (!canSubmitGroup) return;
      createGroup.mutate(undefined, {
        onSuccess: (data) => {
          if (data?.checkout_url) window.location.href = data.checkout_url;
        },
      });
      return;
    }
    if (!canSubmitIndividual) return;
    requestIndividual.mutate(slots.map((s) => ({ date: toISODate(s.date), start_time: s.time })));
  };

  return (
    <div className="flex h-fit flex-col gap-5 rounded-card bg-white p-5 shadow-card lg:sticky lg:top-24">
      <h2 className="text-start font-bold text-ink">{t('booking.title')}</h2>

      {/* Selected package */}
      <div>
        <h3 className="mb-2 text-start text-sm font-bold text-ink">{t('booking.selectedPackage')}</h3>
        {selectedPackage ? (
          <div className="flex items-center justify-between rounded-2xl border border-line p-3">
            <span className="text-xl font-bold text-primary">{formatPrice(selectedPackage.price, currency)}</span>
            <div className="text-start">
              <div className="text-sm font-semibold text-ink">{selectedPackage.title}</div>
              <div className="text-xs text-ink-soft">
                {selectedPackage.durationPerSession} {t('teacher.sessionMinutes')}
                {selectedPackage.subject ? ` · ${selectedPackage.subject}` : ''}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-3 text-center text-sm text-ink-soft">
            {t('teacher.choosePackage')}
          </div>
        )}
      </div>

      {isGroup && (
        <div>
          <h3 className="mb-2 text-start text-sm font-bold text-ink">{t('booking.groupScheduleTitle')}</h3>
          {schedules.length === 0 ? (
            <p className="py-2 text-center text-sm text-ink-soft">{t('booking.noGroupSchedule')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {schedules.map((s) => (
                <li key={s.id} className="flex items-center justify-end gap-2 rounded-xl border border-line px-3 py-2 text-sm text-ink">
                  {weekdays[s.day_of_week]} · {formatTime(s.start_time)}–{formatTime(s.end_time)}
                  <CalendarDays size={14} className="text-ink-soft" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!isGroup && selectedPackage && (
        <>
          {sessionsCount > 1 && (
            <div className="rounded-2xl bg-primary-light px-3 py-2.5 text-xs font-medium text-primary">
              {t('booking.multiSessionHint')}
            </div>
          )}

          {/* Already-chosen sessions */}
          {filledCount > 0 && (
            <div>
              <h3 className="mb-2 text-start text-sm font-bold text-ink">{t('booking.chosenSessionsTitle')}</h3>
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
            </div>
          )}

          {isEditingSlot && (
            <>
              <div>
                <h3 className="mb-2 flex items-center justify-between text-start text-sm font-bold text-ink">
                  <span>{t('booking.availableDaysTitle')}</span>
                  {sessionsCount > 1 && (
                    <span className="text-xs font-medium text-primary">
                      {t('booking.sessionLabel')} {activeIndex + 1} {t('booking.ofLabel')} {sessionsCount}
                    </span>
                  )}
                </h3>
                {allowedDays.length === 0 ? (
                  <p className="py-2 text-center text-sm text-ink-soft">{t('booking.noSlotsAvailable')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allowedDays.map((d) => (
                      <span key={d} className="rounded-pill bg-primary-light px-3 py-1 text-xs font-bold text-primary">
                        {weekdays[d]}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {allowedDays.length > 0 && (
                <div>
                  <h3 className="mb-2 text-start text-sm font-bold text-ink">{t('booking.chooseDate')}</h3>
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
              )}

              {selectedDate && (
                <div className="flex flex-col items-start gap-1.5">
                  <label className="text-sm font-semibold text-primary">{t('booking.chooseTime')}</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full rounded-lg border border-[#E3E3E3] px-3 py-3 text-sm text-ink focus:border-primary focus:outline-none"
                  />
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
        </>
      )}

      {/* Summary */}
      {!isGroup && filledCount > 0 && (
        <div className="rounded-2xl bg-canvas p-3">
          <h3 className="mb-2 text-start text-sm font-bold text-ink">{t('booking.summary')}</h3>
          <div className="flex flex-col gap-2 text-sm text-ink-soft">
            {slots.map((slot, i) =>
              slot ? (
                <div key={i} className="flex items-center justify-end gap-2">
                  {new Intl.DateTimeFormat('ar', { weekday: 'long', day: 'numeric', month: 'long' }).format(slot.date)} · {slot.time}
                  <Clock size={14} />
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {(requestIndividual.isError || createGroup.isError) && (
        <ApiErrorList error={requestIndividual.error ?? createGroup.error} labelFor={() => null} />
      )}

      {/* Total + CTA */}
      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-xl font-bold text-primary">{formatPrice(selectedPackage?.price ?? 0, currency)}</span>
        <span className="text-sm font-bold text-ink">{t('booking.total')}</span>
      </div>

      {isSuccess ? (
        <div className="flex items-center justify-center gap-2 rounded-btn bg-success-light py-3 text-sm font-bold text-success">
          <CheckCircle2 size={16} /> {isGroup ? t('booking.success') : t('booking.requestSuccess')}
        </div>
      ) : (
        <Button
          className="w-full justify-center"
          disabled={(isGroup ? !canSubmitGroup : !canSubmitIndividual) || isPending}
          onClick={handleSubmit}
        >
          {isPending
            ? t('booking.submitting')
            : !isAuthenticated
              ? t('booking.loginToBook')
              : isGroup
                ? t('booking.joinGroup')
                : t('booking.sendRequest')}
        </Button>
      )}
    </div>
  );
}
