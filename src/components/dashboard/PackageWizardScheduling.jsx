import { useState } from 'react';
import { CalendarClock, Info } from 'lucide-react';
import { mockTeacherBookedSlots } from '@/mocks/teacherDashboard.mock';
import { useT } from '@/hooks/useT';

/* DOM order renders right-to-left, so "سبت" (first) lands rightmost, matching the design. */
const DAYS = [
  { key: 'saturday', labelKey: 'sat' },
  { key: 'sunday', labelKey: 'sun' },
  { key: 'monday', labelKey: 'mon' },
  { key: 'tuesday', labelKey: 'tue' },
  { key: 'wednesday', labelKey: 'wed' },
  { key: 'thursday', labelKey: 'thu' },
  { key: 'friday', labelKey: 'fri' },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08 .. 19

function formatHour(hour) {
  const period = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(h12).padStart(2, '0')} ${period}`;
}

function isBooked(day, hour) {
  return mockTeacherBookedSlots.some((s) => s.day === day && s.hour === hour);
}

export function PackageWizardScheduling({ data, onChange, onNext, onBack }) {
  const t = useT();
  const [touched, setTouched] = useState(false);
  const selected = data.selectedSlots;

  const toggleSlot = (day, hour) => {
    if (isBooked(day, hour)) return;
    const key = `${day}-${hour}`;
    const next = selected.includes(key) ? selected.filter((s) => s !== key) : [...selected, key];
    onChange({ selectedSlots: next });
  };

  const isValid = selected.length > 0;

  const handleNext = () => {
    setTouched(true);
    if (!isValid) return;
    onNext();
  };

  return (
    <div className="mt-8 flex flex-col gap-4">
      <p className="flex items-center gap-2 text-sm text-primary">
        <Info size={16} />
        {t('dashboard.addPackage.schedulingHintClick')}
      </p>
      <p className="flex items-center gap-2 text-sm text-primary">
        <CalendarClock size={16} />
        {t('dashboard.addPackage.schedulingHintRecurring')}
      </p>

      <div className="overflow-x-auto">
        <div className="grid min-w-[820px] grid-cols-8 gap-2">
          <div />
          {DAYS.map((day) => (
            <div key={day.key} className="rounded-xl bg-primary py-3 text-center text-sm font-bold text-white">
              {t(`dashboard.addPackage.days.${day.labelKey}`)}
            </div>
          ))}

          {HOURS.map((hour) => (
            <div key={hour} className="contents">
              <div className="flex items-center justify-start text-sm font-semibold text-ink">{formatHour(hour)}</div>
              {DAYS.map((day) => {
                const booked = isBooked(day.key, hour);
                const key = `${day.key}-${hour}`;
                const isSelected = selected.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={booked}
                    onClick={() => toggleSlot(day.key, hour)}
                    className={`flex h-14 items-center justify-center rounded-lg border text-center text-xs font-medium transition-colors ${
                      booked
                        ? 'cursor-not-allowed border-line bg-[#F2F2F7] text-ink-soft'
                        : isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-line bg-white hover:border-primary/40'
                    }`}
                  >
                    {booked && t('dashboard.addPackage.bookedByOtherPackage')}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {touched && !isValid && <p className="text-sm text-accent-pink">{t('dashboard.addPackage.schedulingRequired')}</p>}

      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-line px-8 py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
        >
          {t('dashboard.addPackage.back')}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-xl border-2 border-primary bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {t('dashboard.addPackage.next')}
        </button>
      </div>
    </div>
  );
}
