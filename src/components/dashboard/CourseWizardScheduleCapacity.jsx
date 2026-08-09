import { useState } from 'react';
import { ScheduleRangeBuilder } from './ScheduleRangeBuilder';
import { useT } from '@/hooks/useT';

export function CourseWizardScheduleCapacity({ data, onChange, onNext, onBack }) {
  const t = useT();
  const [touched, setTouched] = useState(false);

  const datesValid = data.start_date !== '' && data.end_date !== '' && data.end_date >= data.start_date;
  const isValid =
    datesValid &&
    Number(data.total_sessions) > 0 &&
    Number(data.max_seats) > 0 &&
    data.schedules.length > 0 &&
    data.schedules.every((s) => s.start_time && s.end_time);

  const handleNext = () => {
    setTouched(true);
    if (!isValid) return;
    onNext();
  };

  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-start gap-1.5">
          <label className="text-sm font-semibold text-primary">{t('dashboard.addCourse.startDateLabel')}</label>
          <input
            type="date"
            value={data.start_date}
            onChange={(e) => onChange({ start_date: e.target.value })}
            className={`w-full rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink focus:outline-none ${
              touched && data.start_date === '' ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
            }`}
          />
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <label className="text-sm font-semibold text-primary">{t('dashboard.addCourse.endDateLabel')}</label>
          <input
            type="date"
            value={data.end_date}
            onChange={(e) => onChange({ end_date: e.target.value })}
            className={`w-full rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink focus:outline-none ${
              touched && !datesValid ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
            }`}
          />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-start gap-1.5">
          <label className="text-sm font-semibold text-primary">{t('dashboard.addCourse.totalSessionsLabel')}</label>
          <input
            type="number"
            min="1"
            max="500"
            value={data.total_sessions}
            onChange={(e) => onChange({ total_sessions: e.target.value })}
            className={`w-full rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink focus:outline-none ${
              touched && !(Number(data.total_sessions) > 0) ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
            }`}
          />
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <label className="text-sm font-semibold text-primary">{t('dashboard.addCourse.maxSeatsLabel')}</label>
          <input
            type="number"
            min="1"
            max="1000"
            value={data.max_seats}
            onChange={(e) => onChange({ max_seats: e.target.value })}
            className={`w-full rounded-lg border bg-white px-3 py-3 text-right text-sm text-ink focus:outline-none ${
              touched && !(Number(data.max_seats) > 0) ? 'border-accent-pink' : 'border-[#E3E3E3] focus:border-primary'
            }`}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-right text-base font-bold text-ink">{t('dashboard.addCourse.scheduleTitle')}</h3>
        <ScheduleRangeBuilder schedules={data.schedules} onChange={(schedules) => onChange({ schedules })} />
        {touched && data.schedules.length === 0 && (
          <p className="mt-2 text-sm text-accent-pink">{t('dashboard.addPackage.scheduleRequired')}</p>
        )}
      </div>

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
