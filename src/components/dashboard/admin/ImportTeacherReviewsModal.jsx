import { useState } from 'react';
import { X, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react';
import { useImportTeacherReviews } from '@/hooks/useAdminSettings';
import { useT } from '@/hooks/useT';

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // يطابق max:5120 بالـ FormRequest

export function ImportTeacherReviewsModal({ teacherId, onClose }) {
  const t = useT();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const importReviews = useImportTeacherReviews(teacherId);

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0] ?? null;
    setFileError(null);
    importReviews.reset();

    if (!picked) {
      setFile(null);
      return;
    }

    const ext = picked.name.slice(picked.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setFileError(t('dashboard.adminTeacherDetail.reviewsFileTypeError'));
      setFile(null);
      return;
    }
    if (picked.size > MAX_SIZE_BYTES) {
      setFileError(t('dashboard.adminTeacherDetail.reviewsFileSizeError'));
      setFile(null);
      return;
    }
    setFile(picked);
  };

  const handleUpload = () => {
    if (!file) return;
    importReviews.mutate(file);
  };

  const result = importReviews.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminTeacherDetail.reviewsClose')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminTeacherDetail.reviewsUploadButton')}</h3>
          <span className="w-8" />
        </div>

        {!result ? (
          <>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line p-6 text-center hover:border-primary/50">
              <FileSpreadsheet size={28} className="text-ink-soft" />
              <span className="text-sm font-medium text-ink">
                {file ? file.name : t('dashboard.adminTeacherDetail.reviewsChooseFile')}
              </span>
              <input type="file" accept={ACCEPTED_EXTENSIONS.join(',')} onChange={handleFileChange} className="hidden" />
            </label>

            {fileError && <p className="mt-2 text-xs text-accent-pink">{fileError}</p>}
            {importReviews.isError && (
              <p className="mt-2 text-xs text-accent-pink">
                {importReviews.error?.message || t('dashboard.adminTeacherDetail.reviewsUploadFailed')}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
              >
                {t('dashboard.adminTeacherDetail.reviewsCancel')}
              </button>
              <button
                type="button"
                disabled={!file || importReviews.isPending}
                onClick={handleUpload}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {importReviews.isPending ? t('dashboard.adminTeacherDetail.reviewsUploading') : t('dashboard.adminTeacherDetail.reviewsUpload')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl bg-success-light p-4">
                <CheckCircle2 size={20} className="text-success" />
                <span className="text-xl font-bold text-success">{result.imported}</span>
                <span className="text-xs text-ink-soft">{t('dashboard.adminTeacherDetail.reviewsImportedCount')}</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl bg-accent-pink/10 p-4">
                <XCircle size={20} className="text-accent-pink" />
                <span className="text-xl font-bold text-accent-pink">{result.failed}</span>
                <span className="text-xs text-ink-soft">{t('dashboard.adminTeacherDetail.reviewsFailedCount')}</span>
              </div>
            </div>

            {result.errors?.length > 0 && (
              <div className="mt-4 max-h-40 overflow-y-auto rounded-xl border border-line">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-line bg-canvas">
                      <th className="px-3 py-2 text-start font-bold text-ink">{t('dashboard.adminTeacherDetail.reviewsRowCol')}</th>
                      <th className="px-3 py-2 text-start font-bold text-ink">{t('dashboard.adminTeacherDetail.reviewsErrorCol')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {result.errors.map((err) => (
                      <tr key={err.row}>
                        <td className="px-3 py-2 text-ink-soft">{err.row}</td>
                        <td className="px-3 py-2 text-accent-pink">{Object.values(err.errors).flat().join('، ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t('dashboard.adminTeacherDetail.reviewsDone')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
