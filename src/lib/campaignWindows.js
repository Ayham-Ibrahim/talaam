/**
 * نوافذ باقة الحملة: يوم أسبوع + ساعات اختيارية (بلا ساعات = اليوم كله) يحددها الأدمن بمنطقة
 * الباقة (schedule_timezone). الجلسة مقبولة إن وقعت كاملة (بدايتها ونهايتها) داخل نافذة بعد
 * تحويل لحظتها لتلك المنطقة — نفس فحص الباك (BookingService::assertSlotsWithinCampaignWindows).
 */

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const formatters = new Map();

function formatterFor(timeZone) {
  if (!formatters.has(timeZone)) {
    formatters.set(
      timeZone,
      new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
    );
  }
  return formatters.get(timeZone);
}

function zonedParts(date, timeZone) {
  const parts = Object.fromEntries(formatterFor(timeZone).formatToParts(date).map((p) => [p.type, p.value]));
  return { weekday: WEEKDAYS[parts.weekday], minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/** "H:i" أو "H:i:s" → دقائق منذ منتصف الليل */
export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function fitsCampaignWindows(start, durationMinutes, windows, timeZone) {
  const { weekday, minutes } = zonedParts(start, timeZone);
  const end = minutes + durationMinutes;

  return windows.some(
    (w) =>
      Number(w.day_of_week) === weekday &&
      minutes >= (w.start_time ? timeToMinutes(w.start_time) : 0) &&
      end <= (w.end_time ? timeToMinutes(w.end_time) : 24 * 60),
  );
}

/**
 * ساعات توفّر المعلم الأسبوعية (teacher.availabilityTimes، راجع teacherService.js) — اختيارية
 * صراحة: يوم بلا أي نافذة يبقى متاحاً طوال اليوم (الافتراضي)، بخلاف نوافذ الحملة أعلاه التي
 * تستبعد أي يوم بلا نافذة خاصة فيه. نفس فحص الباك (BookingService::assertSlotsWithinTeacherAvailabilityHours).
 */
export function fitsTeacherAvailabilityHours(start, durationMinutes, availabilityTimes, timeZone) {
  const { weekday, minutes } = zonedParts(start, timeZone);
  const end = minutes + durationMinutes;

  const dayEntry = (availabilityTimes ?? []).find((d) => Number(d.dayOfWeek) === weekday);
  if (!dayEntry) return true;

  return dayEntry.slots.some((s) => minutes >= timeToMinutes(s.start) && end <= timeToMinutes(s.end));
}
