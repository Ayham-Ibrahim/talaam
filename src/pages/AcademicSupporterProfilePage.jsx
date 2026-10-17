import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { GraduationCap, Languages as LanguagesIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AcademicSupporterProfileHeader } from '@/components/academicSupporter/AcademicSupporterProfileHeader';
import { AssignmentsGallerySection } from '@/components/academicSupporter/AssignmentsGallerySection';
import { SupportPackagesSection } from '@/components/academicSupporter/SupportPackagesSection';
import { SupportPackageDetailsDrawer } from '@/components/academicSupporter/SupportPackageDetailsDrawer';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAcademicSupporterProfile } from '@/hooks/useAcademicSupporterBrowse';

export function AcademicSupporterProfilePage() {
  const { user } = useAuth();
  const { id } = useParams();
  const { data: supporter, isLoading, isError, refetch } = useAcademicSupporterProfile(id);
  const [selectedPackage, setSelectedPackage] = useState(null);

  if (!user) return <Navigate to="/login" replace />;
  if (user.student?.education_type !== 'university') return <Navigate to="/dashboard/student" replace />;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-56 rounded-[28px]" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : isError || !supporter ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <>
            <AcademicSupporterProfileHeader supporter={supporter} />

            <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
              {supporter.bio && <p className="text-right text-sm leading-relaxed text-ink-soft">{supporter.bio}</p>}

              {supporter.subjects?.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {supporter.subjects.map((s) => (
                    <span key={s.id} className="flex items-center gap-1 rounded-pill bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <GraduationCap size={13} />
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {supporter.languages?.length > 0 && (
                <div className="mt-2 flex flex-wrap justify-end gap-2">
                  {supporter.languages.map((l) => (
                    <span key={l.code} className="flex items-center gap-1 rounded-pill bg-line/40 px-3 py-1 text-xs font-medium text-ink-soft">
                      <LanguagesIcon size={13} />
                      {l.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <AssignmentsGallerySection items={supporter.galleryItems ?? []} />

            <SupportPackagesSection supportPackages={supporter.supportPackages ?? []} onSelect={setSelectedPackage} />

            <SupportPackageDetailsDrawer supportPackage={selectedPackage} onClose={() => setSelectedPackage(null)} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
