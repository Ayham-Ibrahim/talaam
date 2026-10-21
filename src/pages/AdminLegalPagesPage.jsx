import { Navigate, Link } from 'react-router-dom';
import { ShieldCheck, FileText, ChevronLeft } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLegalPage } from '@/hooks/useMeta';
import { useT } from '@/hooks/useT';

const DOCS = [
  { slug: 'privacy', icon: ShieldCheck, titleKey: 'privacyTitle' },
  { slug: 'terms', icon: FileText, titleKey: 'termsTitle' },
];

function DocCard({ doc }) {
  const t = useT();
  const { data, isLoading, isError, refetch } = useLegalPage(doc.slug);
  const Icon = doc.icon;

  return (
    <Link
      to={`/dashboard/admin/legal-pages/${doc.slug}`}
      className="flex items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon size={22} />
        </span>
        <div className="text-right">
          <div className="font-bold text-ink">{t(`legal.${doc.titleKey}`)}</div>
          {isError ? (
            <button type="button" onClick={(e) => { e.preventDefault(); refetch(); }} className="text-xs text-accent-pink">
              {t('dashboard.adminLegalPages.loadError')}
            </button>
          ) : isLoading ? (
            <span className="text-xs text-ink-soft">{t('dashboard.adminLegalPages.loading')}</span>
          ) : (
            <span className="text-xs text-ink-soft">
              {t('dashboard.adminLegalPages.sectionsCount').replace('{n}', data?.sections?.length ?? 0)}
              {data?.updatedAt && ` · ${t('legal.lastUpdated')} ${new Date(data.updatedAt).toLocaleDateString('ar-EG')}`}
            </span>
          )}
        </div>
      </div>
      <ChevronLeft size={20} className="shrink-0 text-ink-soft" />
    </Link>
  );
}

export function AdminLegalPagesPage() {
  const t = useT();
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('dashboard.adminLegalPages.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminLegalPages.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DOCS.map((doc) => (
            <DocCard key={doc.slug} doc={doc} />
          ))}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
