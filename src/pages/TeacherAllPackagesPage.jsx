import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PackagesSection } from '@/components/teacher/PackagesSection';
import { BookingWidget } from '@/components/teacher/BookingWidget';
import { Drawer } from '@/components/ui/Drawer';
import { ErrorState, Skeleton } from '@/components/ui';
import { useTeacher } from '@/hooks/useTeachers';
import { usePackages } from '@/hooks/useMeta';
import { useT } from '@/hooks/useT';

/** صفحة عرض كل باقات معلم معيّن — وجهة تاغ "عرض كل الباقات" بقسم الباقات في ملفه الشخصي */
export function TeacherAllPackagesPage() {
  const t = useT();
  const { id } = useParams();
  const { data: teacher, isLoading: teacherLoading, isError: teacherError, refetch: refetchTeacher } = useTeacher(id);
  const {
    data: packages,
    isLoading: packagesLoading,
    isError: packagesError,
    refetch: refetchPackages,
  } = usePackages(id);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const selectedPackage = packages?.find((p) => p.id === selectedPackageId) ?? null;

  if (teacherLoading) {
    return (
      <PageContainer>
        <div className="container-app space-y-4 py-8">
          <Skeleton className="h-8 w-48 rounded-btn" />
          <Skeleton className="h-64 rounded-card" />
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
      <div className="container-app flex items-center gap-3 pt-6 text-sm">
        <Link
          to={`/teacher/${id}`}
          className="inline-flex items-center gap-1.5 font-bold text-[#2D2D2D] hover:text-primary"
        >
          <ArrowRight size={15} />
          {teacher.name}
        </Link>
      </div>

      <div className="container-app mt-4 pb-16">
        <PackagesSection
          packages={packages ?? []}
          isLoading={packagesLoading}
          isError={packagesError}
          refetch={refetchPackages}
          selectedPackageId={selectedPackageId}
          onSelect={(pkg) => setSelectedPackageId(pkg.id)}
          showAll
        />
      </div>

      <Drawer open={Boolean(selectedPackage)} onClose={() => setSelectedPackageId(null)} title={t('booking.title')}>
        <BookingWidget selectedPackage={selectedPackage} bare />
      </Drawer>
    </PageContainer>
  );
}
