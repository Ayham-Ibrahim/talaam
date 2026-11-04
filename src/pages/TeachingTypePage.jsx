import { useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { Seo } from "@/components/seo/Seo";
import { teacherListJsonLd } from "@/lib/seo";
import { TeachingTypeBanner } from "@/components/teaching/TeachingTypeBanner";
import { TeachingTypeFilters } from "@/components/teaching/TeachingTypeFilters";
import {
  TEACHING_TYPE_SLUGS,
  SLUG_TO_TEACHER_TYPE,
} from "@/components/teaching/teachingTypeConfig";
import {
  TeacherCard,
  TeacherCardSkeleton,
} from "@/components/teacher/TeacherCard";
import { EmptyState, ErrorState } from "@/components/ui";
import { useInfiniteTeachers } from "@/hooks/useTeachers";
import { useInfiniteScrollTrigger } from "@/hooks/useInfiniteScrollTrigger";
import { useFilters } from "@/hooks/useMeta";
import { useT } from "@/hooks/useT";
import { TrainingCenterFilters } from "../components/teacher/TrainingCenterFilters";

const TYPE_SEO_LABEL = {
  school: "مدرسي",
  university: "جامعي",
  training: "مراكز تدريب",
};

const DEFAULT_FILTERS = {
  grade: null,
  subject: null,
  stage: null,
  curriculum: null,
  courseField: null, // Added courseField for training centers
  language: null,
  minPrice: null,
  maxPrice: null,
  minRating: null,
};

export function TeachingTypePage() {
  const t = useT();
  const { type } = useParams();
  const isValidSlug = TEACHING_TYPE_SLUGS.includes(type);
  const slug = isValidSlug ? type : "school";

  const [selected, setSelected] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: meta } = useFilters(slug);

  const filters = useMemo(
    () => ({
      type: SLUG_TO_TEACHER_TYPE[slug],
      grade: selected.grade ?? undefined,
      subject: selected.subject ?? undefined,
      stage: selected.stage ?? undefined,
      curriculum: selected.curriculum ?? undefined,
      courseField: selected.courseField ?? undefined, // Pass courseField to query
      language: selected.language ?? undefined,
      minPrice: selected.minPrice ?? undefined,
      maxPrice: selected.maxPrice ?? undefined,
      minRating: selected.minRating ?? undefined,
      sort: "rating",
    }),
    [slug, selected],
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTeachers(filters);
  const teachers = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  const total = data?.pages?.[0]?.total ?? 0;

  const sentinelRef = useInfiniteScrollTrigger({
    onIntersect: fetchNextPage,
    enabled: Boolean(hasNextPage) && !isFetchingNextPage && !isLoading,
  });

  const handleChange = (key, value) =>
    setSelected((prev) => ({ ...prev, [key]: value }));
  const handleReset = () => {
    setSelected(DEFAULT_FILTERS);
    setFiltersOpen(false);
  };
  const isTrainingPage = slug === "training";
  if (!isValidSlug) return <Navigate to="/" replace />;

  const typeLabel = TYPE_SEO_LABEL[slug];

  // Choose the correct filter component based on whether it's a training center page
  const renderFilters = (isMobile = false) => {
    const commonProps = {
      meta,
      value: selected,
      onChange: handleChange,
      onReset: handleReset,
      ...(isMobile ? { hideHeading: true } : {}),
    };

    if (slug === "training") {
      return <TrainingCenterFilters {...commonProps} />;
    }
    return <TeachingTypeFilters {...commonProps} />;
  };

  return (
    <PageContainer>
      <Seo
        title={`معلمون ${typeLabel} معتمدون | TAALAM`}
        description={`تصفّح أفضل المعلمين ${typeLabel === "مراكز تدريب" ? "من مراكز التدريب المعتمدة" : `لـ ${typeLabel} المعتمدين`} على TAALAM، قارن حسب المادة والتقييم واحجز حصتك الآن.`}
        path={`/teaching/${slug}`}
        jsonLd={teacherListJsonLd(teachers)}
      />
      <div className="container-app py-8">
        <TeachingTypeBanner slug={slug} teachersCount={total} />

        {/* العنوان الرئيسي والعنوان الفرعي مع تطبيق الشرط لمراكز التدريب */}
        <div className="mt-10">
          <h2 className="font-cairo text-xl font-bold text-ink sm:text-2xl">
            {isTrainingPage
              ? t("teachingType.trainingCentersHeading") ||
                "مراكز التدريب المتاحة"
              : t("teachingType.teachersHeading")}
          </h2>
          <p className="mt-1 font-cairo text-sm text-ink-soft">
            {isTrainingPage
              ? t("teachingType.trainingCentersSubheading") ||
                "تصفح أفضل المراكز التدريبية المعتمدة واحجز دوراتك الآن"
              : t("teachingType.teachersSubheading")}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          {/* الشريط الجانبي — سطح المكتب */}
          <div className="hidden lg:block">{renderFilters(false)}</div>

          <div className="flex-1">
            {/* زر إظهار الفلاتر — الجوال فقط */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className="flex w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  {t("teachingType.filterTitle")}
                </span>
                <motion.span
                  animate={{ rotate: filtersOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="motion-reduce:transition-none"
                >
                  <ChevronDown size={16} className="text-ink-soft" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {filtersOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-2xl border border-line bg-surface p-5">
                      {renderFilters(true)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 lg:mt-0">
              {isError ? (
                <ErrorState onRetry={refetch} />
              ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-3">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <TeacherCardSkeleton key={i} />
                      ))
                    : teachers.map((teacher) => (
                        <TeacherCard key={teacher.id} teacher={teacher} />
                      ))}
                  {isFetchingNextPage &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <TeacherCardSkeleton key={`next-${i}`} />
                    ))}
                </div>
              )}
              {!isLoading && hasNextPage && (
                <div ref={sentinelRef} aria-hidden="true" className="h-1" />
              )}

              {!isLoading && !isError && teachers.length === 0 && (
                <EmptyState
                  title={t("teachingType.empty")}
                  hint={t("teachingType.emptyHint")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
