import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { GroupSessionDatesPicker } from './GroupSessionDatesPicker';
import { AvailableDaysPicker } from './AvailableDaysPicker';
import { useT } from '@/hooks/useT';

/**
 * جماعية: المعلم يختار تاريخ كل جلسة صراحةً من روزنامة — عدد التواريخ يجب أن
 *   يساوي sessions_count بالضبط، بلا تكرار أسبوعي تلقائي. الطالب ينضم مباشرة بلا اختيار.
 * فردية: لا جدول زمني على مستوى الباقة إطلاقاً — فقط مجموعة فرعية من أيام توفّر
 *   المعلم العامة (availability_slots). الطالب يحدد التاريخ/الوقت لاحقاً عبر طلب
 *   حجز يوافق عليه المعلم (BookingService::requestIndividualBooking).
 */
/** أول رسالة خطأ عائدة من الباك اند لأي مفتاح schedules أو schedules.* — بصرف النظر عن ترتيبها */
function firstScheduleServerError(serverErrors) {
  if (!serverErrors) return null;
  const key = Object.keys(serverErrors).find((k) => k === 'schedules' || k.startsWith('schedules.'));
  return key ? serverErrors[key]?.[0] ?? null : null;
}

export function PackageWizardScheduling({ data, onChange, onNext, onBack, serverErrors }) {
  const t = useT();
  const [touched, setTouched] = useState(false);
  const isIndividual = data.session_format === 'individual';
  const sessionsCount = Number(data.sessions_count) || 0;

  const isValid = isIndividual
    ? data.schedules.length > 0
    : data.schedules.length === sessionsCount && data.schedules.every((s) => s.start_time);

  const scheduleError = firstScheduleServerError(serverErrors) ?? (touched && !isValid ? t('dashboard.addPackage.scheduleRequired') : null);

  const handleNext = () => {
    setTouched(true);
    if (!isValid) return;
    onNext();
  };

  return (
    <div className="mt-8 flex flex-col gap-4">
      <p className="flex items-center gap-2 text-sm text-primary">
        <CalendarClock size={16} />
        {t(isIndividual ? 'dashboard.addPackage.individualScheduleHint' : 'dashboard.addPackage.groupScheduleHint')}
      </p>
      {isIndividual ? (
        <AvailableDaysPicker schedules={data.schedules} onChange={(schedules) => onChange({ schedules })} />
      ) : (
        <GroupSessionDatesPicker
          schedules={data.schedules}
          onChange={(schedules) => onChange({ schedules })}
          sessionsCount={sessionsCount}
        />
      )}
      {scheduleError && <p className="text-sm text-accent-pink">{scheduleError}</p>}

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
