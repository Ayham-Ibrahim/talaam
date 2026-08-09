import { useState } from 'react';
import { Search, User, X } from 'lucide-react';
import { useAdminStudentSearch } from '@/hooks/useAdminStudents';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

const MANUAL_BOOKING_FIELD_LABELS = { student_id: 'الطالب', reason: 'السبب' };

/**
 * Books a package (or enrolls in a course) on a student's behalf — for technical
 * issues or complaint resolutions per policy. Mirrors CreateManualBookingRequest /
 * CreateManualEnrollmentRequest exactly: student_id + mandatory reason only.
 * Packages always use the teacher's own fixed schedule (no admin-chosen date);
 * courses enroll into the whole existing date range.
 */
export function ManualBookingModal({ isPending, error, onConfirm, onClose }) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const { data: results = [] } = useAdminStudentSearch(query);

  const isValid = selectedStudent !== null && reason.trim() !== '';

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid) return;
    onConfirm({
      studentId: selectedStudent.id,
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminManualBooking.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminManualBooking.title')}</h3>
          <span className="w-8" />
        </div>

        {error && (
          <ApiErrorList error={error} labelFor={(path) => MANUAL_BOOKING_FIELD_LABELS[path] ?? path} className="mb-4" />
        )}

        <label className="flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('dashboard.adminManualBooking.studentLabel')}</span>
          {selectedStudent ? (
            <div className="flex items-center justify-between rounded-btn border border-line bg-primary-light/60 px-3 py-2.5">
              <button type="button" onClick={() => setSelectedStudent(null)} aria-label={t('dashboard.adminManualBooking.cancel')}>
                <X size={15} className="text-ink-soft hover:text-ink" />
              </button>
              <div className="text-right">
                <div className="text-sm font-semibold text-ink">{selectedStudent.name}</div>
                <div className="text-xs text-ink-soft" dir="ltr">
                  {selectedStudent.email}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('dashboard.adminManualBooking.studentSearchPlaceholder')}
                className={`w-full rounded-btn border bg-surface py-2.5 pl-3.5 pr-10 text-right text-sm text-ink focus:outline-none focus:ring-2 ${
                  touched && !selectedStudent ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
                }`}
              />
              {results.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
                  {results.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(student);
                        setQuery('');
                      }}
                      className="flex w-full items-center justify-end gap-2 px-4 py-2.5 text-right text-sm hover:bg-primary/5"
                    >
                      <div>
                        <div className="font-medium text-ink">{student.name}</div>
                        <div className="text-xs text-ink-soft" dir="ltr">
                          {student.email}
                        </div>
                      </div>
                      <User size={14} className="text-ink-soft" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {touched && !selectedStudent && <span className="text-xs text-accent-pink">{t('dashboard.adminManualBooking.studentRequired')}</span>}
        </label>

        <label className="mt-4 flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('dashboard.adminManualBooking.reasonLabel')}</span>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('dashboard.adminManualBooking.reasonPlaceholder')}
            maxLength={500}
            className={`w-full resize-none rounded-btn border bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
              touched && reason.trim() === '' ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
            }`}
          />
          <div className="text-left text-xs text-ink-soft/70">{reason.length}/500</div>
          {touched && reason.trim() === '' && <span className="text-xs text-accent-pink">{t('dashboard.adminManualBooking.reasonRequired')}</span>}
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.adminManualBooking.cancel')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? t('dashboard.adminManualBooking.saving') : t('dashboard.adminManualBooking.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
