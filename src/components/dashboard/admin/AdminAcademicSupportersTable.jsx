import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, KeyRound, Trash2, X } from 'lucide-react';
import { Avatar, ApiErrorList } from '@/components/ui';
import { AcademicSupporterStatusBadge } from './AcademicSupporterStatusBadge';
import { ChangeAcademicSupporterPasswordModal } from './ChangeAcademicSupporterPasswordModal';
import { useDeleteAcademicSupporter } from '@/hooks/useAcademicSupporters';
import { useT } from '@/hooks/useT';

function DeleteAcademicSupporterModal({ supporter, isPending, error, onConfirm, onClose }) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminTeachers.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminAcademicSupporters.deleteModalTitle')}</h3>
          <span className="w-8" />
        </div>

        <p className="text-center text-sm text-ink-soft">
          {t('dashboard.adminAcademicSupporters.deleteModalMessage')} <strong className="text-ink">{supporter.name}</strong>
        </p>

        {error && <ApiErrorList error={error} labelFor={() => null} className="mt-4" />}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.adminTeachers.close')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-accent-pink py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? t('dashboard.adminTeachers.deleting') : t('dashboard.adminTeachers.deleteConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminAcademicSupportersTable({ supporters }) {
  const t = useT();
  const [deletingSupporter, setDeletingSupporter] = useState(null);
  const [passwordModalSupporter, setPasswordModalSupporter] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const deleteSupporter = useDeleteAcademicSupporter();

  const handleConfirmDelete = () => {
    deleteSupporter.mutate(deletingSupporter.id, {
      onSuccess: () => {
        setDeletingSupporter(null);
        setSuccessMessage(t('dashboard.adminAcademicSupporters.deleteSuccess'));
        setTimeout(() => setSuccessMessage(''), 4000);
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {successMessage && (
        <div className="rounded-2xl bg-success-light px-4 py-3 text-sm font-medium text-success">{successMessage}</div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminAcademicSupporters.colSupporter')}</th>
              <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminAcademicSupporters.colStatus')}</th>
              <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminAcademicSupporters.colCreated')}</th>
              <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminAcademicSupporters.colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {supporters.map((supporter, i) => (
              <tr key={supporter.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Avatar name={supporter.name} src={supporter.avatar} size="sm" className="!h-9 !w-9" />
                    <div className="text-right">
                      <div className="font-semibold text-ink">{supporter.name}</div>
                      <div className="text-xs text-ink-soft" dir="ltr">
                        {supporter.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <AcademicSupporterStatusBadge status={supporter.status} />
                </td>
                <td className="px-4 py-4 text-right text-ink-soft">{supporter.createdAt}</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <Link
                      to={`/dashboard/admin/academic-supporters/${supporter.id}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:opacity-70"
                    >
                      <Eye size={18} />
                      {t('dashboard.adminTeachers.view')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPasswordModalSupporter(supporter)}
                      className="inline-flex items-center gap-1.5 text-primary hover:opacity-70"
                    >
                      <KeyRound size={18} />
                      {t('dashboard.adminTeachers.changePassword')}
                    </button>
                    {supporter.status === 'suspended' && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteSupporter.reset();
                          setDeletingSupporter(supporter);
                        }}
                        title={t('dashboard.adminAcademicSupporters.deleteSupporter')}
                        className="inline-flex items-center gap-1.5 text-accent-pink hover:opacity-70"
                      >
                        <Trash2 size={18} />
                        {t('dashboard.adminAcademicSupporters.deleteSupporter')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deletingSupporter && (
        <DeleteAcademicSupporterModal
          supporter={deletingSupporter}
          isPending={deleteSupporter.isPending}
          error={deleteSupporter.error}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingSupporter(null)}
        />
      )}

      {passwordModalSupporter && (
        <ChangeAcademicSupporterPasswordModal
          supporter={passwordModalSupporter}
          onClose={() => setPasswordModalSupporter(null)}
        />
      )}
    </div>
  );
}
