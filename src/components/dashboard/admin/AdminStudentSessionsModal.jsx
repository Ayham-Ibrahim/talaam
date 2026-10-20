import { X } from 'lucide-react';
import { AdminSessionsPanel } from './AdminSessionsPanel';
import { useT } from '@/hooks/useT';

/** جلسات طالب من جدول "إدارة الطلاب" (عمود الإجراءات) — مع زر تعديل الموعد لكل جلسة */
export function AdminStudentSessionsModal({ student, onClose }) {
  const t = useT();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminSessions.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">
            {t('dashboard.adminSessions.studentSessionsTitle')}: {student.name}
          </h3>
          <span className="w-8" />
        </div>

        <div className="overflow-y-auto">
          <AdminSessionsPanel studentId={student.id} />
        </div>
      </div>
    </div>
  );
}
