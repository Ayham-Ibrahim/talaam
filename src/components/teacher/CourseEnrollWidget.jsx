import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Award, Laptop, Package, FlaskConical, Video, CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { Button, ApiErrorList } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCreateEnrollment } from '@/hooks/useEnrollment';
import { useCalendarSessions } from '@/hooks/useDashboard';
import { useT } from '@/hooks/useT';
import { useCurrencyStore } from '@/store';
import { formatPrice } from '@/lib/currency';
import { formatDate, isPastDate } from '@/lib/formatters';
import { findRecurringConflict } from '@/lib/scheduleConflict';
import { enrollmentDetailsPath } from '@/components/teacher/CoursesSection';

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
export function CourseEnrollWidget({ selectedCourse, bare = false }) {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const currency = useCurrencyStore((s) => s.currency);
  const weekdays = t('booking.weekdays');

  const schedules = selectedCourse?.schedules ?? [];
  const elapsedSessions = selectedCourse?.elapsedSessions ?? [];
  const enrollment = selectedCourse?.myEnrollment ?? null;
  const isEnrollmentPending = enrollment?.status === 'pending_payment';
  const createEnrollment = useCreateEnrollment(selectedCourse?.id);

  // حالة الـ mutation تبقى عبر تبديل الدورة (نفس الـ widget) — فلا تظهر رسالة
  // خطأ دورة سابقة على الدورة المختارة الجديدة
  const resetEnrollment = createEnrollment.reset;
  const [couponCode, setCouponCode] = useState('');
  useEffect(() => {
    resetEnrollment();
    setCouponCode('');
  }, [selectedCourse?.id, resetEnrollment]);

  // Student-side only — courses have no busy-slots endpoint (unlike
  // packages' GET /packages/{id}/busy-slots) to advisory-check the training
  // center's own schedule against, so a center-side conflict can currently
  // only be caught by the backend's binding check at enrollment time.
  // GET /class-sessions returns every session in the system for an admin
  // (and the teacher's own for a teacher) — not a schedule of their own to
  // conflict with, so the check runs for students only.
  const isStudent = isAuthenticated && user?.role === 'student';
  const { data: myUpcomingSessions } = useCalendarSessions({ enabled: isStudent });
  const scheduleConflict = useMemo(
    () => isStudent
      ? findRecurringConflict(myUpcomingSessions, selectedCourse?.startDate, selectedCourse?.endDate, schedules, selectedCourse?.id)
      : null,
    [isStudent, myUpcomingSessions, selectedCourse?.startDate, selectedCourse?.endDate, schedules, selectedCourse?.id]
  );

  // Defense in depth — the course card already disables selecting an ended
  // course, but a stale `selectedCourse` (e.g. held in state across a course
  // list refresh) shouldn't be submittable either.
  // التسجيل مباشر بالدفع ما دام هناك مقعد شاغر — الباك اند يرفض أيضاً عند الامتلاء
  const isFull = Boolean(selectedCourse) && (selectedCourse.enrolledCount ?? 0) >= selectedCourse.maxSeats;
  const canSubmit = Boolean(selectedCourse) && !isPastDate(selectedCourse?.endDate) && !scheduleConflict && !isFull;
  const isPending = createEnrollment.isPending;
  const isSuccess = createEnrollment.isSuccess;

  const handleSubmit = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!canSubmit) return;
    createEnrollment.mutate(couponCode.trim() || undefined, {
      onSuccess: (data) => {
        if (data?.checkout_url) window.location.href = data.checkout_url;
      },
    });
  };

  return (
    <div className={bare ? 'flex flex-col gap-5' : 'flex h-fit flex-col gap-5 rounded-card bg-white p-5 shadow-card lg:sticky lg:top-24'}>
      {!bare && <h2 className="text-start font-bold text-ink">{t('teacher.course.enrollTitle')}</h2>}

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

          {scheduleConflict && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#FF383C]">
              <AlertTriangle size={13} />
              {t('booking.ownTimeConflict')}
            </p>
          )}
        </div>
      )}

      {selectedCourse && !enrollment && elapsedSessions.length > 0 && (
        <div className="rounded-2xl border border-[#F5C26B] bg-[#FFF8EB] p-3 text-start text-sm text-ink">
          <p className="mb-1 flex items-center gap-1.5 font-bold text-[#B45309]">
            <AlertTriangle size={15} />
            {t('teacher.course.elapsedTitle')}
          </p>
          <p>
            {t('teacher.course.elapsedBody')
              .replace('{n}', elapsedSessions.length)
              .replace('{total}', selectedCourse.totalSessions)}
          </p>
          <ul className="my-2 flex flex-col gap-1">
            {elapsedSessions.map((s) => (
              <li key={s.sequenceNo} className="flex items-center gap-1.5 text-xs text-ink-soft">
                <XCircle size={13} className="text-[#B45309]" />
                {t('teacher.course.elapsedSessionLabel').replace('{n}', s.sequenceNo)} · {formatDate(s.scheduledAt)}
              </li>
            ))}
          </ul>
          {selectedCourse.sessionsRecorded && (
            <p className="flex items-center gap-1.5 font-semibold text-success">
              <Video size={14} />
              {t('teacher.course.elapsedRecorded')}
            </p>
          )}
        </div>
      )}

      {/* كود خصم اختياري — نفس حقل BookingWidget (كوبونات الأدمن متعددة الباقات تشمل الدورات) */}
      {selectedCourse && !enrollment && (
        <label className="flex flex-col gap-1.5 text-start">
          <span className="text-sm font-bold text-ink">{t('booking.couponLabel')}</span>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder={t('booking.couponPlaceholder')}
            dir="ltr"
            className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      )}

      {createEnrollment.isError && (
        <ApiErrorList error={createEnrollment.error} labelFor={() => null} />
      )}

      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-xl font-bold text-primary">{formatPrice(selectedCourse?.price ?? 0, currency)}</span>
        <span className="text-sm font-bold text-ink">{t('booking.total')}</span>
      </div>

      {enrollment ? (
        <Button className="w-full justify-center" onClick={() => navigate(enrollmentDetailsPath(enrollment.id))}>
          {t(isEnrollmentPending ? 'teacher.course.alreadyEnrolledPending' : 'teacher.course.alreadyEnrolled')}
          {' · '}
          {t(isEnrollmentPending ? 'teacher.course.completePayment' : 'teacher.course.viewMyEnrollment')}
        </Button>
      ) : isSuccess ? (
        <div className="flex items-center justify-center gap-2 rounded-btn bg-success-light py-3 text-sm font-bold text-success">
          <CheckCircle2 size={16} /> {t('booking.success')}
        </div>
      ) : (
        <Button className="w-full justify-center" disabled={!canSubmit || isPending} onClick={handleSubmit}>
          {isPending
            ? t('booking.submitting')
            : isFull
              ? t('teacher.course.seatsFull')
              : !isAuthenticated
                ? t('booking.loginToBook')
                : t('teacher.course.enrollNow')}
        </Button>
      )}
    </div>
  );
}
