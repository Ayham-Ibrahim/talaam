import { useMemo, useState } from 'react';
import { CalendarClock, ChevronRight, ChevronLeft } from 'lucide-react';
import { useT } from '@/hooks/useT';

/**
 * معاينة سريعة لأوقات التوفر — بيانات وهمية بالكامل مؤقتاً. الباك اند لا
 * يُعرِّض حالياً أوقاتاً تفصيلية علنية لكل يوم بمعزل عن باقة محدَّدة (فقط
 * أيام الأسبوع المسموحة داخل كل باقة فردية عبر BookingWidget، أو مواعيد
 * محدَّدة للباقات الجماعية) — ستُستبدَل هذه المعاينة ببيانات حقيقية فور بناء
 * endpoint عام لتوفر المعلم الأسبوعي. الترتيب يطابق t('booking.weekdays')
 * المستخدَم في بقية الصفحة (الأحد أولاً، يوافق JS Date.getDay()).
 */
const FAKE_SLOTS_BY_DAY = [
  ['9:00 ص', '11:00 ص', '5:00 م'],
  ['9:00 ص', '12:00 م', '4:00 م'],
  ['11:00 ص', '2:00 م', '5:00 م'],
  ['9:00 ص', '2:00 م', '6:00 م'],
  ['9:00 ص', '2:00 م', '6:00 م'],
  [],
  ['9:00 ص', '4:00 م', '8:00 م'],
];

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

/** شبكة تقويم بصرية (زخرفية فقط، بلا تفاعل حجز فعلي) — الشهر الحالي فقط، يبرز يوم اليوم */
function MiniCalendar() {
  const t = useT();
  const today = useMemo(() => new Date(), []);
  const monthLabel = `${ARABIC_MONTHS[today.getMonth()]} ${today.getFullYear()}`;

  const cells = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list = Array.from({ length: firstDay }, () => null);
    for (let d = 1; d <= daysInMonth; d++) list.push(d);
    return list;
  }, [today]);

  return (
    <div className="rounded-2xl border border-line/60 bg-canvas p-4">
      <div className="flex items-center justify-between">
        <button type="button" className="text-ink-soft hover:text-ink" aria-label={t('booking.nextMonth')}>
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-ink">{monthLabel}</span>
        <button type="button" className="text-ink-soft hover:text-ink" aria-label={t('booking.prevMonth')}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {t('booking.weekdays').map((d) => (
          <span key={d} className="text-[10px] font-bold text-ink-soft">{d[0]}</span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
              day === today.getDate()
                ? 'bg-primary font-bold text-white'
                : day
                  ? 'text-ink-soft'
                  : ''
            }`}
          >
            {day ?? ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WeeklyAvailabilityPreview({ weekdays }) {
  const t = useT();
  const todayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  return (
    <div className="mt-8 rounded-2xl bg-white p-5 shadow-card">
      <h3 className="flex items-center gap-2 text-start font-bold text-ink">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success-light text-success">
          <CalendarClock size={17} />
        </span>
        {t('teacher.availability.title')}
      </h3>
      <p className="mt-1 text-start text-xs text-ink-soft">{t('teacher.availability.hint')}</p>

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="flex flex-wrap gap-1.5">
            {weekdays.map((day, i) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(i)}
                className={`rounded-pill px-3.5 py-2 text-xs font-bold transition-colors sm:text-sm ${
                  selectedDay === i ? 'bg-primary text-white' : 'bg-canvas text-ink-soft hover:bg-line/60'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(FAKE_SLOTS_BY_DAY[selectedDay] ?? []).length === 0 ? (
              <span className="text-sm text-ink-soft">—</span>
            ) : (
              FAKE_SLOTS_BY_DAY[selectedDay].map((time) => (
                <span
                  key={time}
                  className="rounded-pill bg-primary-light px-3.5 py-2 text-sm font-semibold text-primary"
                >
                  {time}
                </span>
              ))
            )}
          </div>
        </div>

        <MiniCalendar />
      </div>
    </div>
  );
}
