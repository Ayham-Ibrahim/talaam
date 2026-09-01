import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CalendarCheck, Globe } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TimezoneField } from '@/components/dashboard/TimezoneField';
import { ApiErrorList, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useAvailabilityDays, useAddAvailabilityDay, useRemoveAvailabilityDay } from '@/hooks/useAvailability';
import { useT } from '@/hooks/useT';

const DAY_KEYS = [0, 1, 2, 3, 4, 5, 6];

const PROFILE_FIELD_LABELS = { timezone: 'المنطقة الزمنية' };
const profileErrorLabel = (path) => PROFILE_FIELD_LABELS[path] ?? path;

/**
 * أيام التوفر العامة — بلا أوقات. تُستخدم كمصدر الأيام التي يختار المعلم
 * منها عند إنشاء باقة فردية (see PackageWizardScheduling، mode="availability-days").
 */
export function TeacherSettingsPage() {
  const t = useT();
  const { user } = useAuth();
  const weekdays = t('booking.weekdays');
  const teacherId = user?.teacher?.id;

  const { data: days, isLoading, isError, refetch } = useAvailabilityDays(teacherId);
  const addDay = useAddAvailabilityDay(teacherId);
  const removeDay = useRemoveAvailabilityDay(teacherId);
  const updateProfile = useUpdateProfile();

  const [timezoneForm, setTimezoneForm] = useState({ timezone: '', timezoneAuto: true });

  useEffect(() => {
    if (user) {
      setTimezoneForm({ timezone: user.timezone ?? '', timezoneAuto: user.timezone_auto ?? true });
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const toggleDay = (dayOfWeek) => {
    const existing = days?.find((d) => d.dayOfWeek === dayOfWeek);
    if (existing) {
      removeDay.mutate(existing.id);
    } else {
      addDay.mutate(dayOfWeek);
    }
  };

  const handleSaveTimezone = () => {
    updateProfile.mutate({
      name: user.name,
      timezone: timezoneForm.timezone || null,
      timezone_auto: timezoneForm.timezoneAuto,
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* مخفي بطلب صريح — المنطقة الزمنية تبقى تلقائية دوماً (اكتشاف صامت من App.jsx عبر
            useSyncTimezone) بلا خيار تثبيت يدوي ظاهر للمعلم. الكتلة كاملة (الحالة والدالة أعلاه
            ما زالت موجودة بلا تغيير) أُبقيت هنا كتعليق لإعادة التفعيل لاحقاً بسهولة. */}
        {/* <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-bold text-ink">
            <Globe size={20} className="text-primary" />
            {t('studentSettings.timezoneLabel')}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{t('teacherSettings.timezoneHint')}</p>

          {updateProfile.isError && <ApiErrorList error={updateProfile.error} labelFor={profileErrorLabel} className="mt-4" />}

          <div className="mt-4">
            <TimezoneField
              timezone={timezoneForm.timezone}
              auto={timezoneForm.timezoneAuto}
              onChange={({ auto, timezone }) => setTimezoneForm({ timezoneAuto: auto, timezone })}
            />
          </div>

          <button
            type="button"
            disabled={updateProfile.isPending}
            onClick={handleSaveTimezone}
            className="mt-4 w-fit rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {updateProfile.isPending ? t('studentSettings.saving') : t('studentSettings.save')}
          </button>
        </div> */}

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-bold text-ink">
            <CalendarCheck size={20} className="text-primary" />
            {t('dashboard.availability.title')}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.availability.hint')}</p>

          {isError ? (
            <div className="mt-4">
              <ErrorState onRetry={refetch} />
            </div>
          ) : isLoading ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DAY_KEYS.map((dayOfWeek) => {
                const isActive = days?.some((d) => d.dayOfWeek === dayOfWeek);
                return (
                  <button
                    key={dayOfWeek}
                    type="button"
                    onClick={() => toggleDay(dayOfWeek)}
                    disabled={addDay.isPending || removeDay.isPending}
                    className={`rounded-2xl border-2 px-4 py-4 text-sm font-bold transition-colors disabled:opacity-50 ${
                      isActive
                        ? 'border-primary bg-primary text-white'
                        : 'border-line bg-white text-ink hover:border-primary'
                    }`}
                  >
                    {weekdays[dayOfWeek]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
