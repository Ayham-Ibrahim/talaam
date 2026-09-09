import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { TeacherProfileHeader } from '@/components/teacher/TeacherProfileHeader';
import { TeacherStatsRow } from '@/components/teacher/TeacherStatsRow';
import { TeacherAboutSection } from '@/components/teacher/TeacherAboutSection';
import { TeacherExperienceSection } from '@/components/teacher/TeacherExperienceSection';
import { WeeklyAvailabilityPreview } from '@/components/teacher/WeeklyAvailabilityPreview';
import { TeacherFAQSection } from '@/components/teacher/TeacherFAQSection';
import { TeacherFinalCta } from '@/components/teacher/TeacherFinalCta';
import { InfoSection, VideosSection } from '@/components/teacher/TeacherInfoSections';
import { PackagesSection } from '@/components/teacher/PackagesSection';
import { CoursesSection } from '@/components/teacher/CoursesSection';
import { RatingReviews } from '@/components/teacher/RatingReviews';
import { BookingWidget } from '@/components/teacher/BookingWidget';
import { CourseEnrollWidget } from '@/components/teacher/CourseEnrollWidget';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites, useToggleFavoriteTeacher } from '@/hooks/useFavorites';
import { useTeacher } from '@/hooks/useTeachers';
import { usePackages, useCourses, useRatingSummary, useReviews } from '@/hooks/useMeta';
import { useT } from '@/hooks/useT';

const LANGUAGE_FLAGS = { ar: '/ar.png', en: '/en.png' };

export function TeacherProfilePage() {
  const t = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: favorites } = useFavorites();
  const toggleFavoriteTeacher = useToggleFavoriteTeacher();
  const isFavorite = (favorites ?? []).some((f) => f.kind === 'teacher' && f.id === Number(id));

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    toggleFavoriteTeacher.mutate(Number(id));
  };

  const { data: teacher, isLoading: teacherLoading, isError: teacherError, refetch: refetchTeacher } = useTeacher(id);
  const isCenter = teacher?.type === 'training_center';
  const {
    data: packages,
    isLoading: packagesLoading,
    isError: packagesError,
    refetch: refetchPackages,
  } = usePackages(isCenter ? undefined : id);
  const {
    data: courses,
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useCourses(isCenter ? id : undefined);
  const { data: reviews, isLoading: reviewsLoading, isError: reviewsError, refetch: refetchReviews } = useReviews(id);
  const { data: ratingSummary, isLoading: summaryLoading } = useRatingSummary(id);

  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const selectedPackage = packages?.find((p) => p.id === selectedPackageId) ?? null;
  const selectedCourse = courses?.find((c) => c.id === selectedCourseId) ?? null;

  const handleBookClick = () => {
    document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (teacherLoading) {
    return (
      <PageContainer>
        <div className="container-app space-y-4 py-8">
          <Skeleton className="h-64 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
        </div>
      </PageContainer>
    );
  }

  if (teacherError || !teacher) {
    return (
      <PageContainer>
        <div className="container-app py-16">
          <ErrorState onRetry={refetchTeacher} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <div className="container-app flex items-center gap-3 pt-6 text-sm">
        <span className="font-medium text-primary">{t('teacher.profileLabel')}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <Link to="/search" className="font-bold text-[#2D2D2D] hover:text-primary">
          {t('nav.search')}
        </Link>
      </div>

      <div className="container-app mt-4 grid grid-cols-1 gap-6 pb-8 lg:grid-cols-[1fr_400px]">
        {/* Main content */}
        <div>
          <TeacherProfileHeader
            teacher={teacher}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onBookClick={handleBookClick}
          />

          <TeacherStatsRow teacher={teacher} />

          <TeacherAboutSection teacher={teacher} />

          <TeacherExperienceSection experiences={teacher.experiences} />

          <div className="mt-6">
            <InfoSection title={t('teacher.qualifications')} items={teacher.qualifications} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoSection title={t('teacher.subjects')} items={teacher.subjects} colorfulDots />
            <InfoSection title={t('teacher.curricula')} items={teacher.curricula} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoSection title={t('teacher.stages')} items={teacher.stages} />
            <InfoSection title={t('teacher.grades')} items={teacher.grades.map((g) => `${t('teacher.gradePrefix')} ${g}`)} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoSection title={t('teacher.teachingMethods')} items={teacher.teachingMethods} />
            <InfoSection
              title={t('teacher.languages')}
              items={teacher.languages.map((l) => ({
                label: l.label,
                flag: LANGUAGE_FLAGS[l.code] && (
                  <img src={LANGUAGE_FLAGS[l.code]} alt={l.label} className="h-4 w-4 rounded-full object-cover" />
                ),
              }))}
            />
          </div>

          <VideosSection title={t('teacher.videos')} videos={teacher.videos} />

          {isCenter ? (
            <CoursesSection
              courses={courses ?? []}
              isLoading={coursesLoading}
              isError={coursesError}
              refetch={refetchCourses}
              selectedCourseId={selectedCourseId}
              onSelect={(course) => setSelectedCourseId(course.id)}
            />
          ) : (
            <PackagesSection
              packages={packages ?? []}
              isLoading={packagesLoading}
              isError={packagesError}
              refetch={refetchPackages}
              selectedPackageId={selectedPackageId}
              onSelect={(pkg) => setSelectedPackageId(pkg.id)}
            />
          )}

          <WeeklyAvailabilityPreview weekdays={t('booking.weekdays')} />

          <RatingReviews
            summary={ratingSummary}
            reviews={reviews ?? []}
            isLoading={reviewsLoading || summaryLoading}
            isError={reviewsError}
            refetch={refetchReviews}
          />

          <TeacherFAQSection faqs={teacher.faqs} />
        </div>

        {/* Booking / enrollment widget */}
        <div id="booking-widget">
          {isCenter ? <CourseEnrollWidget selectedCourse={selectedCourse} /> : <BookingWidget selectedPackage={selectedPackage} />}
        </div>
      </div>

      <div className="container-app pb-16">
        <TeacherFinalCta onBookClick={handleBookClick} />
      </div>
    </PageContainer>
  );
}
