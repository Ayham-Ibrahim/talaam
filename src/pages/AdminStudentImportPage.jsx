import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Download, Plus, History } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { StudentImportDropzone } from '@/components/dashboard/admin/StudentImportDropzone';
import { StudentImportResults } from '@/components/dashboard/admin/StudentImportResults';
import { ImportBatchStatus } from '@/components/dashboard/admin/ImportBatchStatus';
import { AddStudentAccountModal } from '@/components/dashboard/admin/AddStudentAccountModal';
import { useAuth } from '@/hooks/useAuth';
import { useImportStudents } from '@/hooks/useAdminStudentImport';
import { useImportBatch } from '@/hooks/useImportBatches';
import { downloadStudentImportTemplate } from '@/lib/csvTemplate';
import { useT } from '@/hooks/useT';

export function AdminStudentImportPage() {
  const t = useT();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const importStudents = useImportStudents();
  // الاستيراد يعمل الآن في الخلفية (queued فور الرفع) — نتابع تقدّمه هنا
  // باستطلاع دوري بدل انتظار استجابة الطلب الأصلي، راجع useImportBatch.
  const batchId = importStudents.data?.id;
  const { data: batch } = useImportBatch(batchId, { enabled: !!batchId });

  if (!user) return <Navigate to="/login" replace />;

  const handleImport = () => {
    if (!file) return;
    importStudents.mutate(file);
  };

  const handleFileChange = (next) => {
    setFile(next);
    importStudents.reset();
  };

  return (
    <AdminDashboardLayout>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-right">
          <div>
            <h1 className="text-xl font-bold text-ink">{t('dashboard.adminStudentImport.title')}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminStudentImport.subtitle')}</p>
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
              {t('dashboard.adminStudentImport.addStudent')}
            </button>
            <button
              type="button"
              onClick={downloadStudentImportTemplate}
              className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-line/30"
            >
              {t('dashboard.adminStudentImport.downloadTemplate')}
              <Download size={16} />
            </button>
          </div>
        </div>

        <StudentImportDropzone file={file} onFileChange={handleFileChange} />

        {importStudents.isError && (
          <div className="rounded-btn bg-accent-pink/10 px-4 py-3 text-sm text-accent-pink">
            {importStudents.error?.message || t('dashboard.adminStudentImport.errorGeneric')}
          </div>
        )}

        <button
          type="button"
          disabled={!file || importStudents.isPending}
          onClick={handleImport}
          className="rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {importStudents.isPending ? t('dashboard.adminStudentImport.importing') : t('dashboard.adminStudentImport.import')}
        </button>

        {batch && (
          <ImportBatchStatus batch={batch} renderResults={(result) => <StudentImportResults result={result} />} />
        )}
      </div>

      {showAddModal && <AddStudentAccountModal onClose={() => setShowAddModal(false)} />}
    </AdminDashboardLayout>
  );
}
