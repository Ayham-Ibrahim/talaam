import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, KeyRound, Trash2, X } from 'lucide-react';
import { Avatar, ApiErrorList } from '@/components/ui';
import { TeacherStatusBadge } from './TeacherStatusBadge';
import { ChangeTeacherPasswordModal } from './ChangeTeacherPasswordModal';
import { TEACHER_TYPE_LABELS } from '@/mocks/admin.mock';
import { formatDate } from '@/lib/formatters';
import { useDeleteTeacher } from '@/hooks/useAdmin';
import { useT } from '@/hooks/useT';

/**
 * تأكيد الحذف مبني هنا مباشرة (لا يستخدم ConfirmModal المشترك) عمداً — يحتاج
 * عرض رسالة فشل داخل النافذة نفسها (لا مكان آخر مرئي أثناء فتحها)، وConfirmModal
 * لا يدعم children حالياً؛ توسيعه يمسّ كل الاستخدامات الأخرى له في المشروع.
 */
function DeleteTeacherModal({ teacher, isPending, error, onConfirm, onClose }) {
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
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminTeachers.deleteModalTitle')}</h3>
          <span className="w-8" />
        </div>

        <p className="text-center text-sm text-ink-soft">
          {t('dashboard.adminTeachers.deleteModalMessage')} <strong className="text-ink">{teacher.name}</strong>
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

export function AdminTeachersTable({ teachers }) {
  const t = useT();
  const [deletingTeacher, setDeletingTeacher] = useState(null);
  const [passwordModalTeacher, setPasswordModalTeacher] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const deleteTeacher = useDeleteTeacher();

  const handleConfirmDelete = () => {
    deleteTeacher.mutate(deletingTeacher.id, {
      onSuccess: () => {
        setDeletingTeacher(null);
        setSuccessMessage(t('dashboard.adminTeachers.deleteSuccess'));
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
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTeachers.colTeacher')}</th>
              <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTeachers.colType')}</th>
              <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTeachers.colStatus')}</th>
              <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTeachers.colSubmitted')}</th>
              <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTeachers.colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {teachers.map((teacher, i) => (
              <tr key={teacher.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Avatar name={teacher.name} src={teacher.avatar} size="sm" className="!h-9 !w-9" />
                    <div className="text-right">
                      <div className="font-semibold text-ink">{teacher.name}</div>
                      <div className="text-xs text-ink-soft" dir="ltr">
                        {teacher.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-ink-soft">{TEACHER_TYPE_LABELS[teacher.type]}</td>
                <td className="px-4 py-4 text-right">
                  <TeacherStatusBadge status={teacher.status} />
                </td>
                <td className="px-4 py-4 text-right text-ink-soft">{formatDate(teacher.submittedAt)}</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <Link
                      to={`/dashboard/admin/teachers/${teacher.id}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:opacity-70"
                    >
                      <Eye size={18} />
                      {t('dashboard.adminTeachers.view')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPasswordModalTeacher(teacher)}
                      className="inline-flex items-center gap-1.5 text-primary hover:opacity-70"
                    >
                      <KeyRound size={18} />
                      {t('dashboard.adminTeachers.changePassword')}
                    </button>
                    {/* الحذف متاح فقط لمعلم مرفوض (RULE، الباك اند يتحقق منها
                        أيضاً) — لا يملك حجوزات/مدفوعات حقيقية، فحذفه آمن نهائياً */}
                    {teacher.status === 'rejected' && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteTeacher.reset();
                          setDeletingTeacher(teacher);
                        }}
                        title={t('dashboard.adminTeachers.deleteTeacher')}
                        className="inline-flex items-center gap-1.5 text-accent-pink hover:opacity-70"
                      >
                        <Trash2 size={18} />
                        {t('dashboard.adminTeachers.deleteTeacher')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deletingTeacher && (
        <DeleteTeacherModal
          teacher={deletingTeacher}
          isPending={deleteTeacher.isPending}
          error={deleteTeacher.error}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingTeacher(null)}
        />
      )}

      {passwordModalTeacher && (
        <ChangeTeacherPasswordModal
          teacher={passwordModalTeacher}
          onClose={() => setPasswordModalTeacher(null)}
        />
      )}
    </div>
  );
}
