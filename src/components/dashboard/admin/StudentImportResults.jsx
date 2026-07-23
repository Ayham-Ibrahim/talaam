import { CheckCircle2, XCircle } from 'lucide-react';
import { useT } from '@/hooks/useT';

export function StudentImportResults({ result }) {
  const t = useT();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-light text-success">
            <CheckCircle2 size={22} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-ink">{result.imported}</div>
            <div className="text-sm text-ink-soft">{t('dashboard.adminStudentImport.importedLabel')}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-pink/10 text-accent-pink">
            <XCircle size={22} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-ink">{result.failed}</div>
            <div className="text-sm text-ink-soft">{t('dashboard.adminStudentImport.failedLabel')}</div>
          </div>
        </div>
      </div>

      {result.errors?.length > 0 && (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-3 text-right font-bold text-ink">{t('dashboard.adminStudentImport.colRow')}</th>
                <th className="px-4 py-3 text-right font-bold text-ink">{t('dashboard.adminStudentImport.colError')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {result.errors.map((err) => (
                <tr key={err.row}>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{err.row}</td>
                  <td className="px-4 py-3 text-right text-accent-pink">
                    {Object.values(err.errors).flat().join('، ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
