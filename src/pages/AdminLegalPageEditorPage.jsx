import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { ApiErrorList, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useLegalPage } from '@/hooks/useMeta';
import { useUpdateLegalPage } from '@/hooks/useAdminSettings';
import { useT } from '@/hooks/useT';

const BLANK_SECTION = { title_ar: '', title_en: '', body_ar: '', body_en: '' };

/** راجع LegalPage.jsx (العرض العام) وUpdateLegalPageRequest بالباك — نفس بنية sections[] بالضبط */
export function AdminLegalPageEditorPage() {
  const t = useT();
  const { user } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useLegalPage(slug);
  const updateLegalPage = useUpdateLegalPage(slug);

  const [sections, setSections] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (data?.sections) setSections(data.sections);
  }, [data]);

  if (!user) return <Navigate to="/login" replace />;

  const docTitle = slug === 'privacy' ? t('legal.privacyTitle') : t('legal.termsTitle');

  const updateField = (index, field, value) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addSection = () => setSections((prev) => [...prev, { ...BLANK_SECTION }]);
  const removeSection = (index) => setSections((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    updateLegalPage.mutate(sections, {
      onSuccess: () => {
        setSuccessMessage(t('dashboard.adminLegalPages.saveSuccess'));
        setTimeout(() => setSuccessMessage(''), 4000);
      },
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{docTitle}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminLegalPages.editorHint')}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/admin/legal-pages')}
            className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            <ArrowRight size={16} />
            {t('dashboard.adminLegalPages.back')}
          </button>
        </div>

        {successMessage && (
          <div className="rounded-2xl bg-success-light px-4 py-3 text-sm font-medium text-success">{successMessage}</div>
        )}
        {updateLegalPage.isError && <ApiErrorList error={updateLegalPage.error} labelFor={() => null} />}

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {sections.map((section, i) => (
                <div key={i} className="rounded-2xl bg-white p-5 shadow-card">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-ink-soft">
                      {t('dashboard.adminLegalPages.sectionLabel')} {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSection(i)}
                      className="flex items-center gap-1.5 text-xs font-medium text-accent-pink hover:opacity-70"
                    >
                      <Trash2 size={14} />
                      {t('dashboard.adminLegalPages.removeSection')}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-right">
                      <span className="text-xs font-semibold text-ink-soft">{t('dashboard.adminLegalPages.titleAr')}</span>
                      <input
                        type="text"
                        value={section.title_ar}
                        onChange={(e) => updateField(i, 'title_ar', e.target.value)}
                        className="rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-left">
                      <span className="text-xs font-semibold text-ink-soft">{t('dashboard.adminLegalPages.titleEn')}</span>
                      <input
                        type="text"
                        dir="ltr"
                        value={section.title_en}
                        onChange={(e) => updateField(i, 'title_en', e.target.value)}
                        className="rounded-btn border border-line bg-surface p-2.5 text-left text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-right">
                      <span className="text-xs font-semibold text-ink-soft">{t('dashboard.adminLegalPages.bodyAr')}</span>
                      <textarea
                        rows={6}
                        value={section.body_ar}
                        onChange={(e) => updateField(i, 'body_ar', e.target.value)}
                        className="resize-y rounded-btn border border-line bg-surface p-3 text-sm leading-relaxed text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-left">
                      <span className="text-xs font-semibold text-ink-soft">{t('dashboard.adminLegalPages.bodyEn')}</span>
                      <textarea
                        rows={6}
                        dir="ltr"
                        value={section.body_en}
                        onChange={(e) => updateField(i, 'body_en', e.target.value)}
                        className="resize-y rounded-btn border border-line bg-surface p-3 text-left text-sm leading-relaxed text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1.5 rounded-xl border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
              >
                <Plus size={16} />
                {t('dashboard.adminLegalPages.addSection')}
              </button>
              <button
                type="button"
                disabled={updateLegalPage.isPending}
                onClick={handleSave}
                className="mr-auto rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {updateLegalPage.isPending ? t('dashboard.adminLegalPages.saving') : t('dashboard.adminLegalPages.save')}
              </button>
            </div>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
