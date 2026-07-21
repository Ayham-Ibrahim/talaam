import { Navigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, Button } from '@/components/ui';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';

export function StudentDashboardPage() {
  const t = useT();
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <PageContainer>
      <section className="container-app mt-10 mb-20">
        <Card className="flex flex-col items-center gap-4 p-10 text-center lg:p-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink">{t('dashboard.studentTitle')}</h1>
            <p className="mt-2 text-ink-soft">
              {t('dashboard.welcome')} {user.name} 👋
            </p>
          </div>
          <p className="max-w-md text-sm text-ink-soft">{t('dashboard.placeholder')}</p>
          <Button variant="outline" size="sm" onClick={() => logout.mutate()} className="mt-2">
            {t('dashboard.logout')}
          </Button>
        </Card>
      </section>
    </PageContainer>
  );
}
