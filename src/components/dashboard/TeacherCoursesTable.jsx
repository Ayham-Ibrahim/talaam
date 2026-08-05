import { Send } from 'lucide-react';
import { TEACHER_COURSE_STATUS_STYLES, COURSE_LEVEL_LABELS, COURSE_DELIVERY_MODE_LABELS } from '@/mocks/teacherCourses.mock';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function TeacherCoursesTable({ courses, onSubmit, isSubmitting }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.teacherPackages.package')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.addCourse.levelLabel')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.addCourse.deliveryModeLabel')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.addCourse.datesLabel')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherPackages.seats')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherPackages.status')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherPackages.price')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherPackages.action')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {courses.map((course, i) => {
            const statusStyle = TEACHER_COURSE_STATUS_STYLES[course.status] ?? TEACHER_COURSE_STATUS_STYLES.draft;
            return (
              <tr key={course.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                <td className="px-4 py-4 text-right font-semibold text-ink">{course.title}</td>
                <td className="px-4 py-4 text-center text-ink-soft">{COURSE_LEVEL_LABELS[course.level]}</td>
                <td className="px-4 py-4 text-center text-ink-soft">{COURSE_DELIVERY_MODE_LABELS[course.delivery_mode]}</td>
                <td className="px-4 py-4 text-center text-ink-soft" dir="ltr">
                  {formatDate(course.start_date)} – {formatDate(course.end_date)}
                </td>
                <td className="px-4 py-4 text-center text-ink">
                  {course.enrolled_count}/{course.max_seats}
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className="rounded-pill px-4 py-1.5 text-xs font-bold"
                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                  >
                    {statusStyle.label}
                  </span>
                </td>
                <td className="px-4 py-4 text-center font-semibold text-ink">{course.provider_price}$</td>
                <td className="px-4 py-4 text-center">
                  {course.status === 'draft' && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => onSubmit?.(course)}
                      className="text-success hover:opacity-70 disabled:opacity-40"
                      aria-label={t('dashboard.teacherPackages.submitForReview')}
                      title={t('dashboard.teacherPackages.submitForReview')}
                    >
                      <Send size={18} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
