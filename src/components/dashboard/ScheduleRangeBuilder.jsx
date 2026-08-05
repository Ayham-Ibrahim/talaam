import { Plus, Trash2 } from 'lucide-react';
import { SmoothSelect } from './SmoothSelect';
import { useT } from '@/hooks/useT';

/** day_of_week matches the backend's Carbon convention: 0 = Sunday ... 6 = Saturday */
const DAY_OPTIONS = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
];

/** كل جلسة ساعة واحدة دائماً (نفس افتراض تسعير الباقات) — end_time يُحتسَب تلقائياً بدل إدخاله */
function addOneHour(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Used by courses: {day_of_week, start_time, end_time} — a recurring weekday
 * schedule. end_time is derived from start_time (+1h) since every session is
 * exactly one hour, not entered separately. Packages have their own dedicated
 * pickers (AvailableDaysPicker for individual, GroupSessionDatesPicker for group).
 */
export function ScheduleRangeBuilder({ schedules, onChange }) {
  const t = useT();

  const addRow = () => onChange([...schedules, { day_of_week: 0, start_time: '', end_time: '' }]);
  const removeRow = (index) => onChange(schedules.filter((_, i) => i !== index));
  const updateRow = (index, patch) => onChange(schedules.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const updateStartTime = (index, startTime) => updateRow(index, { start_time: startTime, end_time: addOneHour(startTime) });

  return (
    <div className="flex flex-col gap-4">
      {schedules.map((row, index) => (
        <div key={index} className="flex flex-wrap items-end gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4">
          <div className="min-w-[160px] flex-1">
            <SmoothSelect
              label={t('dashboard.addPackage.scheduleDay')}
              value={row.day_of_week}
              onChange={(v) => updateRow(index, { day_of_week: Number(v) })}
              options={DAY_OPTIONS}
              placeholder={t('dashboard.addPackage.selectPlaceholder')}
            />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <label className="text-sm font-semibold text-primary">{t('dashboard.addPackage.scheduleStart')}</label>
            <input
              type="time"
              value={row.start_time}
              onChange={(e) => updateStartTime(index, e.target.value)}
              className="rounded-lg border border-[#E3E3E3] px-3 py-3 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => removeRow(index)}
            aria-label={t('dashboard.addPackage.scheduleRemove')}
            className="flex h-11 w-11 items-center justify-center rounded-full text-accent-pink hover:bg-accent-pink/10"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="flex w-fit items-center gap-1.5 rounded-xl border border-dashed border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
      >
        <Plus size={16} />
        {t('dashboard.addPackage.scheduleAdd')}
      </button>
    </div>
  );
}
