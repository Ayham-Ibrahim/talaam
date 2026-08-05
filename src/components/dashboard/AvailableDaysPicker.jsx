import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAvailabilityDays } from '@/hooks/useAvailability';
import { useT } from '@/hooks/useT';
import { Skeleton } from '@/components/ui';

/**
 * الباقة الفردية لا تملك تاريخاً/وقتاً — المعلم يختار مجموعة فرعية من أيام
 * توفّره العامة (availability_slots) فقط. الطالب لاحقاً يحدد التاريخ والوقت
 * ضمن هذه الأيام ويقدّم طلب حجز يوافق عليه المعلم.
 */
export function AvailableDaysPicker({ schedules, onChange }) {
  const t = useT();
  const { user } = useAuth();
  const weekdays = t('booking.weekdays');
  const teacherId = user?.teacher?.id;

  const { data: availableDays, isLoading } = useAvailabilityDays(teacherId);

  const selectedDays = schedules.map((s) => s.day_of_week);

  const toggleDay = (dayOfWeek) => {
    if (selectedDays.includes(dayOfWeek)) {
      onChange(schedules.filter((s) => s.day_of_week !== dayOfWeek));
    } else {
      onChange([...schedules, { day_of_week: dayOfWeek }]);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!availableDays || availableDays.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-ink-soft">
        {t('dashboard.addPackage.noAvailabilityDays')}{' '}
        <Link to="/dashboard/teacher/settings" className="font-bold text-primary hover:underline">
          {t('dashboard.addPackage.goToSettings')}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {availableDays.map(({ dayOfWeek }) => (
        <button
          key={dayOfWeek}
          type="button"
          onClick={() => toggleDay(dayOfWeek)}
          className={`rounded-2xl border-2 px-4 py-4 text-sm font-bold transition-colors ${
            selectedDays.includes(dayOfWeek)
              ? 'border-primary bg-primary text-white'
              : 'border-line bg-white text-ink hover:border-primary'
          }`}
        >
          {weekdays[dayOfWeek]}
        </button>
      ))}
    </div>
  );
}
