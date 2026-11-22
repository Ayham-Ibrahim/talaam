import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, Mail, Pencil, PlayCircle, Trash2 } from 'lucide-react';
import { Button, ApiErrorList } from '@/components/ui';
import { AvailabilityCalendar, FULL_DAY_SLOT_TIMES } from '@/components/teacher/AvailabilityCalendar';
import { PolicyNotice } from '@/components/common/PolicyNotice';
import { YoutubeModal } from '@/components/common/YoutubeModal';
import { useAuth } from '@/hooks/useAuth';
import {
  useRequestIndividualBooking,
  useCreateGroupBooking,
  useCheckoutBooking,
  usePackageBusySlots,
  usePackageBusySlotsForDates,
} from '@/hooks/useBooking';
import { useCalendarSessions } from '@/hooks/useDashboard';
import { useBookGuestTrial, useSendGuestCode } from '@/hooks/useCampaign';
import { EMAIL_PATTERN } from '@/lib/accountFormValidation';
import { useT } from '@/hooks/useT';
import { useCurrencyStore } from '@/store';
import { formatPrice } from '@/lib/currency';
import { formatDate, isPastDate, lastScheduleDate } from '@/lib/formatters';
import { rangesOverlap, findOwnConflict } from '@/lib/scheduleConflict';
import { fitsCampaignWindows } from '@/lib/campaignWindows';
import { useCheckoutRedirect } from '@/hooks/useCheckoutRedirect';

/** Backend TIME columns serialize as "H:i:s" — trim to "H:i" for display */
function formatTime(t) {
  return t ? t.slice(0, 5) : t;
}

/** فيديوهات تعليمية تشرح للطالب خطوات الحجز ثم الدفع */
const BOOKING_GUIDE_YOUTUBE_ID = 'QisG0PTxDQk';
const PAYMENT_GUIDE_YOUTUBE_ID = 'zk7tosDYaLU';

function formatHHmmLocal(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * لحظة بداية موعد مجموعة الفعلية. date/start_time بمنطقة المعلم لا المتصفح —
 * starts_at (من الباك) هو المرجع؛ البناء المحلي احتياط لاستجابة قديمة بلا starts_at.
 */
function scheduleStart(sch) {
  if (sch.starts_at) return new Date(sch.starts_at);
  if (!sch.date || !sch.start_time) return null;
  const [h, m] = sch.start_time.split(':').map(Number);
  const start = new Date(`${sch.date}T00:00:00`);
  start.setHours(h, m, 0, 0);
  return start;
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * جماعية: جدول ثابت وضعه المعلم — الطالب ينضم مباشرة بلا اختيار، ثم يُحوَّل لدفع Stripe.
 * فردية: المعلم حدّد فقط الأيام المتاحة (بلا وقت) — الطالب يختار يوماً ووقتاً
 *   مستقلَّين لكل جلسة من جلسات الباقة على حدة (وليس موعداً واحداً يتكرر أسبوعياً
 *   تلقائياً على الجميع)، ويقدّم طلب حجز واحد يحمل كل هذه المواعيد معاً. لا دفع
 *   الآن — بانتظار موافقة المعلم، وبعدها يظهر زر "أكمل الدفع" في لوحة الطالب.
 * باقة الحملة: نوافذ (يوم + ساعات) حددها الأدمن — لا تُعرض إلا الأوقات داخلها، ولا موافقة
 *   للمعلم: الحجز يُثبَّت فوراً ويُحوَّل الطالب للدفع مباشرة.
 */
export function BookingWidget({ selectedPackage, bare = false }) {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const currency = useCurrencyStore((s) => s.currency);
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
  // كود خصم اختياري يُبلَّغ به الطالب خارج المنصة — يُرسَل مع طلب الحجز، والتحقق
  // الفعلي من صلاحيته (باقة/انتهاء/استنفاد) يتم بالكامل على الباك اند عند الإرسال.
  const [couponCode, setCouponCode] = useState('');
  const [guideVideoId, setGuideVideoId] = useState(null);

  const requestIndividual = useRequestIndividualBooking(selectedPackage?.id);
  const createGroup = useCreateGroupBooking(selectedPackage?.id);
  const checkout = useCheckoutBooking();
  const isCampaign = !!selectedPackage?.isCampaign && !isGroup;
  const scheduleTimezone = selectedPackage?.scheduleTimezone ?? 'UTC';

  // الزائر يحجز الجلسة المجانية بلا حساب: اسمه وبريده، ثم رمز تحقق يصله على البريد
  const isGuestTrial = !isAuthenticated && !!selectedPackage?.isTrial && !isGroup;
  const [guest, setGuest] = useState({ name: '', email: '', code: '' });
  const sendGuestCode = useSendGuestCode(selectedPackage?.id);
  const bookGuestTrial = useBookGuestTrial(selectedPackage?.id);
  const guestCodeSent = sendGuestCode.isSuccess;
  const guestIdentityValid = guest.name.trim().length > 1 && EMAIL_PATTERN.test(guest.email.trim());

  // حساب حملة لم يُحوَّل: يرى الباقات العادية المدفوعة ولا يحجزها (الباك يرفض أيضاً)
  const blockedForCampaign =
    isAuthenticated &&
    user?.account_type === 'campaign' &&
    !!selectedPackage &&
    !selectedPackage.isTrial &&
    !selectedPackage.isCampaign;

  // باقة جديدة (أو عدد جلسات مختلف) → إعادة تصفير كامل التقدّم السابق، بما فيه
  // حالة الطلب (خطأ/نجاح) — وإلا تبقى رسالة خطأ باقةٍ ظاهرةً داخل باقة أخرى لا
  // علاقة لها بها. mutation في React Query يحتفظ بآخر نتيجة حتى reset() صريح.
  useEffect(() => {
    setSlots(Array(sessionsCount).fill(null));
    setActiveIndex(0);
    setSelectedDate(null);
    setSelectedTime('');
    setCouponCode('');
    setGuest({ name: '', email: '', code: '' });
    requestIndividual.reset();
    createGroup.reset();
    checkout.reset();
    sendGuestCode.reset();
    bookGuestTrial.reset();
    // reset مرجعياً ثابتة في React Query — لا داعي لإدراجها في التبعيّات
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackage?.id, sessionsCount]);

  // عرض استشاري فقط قبل الإرسال — الفحص الملزم الفعلي على الباك اند وقت
  // الحجز (ScheduleConflictService)، وقد يتغير الوضع بين هذا الاستعلام
  // ولحظة الإرسال الفعلية بسباق واقعي (معلم يوافق على حجز آخر في الأثناء).
  const { data: busySlots } = usePackageBusySlots(selectedPackage?.id, selectedDate ? toISODate(selectedDate) : null);
  const durationMinutes = selectedPackage?.durationPerSession ?? 60;

  // الطالب نفسه قد يكون لديه جلسة أخرى (من دورة، أو باقة أخرى فردية/جماعية) في
  // نفس الوقت — يشمل getCalendarSessions كل الأنواع معاً، على عكس busySlots
  // أعلاه (خاص بمعلم هذه الباقة فقط). نفس تحفظ "استشاري فقط" ينطبق هنا أيضاً.
  // للطالب فقط: GET /class-sessions يُرجع للأدمن كل جلسات النظام (وللمعلم جلساته
  // هو) — ليست جدولاً خاصاً به ليتعارض معه.
  const { data: studentSessions } = useCalendarSessions({ enabled: isAuthenticated && user?.role === 'student' });
  const myUpcomingSessions = user?.role === 'student' ? studentSessions : undefined;

  const selectedTimeConflict = useMemo(() => {
    if (!selectedDate || !selectedTime || !busySlots?.length) return null;
    const [h, m] = selectedTime.split(':').map(Number);
    const start = new Date(selectedDate);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    return busySlots.find((slot) => rangesOverlap(start, end, slot.start, slot.end)) ?? null;
  }, [selectedDate, selectedTime, busySlots, durationMinutes]);

  const ownTimeConflict = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;
    const [h, m] = selectedTime.split(':').map(Number);
    const start = new Date(selectedDate);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return findOwnConflict(myUpcomingSessions, start, end);
  }, [selectedDate, selectedTime, myUpcomingSessions, durationMinutes]);

  // Per-slot status for the availability grid — mirrors the two conflict memos
  // above but evaluated for an arbitrary "HH:mm" against the selected date.
  const fitsWindows = useCallback(
    (start) => fitsCampaignWindows(start, durationMinutes, schedules, scheduleTimezone),
    [durationMinutes, schedules, scheduleTimezone],
  );

  // باقة الحملة: النافذة بمنطقة الباقة قد تقع في يوم أسبوع آخر بتوقيت المتصفح — اليوم
  // متاح إن وُجد فيه وقت واحد على الأقل داخل نافذة. مخزَّن لكل تاريخ (يُستدعى لكل خلية).
  const isCampaignDateAllowed = useMemo(() => {
    if (!isCampaign) return undefined;
    const cache = new Map();
    return (date) => {
      const key = toISODate(date);
      if (!cache.has(key)) {
        cache.set(
          key,
          FULL_DAY_SLOT_TIMES.some(({ hour, minute }) => {
            const start = new Date(date);
            start.setHours(hour, minute, 0, 0);
            return fitsWindows(start);
          }),
        );
      }
      return cache.get(key);
    };
  }, [isCampaign, fitsWindows]);

  const slotStatus = useCallback(
    (time) => {
      if (!selectedDate) return 'available';
      const [h, m] = time.split(':').map(Number);
      const start = new Date(selectedDate);
      start.setHours(h, m, 0, 0);
      if (isCampaign && !fitsWindows(start)) return 'hidden';
      if (start.getTime() <= Date.now()) return 'past';
      const end = new Date(start.getTime() + durationMinutes * 60000);
      if (busySlots?.some((slot) => rangesOverlap(start, end, slot.start, slot.end))) return 'busy';
      if (findOwnConflict(myUpcomingSessions, start, end)) return 'own';
      return 'available';
    },
    [selectedDate, durationMinutes, busySlots, myUpcomingSessions, isCampaign, fitsWindows],
  );

  // Group packages have no per-date picker (the teacher's fixed dates are
  // already set) — every one of them needs checking up front, both against
  // the teacher's busy times and the student's own existing sessions, before
  // the "join" button can be enabled at all.
  // اليوم بتقويم المتصفح (لا sch.date — ذاك يوم المعلم) — نفس اليوم الذي يجلبه
  // busy-slots بعد إرسال منطقة المتصفح معه.
  const groupDatesISO = useMemo(
    () => (isGroup ? [...new Set(schedules.map(scheduleStart).filter(Boolean).map(toISODate))] : []),
    [isGroup, schedules]
  );
  const { data: groupBusyByDate } = usePackageBusySlotsForDates(selectedPackage?.id, groupDatesISO);

  // تعارض جدول المعلم يمنع الانضمام (الباك يرفضه). تعارض جدول الطالب نفسه تحذير
  // فقط — موعد المجموعة ثابت لا يختاره، والباك يسمح بالانضمام رغمه (joinGroupPackage).
  const { teacherConflictId, ownConflictIds } = useMemo(() => {
    const result = { teacherConflictId: null, ownConflictIds: new Set() };
    if (!isGroup) return result;
    for (const sch of schedules) {
      const start = scheduleStart(sch);
      if (!start) continue;
      const end = new Date(start.getTime() + durationMinutes * 60000);

      const busy = groupBusyByDate?.find((d) => d.dateISO === toISODate(start))?.busySlots ?? [];
      if (result.teacherConflictId === null && busy.some((slot) => rangesOverlap(start, end, slot.start, slot.end))) {
        result.teacherConflictId = sch.id;
      }
      if (findOwnConflict(myUpcomingSessions, start, end)) {
        result.ownConflictIds.add(sch.id);
      }
    }
    return result;
  }, [isGroup, schedules, groupBusyByDate, myUpcomingSessions, durationMinutes]);

  const isEditingSlot = activeIndex < sessionsCount;
  const filledCount = slots.filter(Boolean).length;
  const allSlotsFilled = filledCount === sessionsCount;
  const canSubmitIndividual = allSlotsFilled;
  // Defense in depth — the package card already disables selecting a group
  // package whose last dated session has passed, but a stale
  // `selectedPackage` shouldn't be submittable either.
  const canSubmitGroup =
    Boolean(selectedPackage) && schedules.length > 0 && !isPastDate(lastScheduleDate(schedules)) && teacherConflictId === null;
  const { isRedirecting, goToCheckout } = useCheckoutRedirect();
  const isPending =
    requestIndividual.isPending ||
    createGroup.isPending ||
    checkout.isPending ||
    sendGuestCode.isPending ||
    bookGuestTrial.isPending ||
    isRedirecting;
  const isSuccess = requestIndividual.isSuccess || createGroup.isSuccess || bookGuestTrial.isSuccess;
  const canSubmitGuest = allSlotsFilled && guestIdentityValid && (!guestCodeSent || /^\d{6}$/.test(guest.code));
  const submitError = requestIndividual.error ?? createGroup.error ?? checkout.error ?? bookGuestTrial.error ?? sendGuestCode.error;

  const redirectToCheckout = (data) => {
    if (!data?.checkout_url) return;
    goToCheckout(
      {
        value: data.booking?.amount_paid,
        target: data.booking?.id && `booking-${data.booking.id}`,
        contentCategory: 'booking',
      },
      data.checkout_url,
    );
  };

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleSelectDate = (date) => {
    if (isCampaignDateAllowed ? !isCampaignDateAllowed(date) : !allowedDays.includes(date.getDay())) return;
    setSelectedDate(date);
  };

  const firstEmptyIndex = (list) => {
    const idx = list.findIndex((s) => !s);
    return idx === -1 ? list.length : idx;
  };

  const handleConfirmSlot = () => {
    if (!selectedDate || !selectedTime || selectedTimeConflict || ownTimeConflict) return;
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
    if (isGuestTrial) {
      if (!canSubmitGuest) return;
      if (!guestCodeSent) {
        sendGuestCode.mutate(guest.email.trim());
        return;
      }
      bookGuestTrial.mutate({
        email: guest.email.trim(),
        code: guest.code,
        name: guest.name.trim(),
        slots: slots.map((s) => ({ date: toISODate(s.date), start_time: s.time })),
      });
      return;
    }
    if (blockedForCampaign) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (isGroup) {
      if (!canSubmitGroup) return;
      createGroup.mutate(couponCode.trim() || undefined, { onSuccess: redirectToCheckout });
      return;
    }
    if (!canSubmitIndividual) return;
    requestIndividual.mutate(
      {
        slots: slots.map((s) => ({ date: toISODate(s.date), start_time: s.time })),
        couponCode: couponCode.trim() || undefined,
      },
      {
        // باقة الحملة بلا موافقة المعلم: الحجز pending_payment فوراً — للدفع مباشرة. إن فشل جلب
        // رابط الدفع يبقى الحجز قائماً ويكمله الطالب من لوحته خلال مهلة الدفع.
        onSuccess: (booking) => {
          if (booking?.status !== 'pending_payment') return;
          checkout.mutate(booking.id, {
            onSuccess: (data) => redirectToCheckout({ ...data, booking }),
          });
        },
      },
    );
  };

  return (
    <div className={bare ? 'flex flex-col gap-5' : 'flex h-fit flex-col gap-5 rounded-card bg-white p-5 shadow-card lg:sticky lg:top-24'}>
      {!bare && <h2 className="text-start font-bold text-ink">{t('booking.title')}</h2>}

      <div className="flex flex-col gap-2">
        {[
          { id: BOOKING_GUIDE_YOUTUBE_ID, label: t('booking.howToBookVideo') },
          { id: PAYMENT_GUIDE_YOUTUBE_ID, label: t('booking.howToPayVideo') },
        ].map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setGuideVideoId(video.id)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm font-bold text-primary hover:bg-primary/10"
          >
            <PlayCircle size={18} />
            {video.label}
          </button>
        ))}
      </div>
      <YoutubeModal youtubeId={guideVideoId} onClose={() => setGuideVideoId(null)} />

      {/* Selected package */}
      <div>
        <h3 className="mb-2 text-start text-sm font-bold text-ink">{t('booking.selectedPackage')}</h3>
        {selectedPackage ? (
          <div className="flex items-center justify-between rounded-2xl border border-line p-3">
            <span className="text-xl font-bold text-primary">
              {selectedPackage.isTrial ? t('teacher.freePackage') : formatPrice(selectedPackage.price, currency)}
            </span>
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
              {schedules.map((s) => {
                const hasConflict = teacherConflictId !== null && teacherConflictId === s.id;
                const hasOwnConflict = !hasConflict && ownConflictIds.has(s.id);
                const start = scheduleStart(s);
                return (
                  <li
                    key={s.id ?? s.date}
                    className={`flex items-center justify-end gap-2 rounded-xl border px-3 py-2 text-sm ${
                      hasConflict
                        ? 'border-[#FF383C] bg-[#FDF0F0] text-[#FF383C]'
                        : hasOwnConflict
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-line text-ink'
                    }`}
                  >
                    {/* بتوقيت الطالب لا المعلم — نفس اللحظة التي فُحص تعارضها أعلاه */}
                    {start ? `${formatDate(start)} · ${formatHHmmLocal(start)}` : `${formatDate(s.date)} · ${formatTime(s.start_time)}`}
                    <CalendarDays
                      size={14}
                      className={hasConflict ? 'text-[#FF383C]' : hasOwnConflict ? 'text-amber-600' : 'text-ink-soft'}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {teacherConflictId !== null && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#FF383C]">
              <AlertTriangle size={13} />
              {t('booking.timeUnavailable')}
            </p>
          )}

          {ownConflictIds.size > 0 && (
            <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{t('booking.groupOwnConflictWarning')}</span>
            </div>
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
              {sessionsCount > 1 && (
                <p className="text-start text-xs font-medium text-primary">
                  {t('booking.sessionLabel')} {activeIndex + 1} {t('booking.ofLabel')} {sessionsCount}
                </p>
              )}

              {allowedDays.length === 0 ? (
                <p className="py-2 text-center text-sm text-ink-soft">{t('booking.noSlotsAvailable')}</p>
              ) : (
                <AvailabilityCalendar
                  allowedDays={allowedDays}
                  isDateAllowed={isCampaignDateAllowed}
                  slotTimes={isCampaign ? FULL_DAY_SLOT_TIMES : undefined}
                  viewDate={viewDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  today={today}
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    handleSelectDate(date);
                    setSelectedTime('');
                  }}
                  selectedTime={selectedTime}
                  onSelectTime={setSelectedTime}
                  slotStatus={slotStatus}
                />
              )}

              {selectedDate && selectedTime && (
                <button
                  type="button"
                  disabled={!!(selectedTimeConflict || ownTimeConflict)}
                  onClick={handleConfirmSlot}
                  className="w-full rounded-xl border-2 border-primary bg-primary/5 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:border-line disabled:bg-line/20 disabled:text-ink-soft"
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

      {/* كود خصم اختياري — يُبلَّغ به الطالب خارج المنصة (اتصال/رسالة). لا معنى له على باقة مجانية */}
      {selectedPackage && !selectedPackage.isTrial && !selectedPackage.isCampaign && !blockedForCampaign && (
        <label className="flex flex-col gap-1.5 text-start">
          <span className="text-sm font-bold text-ink">{t('booking.couponLabel')}</span>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder={t('booking.couponPlaceholder')}
            dir="ltr"
            className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      )}

      {isGuestTrial && allSlotsFilled && !isSuccess && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-start">
          <div>
            <h3 className="text-sm font-bold text-ink">{t('guestTrial.title')}</h3>
            <p className="mt-0.5 text-xs text-ink-soft">{t('guestTrial.subtitle')}</p>
          </div>
          <input
            type="text"
            maxLength={150}
            value={guest.name}
            disabled={guestCodeSent}
            onChange={(e) => setGuest((g) => ({ ...g, name: e.target.value }))}
            placeholder={t('guestTrial.namePlaceholder')}
            className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
          <input
            type="email"
            dir="ltr"
            maxLength={150}
            value={guest.email}
            disabled={guestCodeSent}
            onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
            placeholder={t('guestTrial.emailPlaceholder')}
            className="w-full rounded-xl border border-line bg-surface p-3 text-left text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
          {guestCodeSent && (
            <>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Mail size={13} />
                {t('guestTrial.codeSent')}
              </p>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                maxLength={6}
                value={guest.code}
                onChange={(e) => setGuest((g) => ({ ...g, code: e.target.value.replace(/\D/g, '') }))}
                placeholder={t('guestTrial.codePlaceholder')}
                className="w-full rounded-xl border border-line bg-surface p-3 text-center text-lg tracking-[0.5em] text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => {
                  sendGuestCode.reset();
                  bookGuestTrial.reset();
                  setGuest((g) => ({ ...g, code: '' }));
                }}
                className="self-start text-xs font-medium text-primary hover:opacity-70"
              >
                {t('guestTrial.changeEmail')}
              </button>
            </>
          )}
          <p className="text-xs text-ink-soft">
            {t('guestTrial.haveAccount')}{' '}
            <Link to="/login" state={{ from: location }} className="font-medium text-primary hover:opacity-70">
              {t('guestTrial.login')}
            </Link>
          </p>
        </div>
      )}

      {blockedForCampaign && (
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-start text-xs font-semibold text-amber-800">
          <span className="flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            {t('campaign.convertToBook')}
          </span>
          <Link to="/campaign-offers" className="self-start font-bold text-primary hover:opacity-70">
            {t('campaign.completeProfileToBook')}
          </Link>
        </div>
      )}

      {submitError && <ApiErrorList error={submitError} labelFor={() => null} />}

      <PolicyNotice policySlug="student-policy">{t('policyNotice.payment')}</PolicyNotice>

      {/* Total + CTA */}
      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-xl font-bold text-primary">
          {selectedPackage?.isTrial ? t('teacher.freePackage') : formatPrice(selectedPackage?.price ?? 0, currency)}
        </span>
        <span className="text-sm font-bold text-ink">{t('booking.total')}</span>
      </div>

      {isSuccess ? (
        <div className="flex items-center justify-center gap-2 rounded-btn bg-success-light py-3 text-sm font-bold text-success">
          <CheckCircle2 size={16} />{' '}
          {isGroup
            ? t('booking.success')
            : isGuestTrial
              ? t('guestTrial.success')
              : isCampaign
                ? checkout.isError
                  ? t('campaign.bookedPayFromDashboard')
                  : t('campaign.redirectingToPayment')
                : t('booking.requestSuccess')}
        </div>
      ) : (
        <Button
          className="w-full justify-center"
          disabled={
            (isGuestTrial ? !canSubmitGuest : isGroup ? !canSubmitGroup : !canSubmitIndividual) ||
            blockedForCampaign ||
            isPending
          }
          onClick={handleSubmit}
        >
          {isPending
            ? t('booking.submitting')
            : isGuestTrial
              ? !allSlotsFilled
                ? t('guestTrial.pickTimeFirst')
                : guestCodeSent
                  ? t('guestTrial.confirm')
                  : t('guestTrial.sendCode')
            : !isAuthenticated
              ? t('booking.loginToBook')
              : isGroup
                ? t('booking.joinGroup')
                : isCampaign
                  ? t('campaign.bookAndPay')
                  : t('booking.sendRequest')}
        </Button>
      )}
    </div>
  );
}
