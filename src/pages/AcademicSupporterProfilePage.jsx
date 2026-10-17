import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { GraduationCap, Languages as LanguagesIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AssignmentsGallerySection } from '@/components/academicSupporter/AssignmentsGallerySection';
import { SupportPackagesSection } from '@/components/academicSupporter/SupportPackagesSection';
import { Avatar, ErrorState, Skeleton } from '@/components/ui';
import { QUALIFICATION_LABELS, EXPERIENCE_LABELS } from '@/services/teacherService';
import { useAuth } from '@/hooks/useAuth';
import { useAcademicSupporterProfile, usePurchaseSupportPackage } from '@/hooks/useAcademicSupporterBrowse';
import { useT } from '@/hooks/useT';

export function AcademicSupporterProfilePage() {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const { data: supporter, isLoading, isError, refetch } = useAcademicSupporterProfile(id);
  const purchase = usePurchaseSupportPackage();

  if (!user) return <Navigate to="/login" replace />;
  if (user.student?.education_type !== 'university') return <Navigate to="/dashboard/student" replace />;

  const handlePurchase = (supportPackageId) => {
    purchase.mutate(supportPackageId, {
      onSuccess: (data) => {
        if (data?.checkout_url) window.location.href = data.checkout_url;
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : isError || !supporter ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <>
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="flex items-start gap-4">
                <Avatar name={supporter.name} src={supporter.avatar} size="lg" />
                <div className="flex-1 text-right">
                  <h1 className="text-xl font-bold text-ink">{supporter.name}</h1>
                  <div className="mt-1 flex flex-wrap justify-end gap-x-3 gap-y-1 text-sm text-ink-soft">
                    {supporter.qualification && <span>{QUALIFICATION_LABELS[supporter.qualification]}</span>}
                    {supporter.experienceYears && <span>{EXPERIENCE_LABELS[supporter.experienceYears]}</span>}
                  </div>
                </div>
              </div>

              {supporter.bio && <p className="mt-4 text-right text-sm leading-relaxed text-ink-soft">{supporter.bio}</p>}

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

            <SupportPackagesSection
              supportPackages={supporter.supportPackages ?? []}
              onPurchase={handlePurchase}
              purchasingId={purchase.isPending ? purchase.variables : null}
              purchaseError={purchase.isError ? purchase.error : null}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
