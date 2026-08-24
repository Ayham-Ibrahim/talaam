import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Download, Plus, History } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { TeacherImportDropzone } from '@/components/dashboard/admin/TeacherImportDropzone';
import { TeacherImportResults } from '@/components/dashboard/admin/TeacherImportResults';
import { ImportBatchStatus } from '@/components/dashboard/admin/ImportBatchStatus';
import { AddTeacherAccountModal } from '@/components/dashboard/admin/AddTeacherAccountModal';
import { useAuth } from '@/hooks/useAuth';
import { useImportTeachers } from '@/hooks/useAdminTeacherImport';
import { useImportBatch } from '@/hooks/useImportBatches';
import { downloadTeacherImportTemplate } from '@/lib/csvTemplate';
import { useT } from '@/hooks/useT';

export function AdminTeacherImportPage() {
  const t = useT();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const importTeachers = useImportTeachers();
  // يوازي AdminStudentImportPage تماماً — راجع تعليقه لتفصيل سبب الاستطلاع الدوري.
  const batchId = importTeachers.data?.id;
  const { data: batch } = useImportBatch(batchId, { enabled: !!batchId });

  if (!user) return <Navigate to="/login" replace />;

  const handleImport = () => {
    if (!file) return;
    importTeachers.mutate(file);
  };

  const handleFileChange = (next) => {
    setFile(next);
    importTeachers.reset();
  };

  return (
    <AdminDashboardLayout>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-right">
          <div>
            <h1 className="text-xl font-bold text-ink">{t('dashboard.adminTeacherImport.title')}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminTeacherImport.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/admin/import-batches"
              className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-line/30"
            >
              <History size={16} />
              {t('dashboard.importBatches.title')}
            </Link>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              <Plus size={16} />
              {t('dashboard.adminTeacherImport.addTeacher')}
            </button>
            <button
              type="button"
              onClick={downloadTeacherImportTemplate}
              className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-line/30"
            >
              {t('dashboard.adminTeacherImport.downloadTemplate')}
              <Download size={16} />
            </button>
          </div>
        </div>

        <TeacherImportDropzone file={file} onFileChange={handleFileChange} />

        {importTeachers.isError && (
          <div className="rounded-btn bg-accent-pink/10 px-4 py-3 text-sm text-accent-pink">
            {importTeachers.error?.message || t('dashboard.adminTeacherImport.errorGeneric')}
          </div>
        )}

        <button
          type="button"
          disabled={!file || importTeachers.isPending}
          onClick={handleImport}
          className="rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {importTeachers.isPending ? t('dashboard.adminTeacherImport.importing') : t('dashboard.adminTeacherImport.import')}
        </button>

        {batch && (
          <ImportBatchStatus batch={batch} renderResults={(result) => <TeacherImportResults result={result} />} />
        )}
      </div>

      {showAddModal && <AddTeacherAccountModal onClose={() => setShowAddModal(false)} />}
    </AdminDashboardLayout>
  );
}
