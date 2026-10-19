import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { QUALIFICATION_LABELS, EXPERIENCE_LABELS_SHORT } from '@/services/teacherService';
import { useT } from '@/hooks/useT';

/** نفس لوحة ألوان بطاقة المعلم (TeacherCard.jsx) حرفياً — تناسق بصري بين الكيانين */
const BLUE = '#4B6898';
const PEACH = '#FDC8BC';

/** نفس تريّة المواد بالخلفية البنفسجية الفاتحة من TeacherCard.jsx، بأيقونة واحدة
 * ثابتة بدل جدول مطابقة الكلمات المفتاحية (لا يستحق التكرار لبطاقة أبسط). */
function SubjectsTray({ title, subjects }) {
  if (!subjects || subjects.length === 0) return null;
  const shown = subjects.slice(0, 3);
  const extra = subjects.length - shown.length;
  return (
    <div className="flex w-full flex-col items-start gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
        {title}
        <BookOpen size={15} style={{ color: BLUE }} aria-hidden="true" />
      </span>
      <div className="flex w-full items-stretch gap-1.5 rounded-[10px] bg-[#F9F9FE] p-2">
        {shown.map((s) => (
          <span
            key={s.id}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-3 text-xs font-bold"
            style={{ color: BLUE }}
          >
            <GraduationCap size={20} aria-hidden="true" />
            <span className="w-full truncate text-center">{s.name}</span>
          </span>
        ))}
        {extra > 0 && (
          <span
            className="flex shrink-0 items-center justify-center rounded-xl bg-white px-2.5 text-xs font-bold"
            style={{ color: BLUE }}
          >
            {extra}+
          </span>
        )}
      </div>
    </div>
  );
}

function FooterStat({ value, label }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-0.5">
      <span className="max-w-full truncate text-start text-sm font-bold leading-[1.3]" style={{ color: BLUE }}>
        {value}
      </span>
      <span className="max-w-full truncate text-start text-[11px] font-medium leading-[1.3] text-[#909090]">{label}</span>
    </div>
  );
}

/**
 * بطاقة الداعم الأكاديمي — تستعير نفس لغة تصميم بطاقة المعلم (TeacherCard.jsx):
 * نفس شكل الصورة الرمزية بمربعين زخرفيين خلفها، نفس تريّة المواد بالخلفية
 * البنفسجية، ونفس شريط الإحصاءات السفلي مع الانسيابة الزخرفية. الحقول
 * المتاحة فعلياً من AcademicSupporterSearchController::index أقل من المعلم
 * (لا تقييم/جلسات مكتملة/مفضلة — هذه المفاهيم لا تنطبق على الداعم الأكاديمي)،
 * فالشريط السفلي يعرض المؤهل العلمي وسنوات الخبرة بدلاً من الموقع/الرضا.
 */
export function AcademicSupporterCard({ supporter }) {
  const t = useT();
  const qualificationLabel = supporter.qualification ? QUALIFICATION_LABELS[supporter.qualification] : null;
  const experienceLabel = supporter.experienceYears ? EXPERIENCE_LABELS_SHORT[supporter.experienceYears] : null;
  const initials = supporter.name?.trim().charAt(0) ?? '؟';

  const footerStats = [
    qualificationLabel && { key: 'qualification', value: qualificationLabel, label: 'المؤهل العلمي' },
    experienceLabel && { key: 'experience', value: experienceLabel, label: 'سنوات الخبرة' },
  ].filter(Boolean);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white text-start shadow-[0_1px_5px_rgba(0,0,0,0.1)] transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(17,24,39,0.14)]">
      <Link
        to={`/dashboard/student/academic-support/${supporter.id}`}
        className="flex flex-1 flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div className="flex w-full flex-row-reverse items-end gap-3 sm:justify-between sm:gap-0">
          {/* نفس المربعين الزخرفيين خلف الصورة الرمزية بالضبط — TeacherCard.jsx */}
          <div className="relative aspect-[139/125] h-16 shrink-0 sm:h-[92px]">
            <span
              className="absolute rounded-[10%]"
              style={{
                width: '58%',
                height: '64.5%',
                top: '-13.6%',
                left: '25.9%',
                background: 'rgba(75,104,152,0.2)',
                transform: 'rotate(-27.84deg)',
              }}
              aria-hidden="true"
            />
            <span
              className="absolute rounded-full"
              style={{
                width: '58%',
                height: '64.5%',
                top: '-9.6%',
                left: '-18%',
                background: PEACH,
                transform: 'rotate(-27.84deg)',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute left-0 z-10 h-full overflow-hidden rounded-full bg-white shadow-[0_10px_24px_rgba(17,24,39,0.18)] transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              style={{ width: '89.93%', top: '-0.8%' }}
            >
              {supporter.avatar ? (
                <img src={supporter.avatar} alt={supporter.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold" style={{ color: BLUE }}>
                  {initials}
                </span>
              )}
            </div>
          </div>

          <div className="flex min-h-[92px] min-w-0 flex-1 flex-col items-start justify-between gap-1.5 sm:w-[58%] sm:max-w-[240px] sm:flex-none">
            <h3 className="line-clamp-2 h-10 w-full text-sm font-bold leading-5 text-ink sm:h-14 sm:text-xl sm:leading-7">
              {supporter.name}
            </h3>

            <span
              className="inline-flex w-full items-center justify-center whitespace-normal rounded-xl px-2 py-1.5 text-xs font-medium text-white transition-opacity duration-200 group-hover:opacity-90 sm:whitespace-nowrap sm:px-4 sm:py-2 sm:text-sm"
              style={{ background: BLUE }}
            >
              {t('academicSupporter.browse.viewProfile')}
            </span>
          </div>
        </div>

        {supporter.bio && <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{supporter.bio}</p>}

        {supporter.subjects?.length > 0 && (
          <div className="mt-4 flex w-full flex-col gap-4">
            <SubjectsTray title="المواد التي يدعمها" subjects={supporter.subjects} />
          </div>
        )}

        <div className="flex-1" />

        {footerStats.length > 0 && (
          <div className="relative -mx-4 -mb-4 mt-4 flex h-16 items-center overflow-hidden rounded-2xl rounded-tr-none bg-[#F9F9F9] px-3 sm:h-[68px]">
            <svg
              className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[28%] xl:block"
              viewBox="0 0 130 59"
              preserveAspectRatio="xMaxYMax meet"
              aria-hidden="true"
            >
              <path d="M126.5 0H130V59H0C29.9331 29.3922 68.2876 9.76233 109.81 2.79891L126.5 0Z" fill={BLUE} />
            </svg>
            <div className="relative z-10 flex w-full items-center justify-between gap-2 xl:pr-[34%]">
              {footerStats.map(({ key, ...stat }) => (
                <div key={key} className="min-w-0">
                  <FooterStat {...stat} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}

export function AcademicSupporterCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-[0_1px_5px_rgba(0,0,0,0.1)]">
      <div className="flex w-full flex-row-reverse items-start gap-3">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full sm:h-[92px] sm:w-[92px]" />
        <div className="flex min-h-[92px] min-w-0 flex-1 flex-col items-start gap-1.5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
      <Skeleton className="mt-3 h-8 w-full rounded" />
      <div className="mt-4">
        <Skeleton className="h-20 w-full rounded-[10px]" />
      </div>
      <div className="flex-1" />
      <Skeleton className="mt-4 h-16 w-full rounded-2xl" />
    </div>
  );
}
