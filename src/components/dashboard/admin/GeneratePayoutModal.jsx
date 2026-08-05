import { useState } from 'react';
import { X } from 'lucide-react';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { useAdminTeachers } from '@/hooks/useAdmin';
import { TEACHER_TYPE_LABELS } from '@/services/teacherService';
import { useT } from '@/hooks/useT';

/**
 * لا يوجد endpoint لمعاينة الجلسات/المبلغ قبل التوليد — الباك يحسبها ويُنشئ
 * كشف المستحقات مباشرة عند الإرسال (أو يرفض بخطأ إن لم توجد جلسات مكتملة
 * غير مدفوعة ضمن الفترة)، لذا لا معاينة هنا، فقط عرض رسالة الخطأ إن فشل.
 */
export function GeneratePayoutModal({ isPending, error, onConfirm, onClose }) {
  const t = useT();
  const [teacherId, setTeacherId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [touched, setTouched] = useState(false);

  const { data: teachersData } = useAdminTeachers({ status: 'verified' });
  const teachers = teachersData?.data ?? [];

  const isValid = teacherId !== '' && periodStart && periodEnd && periodEnd >= periodStart;

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid) return;
    onConfirm({ teacherId: Number(teacherId), periodStart, periodEnd });
  };

  const errorMessage = error?.errors?.period?.[0] ?? error?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminPayouts.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminPayouts.generateModalTitle')}</h3>
          <span className="w-8" />
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-btn bg-accent-pink/10 px-4 py-3 text-sm text-accent-pink">{errorMessage}</div>
        )}

        <div className="flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('dashboard.adminPayouts.providerLabel')}</span>
          <SmoothSelect
            value={teacherId}
            onChange={setTeacherId}
            placeholder="—"
            options={teachers.map((teacher) => ({
              value: String(teacher.id),
              label: `${teacher.name} · ${TEACHER_TYPE_LABELS[teacher.type] ?? teacher.type}`,
            }))}
          />
          {touched && teacherId === '' && <span className="text-xs text-accent-pink">{t('dashboard.adminPayouts.providerRequired')}</span>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminPayouts.periodStartLabel')}</span>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full rounded-btn border border-line bg-surface p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminPayouts.periodEndLabel')}</span>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full rounded-btn border border-line bg-surface p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
        {touched && !(periodStart && periodEnd && periodEnd >= periodStart) && (
          <span className="mt-1.5 block text-xs text-accent-pink">{t('dashboard.adminPayouts.periodRequired')}</span>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.adminPayouts.cancel')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.adminPayouts.confirmGenerate')}
          </button>
        </div>
      </div>
    </div>
  );
}
