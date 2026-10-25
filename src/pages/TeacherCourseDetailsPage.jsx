import { ArrowRight, Award, CalendarDays, CheckCircle2, FlaskConical, Laptop, Package, Users, Video, XCircle } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherCourse, useTeacherCourseEnrollments } from '@/hooks/useDashboard';
import { TEACHER_COURSE_STATUS_STYLES, COURSE_LEVEL_LABELS, COURSE_DELIVERY_MODE_LABELS } from '@/mocks/teacherCourses.mock';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

const ENROLLMENT_STATUS_LABELS = {
  pending_payment: 'بانتظار الدفع',
  confirmed: 'مؤكَّد',
  in_progress: 'جارٍ',
  completed: 'مكتمل',
  cancelled: 'ملغى',
  withdrawn: 'منسحب',
};

const formatTime = (time) => (time ? time.slice(0, 5) : '');

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-card">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
        {Icon && <Icon size={16} className="text-primary" />}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm">
      <dt className="shrink-0 text-ink-soft">{label}</dt>
      <dd className="text-start font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Fact({ active, icon: Icon, label }) {
  return (
    <li className="flex items-center gap-2 text-sm text-ink">
      <Icon size={15} className="text-ink-soft" />
      <span className="flex-1">{label}</span>
      {active ? <CheckCircle2 size={16} className="text-success" /> : <XCircle size={16} className="text-ink-soft" />}
    </li>
  );
}

/** صفحة تفاصيل دورة المركز التدريبي — بياناتها كاملة وجدولها ومشتركوها، قراءة فقط */
export function TeacherCourseDetailsPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const weekdays = t('booking.weekdays');
  const { data: course, isLoading, isError, refetch } = useTeacherCourse(id);
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useTeacherCourseEnrollments(id);

  if (!user) return <Navigate to="/login" replace />;
  // الدورات حصراً للمركز التدريبي
  if (user.teacherType !== 'training_center') return <Navigate to="/dashboard/teacher/packages" replace />;

  const statusStyle = course ? TEACHER_COURSE_STATUS_STYLES[course.status] ?? TEACHER_COURSE_STATUS_STYLES.draft : null;
  const isHourly = course?.pricing_mode === 'hourly';

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center gap-3 text-sm">
        <Link
          to="/dashboard/teacher/packages"
          aria-label="رجوع"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover"
        >
          <ArrowRight size={16} />
        </Link>
        <Link to="/dashboard/teacher/packages" className="font-bold text-primary hover:underline">
          {t('dashboard.nav.packages')}
        </Link>
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <span className="font-bold text-ink">{t('dashboard.teacherCourseDetails.title')}</span>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !course ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <section className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-ink">{course.title}</h3>
              <span
                className="shrink-0 rounded-pill px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
              >
                {statusStyle.label}
              </span>
            </div>
            {course.course_field?.name_ar && <p className="mt-1 text-sm text-ink-soft">{course.course_field.name_ar}</p>}
            {course.description && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-soft">{course.description}</p>}
            {course.status === 'rejected' && course.rejection_reason && (
              <p className="mt-3 rounded-xl bg-[#FDEFF2] p-3 text-sm text-[#B00852]">
                {t('dashboard.teacherCourseDetails.rejectionReason')}: {course.rejection_reason}
              </p>
            )}
          </section>

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Section title={t('dashboard.teacherCourseDetails.info')}>
                <dl className="divide-y divide-line">
                  <Row label={t('dashboard.addCourse.levelLabel')} value={COURSE_LEVEL_LABELS[course.level]} />
                  <Row label={t('dashboard.addCourse.deliveryModeLabel')} value={COURSE_DELIVERY_MODE_LABELS[course.delivery_mode]} />
                  <Row label={t('dashboard.addCourse.locationLabel')} value={course.location} />
                  <Row label={t('dashboard.addCourse.startDateLabel')} value={formatDate(course.start_date)} />
                  <Row label={t('dashboard.addCourse.endDateLabel')} value={formatDate(course.end_date)} />
                  <Row label={t('dashboard.addCourse.totalSessionsLabel')} value={course.total_sessions} />
                  <Row
                    label={t('dashboard.teacherCourseDetails.sessionDuration')}
                    value={course.session_duration_min ? `${course.session_duration_min} ${t('dashboard.minute')}` : null}
                  />
                  <Row label={t('dashboard.addCourse.totalHoursLabel')} value={course.total_hours} />
                  <Row label={t('dashboard.teacherCourseDetails.seats')} value={`${course.enrolled_count}/${course.max_seats}`} />
                  <Row
                    label={t('dashboard.addPackage.curriculumLabel')}
                    value={(course.curricula ?? []).map((c) => c.name_ar).join('، ')}
                  />
                </dl>
              </Section>
              <Section title={t('dashboard.teacherCourseDetails.pricing')}>
                <dl className="divide-y divide-line">
                  <Row
                    label={t('dashboard.addCourse.pricingModeLabel')}
                    value={t(isHourly ? 'dashboard.addCourse.pricingModeHourly' : 'dashboard.addCourse.pricingModeTotal')}
                  />
                  <Row
                    label={t(isHourly ? 'dashboard.addCourse.priceLabelHourly' : 'dashboard.addCourse.priceLabel')}
                    value={`${course.provider_price} د.إ`}
                  />
                  <Row
                    label={t('dashboard.teacherCourseDetails.studentPrice')}
                    value={course.student_price != null ? `${course.student_price} د.إ` : t('dashboard.teacherCourseDetails.priceAfterApproval')}
                  />
                </dl>
              </Section>
              {(course.prerequisites || course.cancellation_policy) && (
                <Section title={t('dashboard.teacherCourseDetails.policies')}>
                  <dl className="divide-y divide-line">
                    <Row label={t('dashboard.addCourse.prerequisitesLabel')} value={course.prerequisites} />
                    <Row label={t('dashboard.addCourse.cancellationPolicyLabel')} value={course.cancellation_policy} />
                  </dl>
                </Section>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Section title={t('dashboard.teacherCourseDetails.schedule')} icon={CalendarDays}>
                {(course.schedules ?? []).length === 0 ? (
                  <p className="text-sm text-ink-soft">{t('dashboard.teacherCourseDetails.noSchedule')}</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {course.schedules.map((s) => (
                      <li key={s.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-sm">
                        <span className="font-semibold text-ink">{weekdays[s.day_of_week]}</span>
                        <span className="text-ink-soft" dir="ltr">
                          {formatTime(s.start_time)} – {formatTime(s.end_time)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
              <Section title={t('dashboard.teacherCourseDetails.facts')}>
                <ul className="flex flex-col gap-2">
                  <Fact active={course.has_certificate} icon={Award} label={t('dashboard.addCourse.hasCertificateLabel')} />
                  <Fact active={course.requires_laptop} icon={Laptop} label={t('dashboard.addCourse.requiresLaptopLabel')} />
                  <Fact active={course.materials_included} icon={Package} label={t('dashboard.addCourse.materialsIncludedLabel')} />
                  <Fact active={course.has_practical_exercises} icon={FlaskConical} label={t('dashboard.addCourse.hasPracticalExercisesLabel')} />
                  <Fact active={course.sessions_recorded} icon={Video} label={t('dashboard.addCourse.sessionsRecordedLabel')} />
                </ul>
                {course.has_certificate && (
                  <dl className="mt-3 divide-y divide-line border-t border-line">
                    <Row label={t('dashboard.addCourse.certificateTypeLabel')} value={course.certificate_type} />
                    <Row label={t('dashboard.addCourse.certificateIssuerLabel')} value={course.certificate_issuer} />
                    <Row label={t('dashboard.teacherCourseDetails.certificateRequirements')} value={course.certificate_requirements} />
                  </dl>
                )}
              </Section>
              <Section title={`${t('dashboard.teacherCourseDetails.students')} (${enrollments.length})`} icon={Users}>
                {enrollmentsLoading ? (
                  <Skeleton className="h-16 rounded-xl" />
                ) : enrollments.length === 0 ? (
                  <p className="text-sm text-ink-soft">{t('dashboard.teacherCourseDetails.noStudents')}</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {enrollments.map((e) => (
                      <li key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <div>
                          <div className="font-semibold text-ink">{e.student?.user?.name ?? '—'}</div>
                          <div className="text-xs text-ink-soft">
                            {t('dashboard.teacherCourseDetails.enrolledAt')} {formatDate(e.created_at)}
                          </div>
                        </div>
                        <span className="rounded-pill bg-[#F2F2F7] px-3 py-1 text-xs font-medium text-ink-soft">
                          {ENROLLMENT_STATUS_LABELS[e.status] ?? e.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
