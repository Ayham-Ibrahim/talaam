import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/ui';

/**
 * Placeholder pages — full implementations come in the next phase.
 * The architecture, hooks, and services they'll use are already in place.
 */
export function TeacherProfilePage() {
  return (
    <PageContainer>
      <div className="container-app py-16">
        <EmptyState
          title="صفحة ملف المعلم — قيد البناء"
          hint="جاهزة معمارياً عبر useTeacher + usePackages + useReviews + useAvailability"
        />
      </div>
    </PageContainer>
  );
}
