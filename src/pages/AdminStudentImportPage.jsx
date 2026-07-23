import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { StudentImportDropzone } from '@/components/dashboard/admin/StudentImportDropzone';
import { StudentImportResults } from '@/components/dashboard/admin/StudentImportResults';
import { useAuth } from '@/hooks/useAuth';
import { useImportStudents } from '@/hooks/useAdminStudentImport';
import { downloadStudentImportTemplate } from '@/lib/csvTemplate';
import { useT } from '@/hooks/useT';

export function AdminStudentImportPage() {
  const t = useT();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const importStudents = useImportStudents();

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
          <button
            type="button"
            onClick={downloadStudentImportTemplate}
            className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-line/30"
          >
            {t('dashboard.adminStudentImport.downloadTemplate')}
            <Download size={16} />
          </button>
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

        {importStudents.isSuccess && <StudentImportResults result={importStudents.data} />}
      </div>
    </AdminDashboardLayout>
  );
}
