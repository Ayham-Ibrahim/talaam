import { useNavigate, useLocation } from 'react-router-dom';
import { Award, Laptop, Package, FlaskConical, Video, CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCreateEnrollment } from '@/hooks/useEnrollment';
import { useT } from '@/hooks/useT';
import { useCurrencyStore } from '@/store';
import { formatPrice } from '@/lib/currency';
import { formatDate } from '@/lib/formatters';

function formatTime(t) {
  return t ? t.slice(0, 5) : t;
}

function FactRow({ active, icon: Icon, label }) {
  return (
    <li className="flex items-center justify-end gap-2 text-sm text-ink">
      {label}
      {active ? <CheckCircle2 size={16} className="text-success" /> : <XCircle size={16} className="text-ink-soft" />}
      <Icon size={15} className="text-ink-soft" />
    </li>
  );
}

/**
 * Enrolling in a course is a single fixed-schedule join, same shape as a group
 * package — the student never picks a date/time, only reviews the center's own
 * structured facts (certificate/materials/etc.) and confirms.
 */
export function CourseEnrollWidget({ selectedCourse }) {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const currency = useCurrencyStore((s) => s.currency);
  const weekdays = t('booking.weekdays');

  const schedules = selectedCourse?.schedules ?? [];
  const createEnrollment = useCreateEnrollment(selectedCourse?.id);

  const canSubmit = Boolean(selectedCourse);
  const isPending = createEnrollment.isPending;
  const isSuccess = createEnrollment.isSuccess;

  const handleSubmit = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!canSubmit) return;
    createEnrollment.mutate(undefined, {
      onSuccess: (data) => {
        if (data?.checkout_url) window.location.href = data.checkout_url;
      },
    });
  };

  return (
    <div className="flex h-fit flex-col gap-5 rounded-card bg-white p-5 shadow-card lg:sticky lg:top-24">
      <h2 className="text-start font-bold text-ink">{t('teacher.course.enrollTitle')}</h2>

      <div>
        <h3 className="mb-2 text-start text-sm font-bold text-ink">{t('teacher.course.selectedCourse')}</h3>
        {selectedCourse ? (
          <div className="flex items-center justify-between rounded-2xl border border-line p-3">
            <span className="text-xl font-bold text-primary">{formatPrice(selectedCourse.price, currency)}</span>
            <div className="text-start">
              <div className="text-sm font-semibold text-ink">{selectedCourse.title}</div>
              <div className="text-xs text-ink-soft">
                {formatDate(selectedCourse.startDate)} — {formatDate(selectedCourse.endDate)}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-3 text-center text-sm text-ink-soft">
            {t('teacher.course.chooseCoursePlaceholder')}
          </div>
        )}
      </div>

      {selectedCourse && (
        <div>
          <h3 className="mb-2 text-start text-sm font-bold text-ink">{t('teacher.course.factsTitle')}</h3>
          <ul className="flex flex-col gap-2 rounded-2xl border border-line p-3">
            <FactRow active={selectedCourse.hasCertificate} icon={Award} label={t('teacher.course.hasCertificate')} />
            <FactRow active={selectedCourse.requiresLaptop} icon={Laptop} label={t('teacher.course.requiresLaptop')} />
            <FactRow active={selectedCourse.materialsIncluded} icon={Package} label={t('teacher.course.materialsIncluded')} />
            <FactRow active={selectedCourse.hasPracticalExercises} icon={FlaskConical} label={t('teacher.course.hasPracticalExercises')} />
            <FactRow active={selectedCourse.sessionsRecorded} icon={Video} label={t('teacher.course.sessionsRecorded')} />
          </ul>
        </div>
      )}

      {selectedCourse && (
        <div>
          <h3 className="mb-2 text-start text-sm font-bold text-ink">{t('teacher.course.scheduleTitle')}</h3>
          {schedules.length === 0 ? (
            <p className="py-2 text-center text-sm text-ink-soft">{t('teacher.course.noSchedule')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {schedules.map((s) => (
                <li key={s.id} className="flex items-center justify-end gap-2 rounded-xl border border-line px-3 py-2 text-sm text-ink">
                  {weekdays[s.day_of_week]} · {formatTime(s.start_time)}–{formatTime(s.end_time)}
                  <CalendarDays size={14} className="text-ink-soft" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-xl font-bold text-primary">{formatPrice(selectedCourse?.price ?? 0, currency)}</span>
        <span className="text-sm font-bold text-ink">{t('booking.total')}</span>
      </div>

      {isSuccess ? (
        <div className="flex items-center justify-center gap-2 rounded-btn bg-success-light py-3 text-sm font-bold text-success">
          <CheckCircle2 size={16} /> {t('booking.success')}
        </div>
      ) : (
        <Button className="w-full justify-center" disabled={!canSubmit || isPending} onClick={handleSubmit}>
          {isPending ? t('booking.submitting') : !isAuthenticated ? t('booking.loginToBook') : t('teacher.course.enrollNow')}
        </Button>
      )}
    </div>
  );
}
