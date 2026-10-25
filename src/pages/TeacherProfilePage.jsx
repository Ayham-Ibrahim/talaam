import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Seo } from '@/components/seo/Seo';
import { teacherJsonLd, faqJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { TeacherProfileHeader } from '@/components/teacher/TeacherProfileHeader';
import { TeacherAboutSection } from '@/components/teacher/TeacherAboutSection';
import { TeacherCredentialsSection } from '@/components/teacher/TeacherCredentialsSection';
import { TeacherTeachingScopeSection } from '@/components/teacher/TeacherTeachingScopeSection';
import { VideosSection } from '@/components/teacher/TeacherInfoSections';
import { PackagesSection } from '@/components/teacher/PackagesSection';
import { CoursesSection } from '@/components/teacher/CoursesSection';
import { Star } from 'lucide-react';
import { RatingReviews } from '@/components/teacher/RatingReviews';
import { TeacherFAQSection } from '@/components/teacher/TeacherFAQSection';
import { TeacherClosingSections } from '@/components/teacher/TeacherClosingSections';
import { BookingWidget } from '@/components/teacher/BookingWidget';
import { CourseEnrollWidget } from '@/components/teacher/CourseEnrollWidget';
import { ReviewFormModal } from '@/components/dashboard/ReviewFormModal';
import { ErrorState, Skeleton } from '@/components/ui';
import { Drawer } from '@/components/ui/Drawer';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites, useToggleFavoriteTeacher } from '@/hooks/useFavorites';
import { useTeacher } from '@/hooks/useTeachers';
import { usePackages, useCourses, useRatingSummary, useReviews } from '@/hooks/useMeta';
import { useMyReviews, useCreateTeacherReview } from '@/hooks/useMyReviews';
import { useT } from '@/hooks/useT';
import { useProfileT } from '@/hooks/useProfileT';


/** عنوان ووصف Meta من بيانات المعلم الحقيقية فقط — مادة/مدينة/منهج/لغات/خبرة، لا نص عام مكرر لكل معلم */
function buildTeacherSeo(teacher) {
  const subjects = (teacher.subjects ?? []).slice(0, 3).join('، ');
  const curricula = (teacher.curricula ?? []).slice(0, 2).join('، ');
  const languages = (teacher.languages ?? []).map((l) => l.label).join('، ');
  const cityPart = teacher.city ? ` في ${teacher.city}` : '';
  // المركز التدريبي لا يوصف بـ"مدرس"
  const role = teacher.type === 'training_center' ? 'مركز تدريبي' : 'مدرس';

  const title = subjects
    ? `${teacher.name} | ${role} ${subjects}${cityPart} - TAALAM`
    : `${teacher.name} | TAALAM`;

  const descParts = [
    subjects && `${role} ${subjects}${cityPart}`,
    curricula && `${teacher.type === 'training_center' ? 'يقدّم' : 'يُدرّس'} مناهج ${curricula}`,
    languages && `بلغات ${languages}`,
    teacher.reviewsCount > 0 && `تقييم ${teacher.rating} من ${teacher.reviewsCount} تقييم`,
    teacher.experienceLabel, // يتضمّن كلمة "خبرة" نفسها بالفعل (راجع EXPERIENCE_LABELS)
  ].filter(Boolean);

  const description = descParts.length > 0 ? `${descParts.join(' — ')}. احجز حصتك الآن عبر TAALAM.` : teacher.bio;

  return { title, description };
}

export function TeacherProfilePage() {
  const t = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
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
  const pt = useProfileT(teacher);
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

  // "قيّم هذا المعلم" من بروفايله العامة مباشرة، بأي وقت وبصرف النظر عن وجود
  // جلسة فعلية معه (طلب صريح) — عبر POST /teachers/{teacher}/reviews، upsert
  // منفصل تماماً عن تقييمات الجلسات الحقيقية (StudentReviewsPage.jsx، التي
  // تبقى كما هي بلا أي تغيير). إن كان للطالب تقييم حر سابق لهذا المعلم تحديداً
  // (class_session_id فارغة) يُفتح النموذج مُعبَّأً بقيمته الحالية للتعديل.
  const isStudent = isAuthenticated && user?.role === 'student';
  const { data: myReviews } = useMyReviews();
  const createTeacherReview = useCreateTeacherReview();
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const myFreeReview = (myReviews ?? []).find((r) => r.teacherId === Number(id) && r.classSessionId === null) ?? null;

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

  const { title, description } = buildTeacherSeo(teacher);

  return (
    <PageContainer>
      <Seo
        title={title}
        description={description}
        path={`/teacher/${id}`}
        image={teacher.avatar}
        type="profile"
        jsonLd={[
          teacherJsonLd(teacher),
          breadcrumbJsonLd([
            { name: 'الرئيسية', path: '/' },
            { name: 'ابحث عن معلم', path: '/search' },
            { name: teacher.name, path: `/teacher/${id}` },
          ]),
          ...(faqJsonLd(teacher.faqs) ? [faqJsonLd(teacher.faqs)] : []),
        ]}
      />

      {/* Breadcrumb */}
      <div className="container-app flex items-center gap-3 pt-6 text-sm">
        <span className="font-medium text-primary">{pt('teacher.profileLabel')}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <Link to="/search" className="font-bold text-[#2D2D2D] hover:text-primary">
          {t('nav.search')}
        </Link>
      </div>

      {/* Full-width stacked layout — heading, then every section below it at
          full container width. Booking/enrollment isn't inline or a side rail
          anymore — picking a package/course opens the drawer below instead. */}
      <div className="container-app mt-4 pb-16">
        <TeacherProfileHeader teacher={teacher} isFavorite={isFavorite} onToggleFavorite={handleToggleFavorite} />

        <TeacherAboutSection teacher={teacher} />

        <TeacherCredentialsSection teacher={teacher} />

        <TeacherTeachingScopeSection teacher={teacher} />

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

        {isStudent && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3 text-start">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Star size={18} />
              </span>
              <div>
                <div className="text-sm font-bold text-ink">{pt('teacher.rateCtaTitle')}</div>
                <div className="text-xs text-ink-soft">{pt('teacher.rateCtaSubtitle')}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsRatingOpen(true)}
              className="shrink-0 rounded-xl border-2 border-primary px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              {myFreeReview ? t('studentReviews.edit') : t('studentReviews.addReview')}
            </button>
          </div>
        )}

        <RatingReviews
          summary={ratingSummary}
          reviews={reviews ?? []}
          isLoading={reviewsLoading || summaryLoading}
          isError={reviewsError}
          refetch={refetchReviews}
        />

        <TeacherFAQSection teacher={teacher} />

        <TeacherClosingSections teacher={teacher} />
      </div>

      {/* Booking / enrollment drawer — opens when a package or course is picked above. */}
      {isCenter ? (
        <Drawer open={Boolean(selectedCourse)} onClose={() => setSelectedCourseId(null)} title={t('teacher.course.enrollTitle')}>
          <CourseEnrollWidget selectedCourse={selectedCourse} bare />
        </Drawer>
      ) : (
        <Drawer open={Boolean(selectedPackage)} onClose={() => setSelectedPackageId(null)} title={t('booking.title')}>
          <BookingWidget selectedPackage={selectedPackage} bare />
        </Drawer>
      )}

      {isRatingOpen && (
        <ReviewFormModal
          title={pt('teacher.rateModalTitle')}
          initialRating={myFreeReview?.rating ?? 0}
          initialComment={myFreeReview?.comment ?? ''}
          isPending={createTeacherReview.isPending}
          error={createTeacherReview.isError ? createTeacherReview.error : null}
          onSubmit={({ rating, comment }) =>
            createTeacherReview.mutate(
              { teacherId: Number(id), rating, comment },
              { onSuccess: () => setIsRatingOpen(false) },
            )
          }
          onClose={() => setIsRatingOpen(false)}
        />
      )}
    </PageContainer>
  );
}
