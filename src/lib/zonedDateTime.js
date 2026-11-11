/**
 * يحوّل "تاريخ + وقت" مُدخَلين كتوقيت حائط محلي (قيم <input type="date"> و
 * <input type="time"> الخام، بلا أي معلومة منطقة زمنية أصلاً) إلى اللحظة
 * الزمنية الصحيحة فعلياً — بافتراض أن المستخدم قصد ذلك التاريخ/الوقت بتوقيته
 * الخاص (IANA timezone، مثال: "Asia/Riyadh")، لا بتوقيت UTC ولا بتوقيت جهازه
 * المحلي الفعلي إن اختلف عن توقيت حسابه المضبوط.
 *
 * بلا هذا التحويل، كان يُرسَل نص خام بلا إزاحة (مثال: "2026-08-23T14:10:00")
 * والباك اند يُفسّره عبر Carbon::parse كأنه UTC فعلاً (بلا منطقة صريحة في
 * النص) — فيُخزَّن موعد مُزاح فعلياً بفارق التوقيت الكامل عن نية المستخدم
 * الحقيقية (مثال: طالب بتوقيت +3 يختار 2:10م فيُحفَظ الموعد وكأنه 2:10م UTC،
 * أي 5:10م بتوقيته هو فعلياً — وهذا بالضبط ما يظهر لاحقاً في كل مكان).
 *
 * @param {string} dateStr  "YYYY-MM-DD"
 * @param {string} timeStr  "HH:MM"
 * @param {string} [timeZone] اسم IANA — يُستخدم توقيت المتصفح الحالي افتراضياً إن أُغفل
 * @returns {string|null} ISO8601 بتوقيت UTC صحيح، أو null إن كانت المدخلات ناقصة/غير صالحة
 */
export function zonedWallTimeToUtcIso(dateStr, timeStr, timeZone) {
  if (!dateStr || !timeStr) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;

  const zone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // تخمين أولي: بافتراض أن هذه المكوّنات نفسها UTC، ثم تصحيحه بفارق التوقيت
  // الفعلي للمنطقة عند تلك اللحظة تقريباً — كافٍ عملياً حتى عبر حدود التوقيت
  // الصيفي/الشتوي (الفارق بين تخمين والفعلي عندها ساعة واحدة كحد أقصى، لا يغيّر
  // نتيجة حساب الإزاحة نفسها لأنها تُقرَأ من نفس اللحظة التقريبية لا الدقيقة).
  const guessUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offsetMs = getTimeZoneOffsetMs(new Date(guessUtcMs), zone);

  return new Date(guessUtcMs - offsetMs).toISOString();
}

/**
 * عكس zonedWallTimeToUtcIso: لحظة زمنية → قيمة <input type="datetime-local">
 * (YYYY-MM-DDTHH:mm) بتوقيت حائط `timeZone`، لا بتوقيت جهاز المتصفح.
 *
 * @param {string|Date} iso
 * @param {string} [timeZone] اسم IANA — توقيت المتصفح الحالي افتراضياً إن أُغفل
 * @returns {string} '' إن كانت القيمة غير صالحة
 */
export function toZonedInputValue(iso, timeZone) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || undefined,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .formatToParts(date)
    .reduce((acc, { type, value }) => {
      if (type !== 'literal') acc[type] = value;
      return acc;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/**
 * اسم المنطقة مع إزاحتها عند لحظة معيّنة (تتغير مع التوقيت الصيفي) — مثال: "Asia/Dubai (GMT+4)"
 *
 * @param {string} timeZone اسم IANA
 * @param {string|Date} [at] اللحظة التي تُحسب عندها الإزاحة — الآن افتراضياً
 */
export function formatTimeZoneLabel(timeZone, at = new Date()) {
  if (!timeZone) return '';
  try {
    const offset = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(new Date(at))
      .find((part) => part.type === 'timeZoneName')?.value;
    return offset ? `${timeZone} (${offset})` : timeZone;
  } catch {
    return timeZone;
  }
}

/** الفارق (بالمللي ثانية) بين UTC وتوقيت `timeZone` عند لحظة `date` الفعلية — موجب شرقاً */
function getTimeZoneOffsetMs(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
    .formatToParts(date)
    .reduce((acc, { type, value }) => {
      if (type !== 'literal') acc[type] = Number(value);
      return acc;
    }, {});

  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - date.getTime();
}
