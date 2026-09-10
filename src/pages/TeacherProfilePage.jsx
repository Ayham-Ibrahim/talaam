import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { TeacherProfileHeader } from '@/components/teacher/TeacherProfileHeader';
import { TeacherAboutSection } from '@/components/teacher/TeacherAboutSection';
import { TeacherCredentialsSection } from '@/components/teacher/TeacherCredentialsSection';
import { TeacherTeachingScopeSection } from '@/components/teacher/TeacherTeachingScopeSection';
import { VideosSection } from '@/components/teacher/TeacherInfoSections';
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

      {/* Full-width stacked layout — heading, then every section below it at
          full container width; the booking/enrollment panel sits inline after
          the packages instead of as a side rail. */}
      <div className="container-app mt-4 pb-16">
        <TeacherProfileHeader teacher={teacher} isFavorite={isFavorite} onToggleFavorite={handleToggleFavorite} />

        <TeacherAboutSection teacher={teacher} />

        <TeacherCredentialsSection teacher={teacher} />

        <TeacherTeachingScopeSection teacher={teacher} />

        <VideosSection title={t('teacher.videos')} videos={teacher.videos} />

        {isCenter ? (
          <>
            <CoursesSection
              courses={courses ?? []}
              isLoading={coursesLoading}
              isError={coursesError}
              refetch={refetchCourses}
              selectedCourseId={selectedCourseId}
              onSelect={(course) => setSelectedCourseId(course.id)}
            />
            <CourseEnrollWidget selectedCourse={selectedCourse} stacked />
          </>
        ) : (
          <>
            <PackagesSection
              packages={packages ?? []}
              isLoading={packagesLoading}
              isError={packagesError}
              refetch={refetchPackages}
              selectedPackageId={selectedPackageId}
              onSelect={(pkg) => setSelectedPackageId(pkg.id)}
            />
            <BookingWidget selectedPackage={selectedPackage} stacked />
          </>
        )}

        <RatingReviews
          summary={ratingSummary}
          reviews={reviews ?? []}
          isLoading={reviewsLoading || summaryLoading}
          isError={reviewsError}
          refetch={refetchReviews}
        />
      </div>
    </PageContainer>
  );
}
