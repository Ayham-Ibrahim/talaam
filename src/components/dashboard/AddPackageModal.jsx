import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { WizardStepIndicator } from './WizardStepIndicator';
import { PackageWizardBasicInfo } from './PackageWizardBasicInfo';
import { PackageWizardScheduling } from './PackageWizardScheduling';
import { PackageWizardPricing } from './PackageWizardPricing';
import { PackageWizardReview } from './PackageWizardReview';
import { Skeleton } from '@/components/ui';
import { useCreateTeacherPackage, useTeacherPackage, useUpdateTeacherPackage } from '@/hooks/useDashboard';
import { useT } from '@/hooks/useT';

const INITIAL_DATA = {
  title: '',
  session_format: 'individual',
  capacity: '1',
  subject_id: '',
  curriculum_ids: [],
  stage_ids: [],
  sessions_count: '',
  discount_percent: '',
  description: '',
  schedules: [],
  teacher_price: '',
};

const STEPS = [
  { no: 4, key: 'review' },
  { no: 3, key: 'pricing' },
  { no: 2, key: 'scheduling' },
  { no: 1, key: 'basicInfo' },
];

/** سطر قائمة الباقات لا يحمل curricula/stages (index() لا يحمّلها) — لذا نحتاج جلب الباقة كاملة قبل ملء نموذج التعديل/العرض */
function mapPackageToWizardData(pkg) {
  const curriculumIds = Array.isArray(pkg.curriculum_ids) ? pkg.curriculum_ids : (pkg.curricula ?? []).map((c) => c.id);
  const stageIds = Array.isArray(pkg.stage_ids) ? pkg.stage_ids : (pkg.stages ?? []).map((s) => s.id);
  const schedules = (pkg.schedules ?? []).map((s) =>
    pkg.session_format === 'individual' ? { day_of_week: s.day_of_week } : { date: s.date, start_time: s.start_time }
  );

  return {
    title: pkg.title ?? '',
    session_format: pkg.session_format ?? 'individual',
    capacity: pkg.capacity ?? '1',
    subject_id: pkg.subject_id ?? '',
    curriculum_ids: curriculumIds,
    stage_ids: stageIds,
    sessions_count: pkg.sessions_count ?? '',
    discount_percent: pkg.discount_percent ?? '',
    description: pkg.description ?? '',
    schedules,
    teacher_price: pkg.teacher_price ?? '',
  };
}

/**
 * ثلاثة أوضاع: إنشاء (بلا packageId) دائماً مسودة جديدة، تعديل (packageId فقط)
 * يملأ النموذج من الباقة الحالية ويستدعي update، وعرض (packageId + readOnly)
 * يقفز مباشرة لخطوة المراجعة كملخّص للقراءة فقط بلا أي استدعاء تعديل.
 */
/**
 * أي مفتاح خطأ من الباك اند (title, subject_id, schedules.0.date...) يعود
 * لخطوة معينة في المعالج — يُستخدم لإعادة المستخدم تلقائياً لأول خطوة فيها
 * حقل ناقص بعد فشل الحفظ في خطوة المراجعة (حيث لا تظهر هذه الحقول أصلاً).
 */
function fieldStepOf(key) {
  if (key === 'teacher_price') return 3;
  if (key === 'schedules' || key.startsWith('schedules.')) return 2;
  return 1; // title, subject_id, session_format, capacity, curriculum_ids*, stage_ids*, sessions_count, discount_percent, description
}

export function AddPackageModal({ onClose, packageId, readOnly = false }) {
  const t = useT();
  const isEditing = !!packageId;
  const { data: existingPackage, isLoading: isLoadingPackage } = useTeacherPackage(packageId);
  const createPackage = useCreateTeacherPackage();
  const updatePackage = useUpdateTeacherPackage();

  const [step, setStep] = useState(readOnly ? 4 : 1);
  const [data, setData] = useState(INITIAL_DATA);
  const [hydrated, setHydrated] = useState(!isEditing);

  const isPending = isEditing ? updatePackage.isPending : createPackage.isPending;
  const activeMutation = isEditing ? updatePackage : createPackage;
  const submitError = activeMutation.isError ? activeMutation.error : null;
  const serverErrors = submitError?.errors ?? null;

  useEffect(() => {
    if (existingPackage && !hydrated) {
      setData(mapPackageToWizardData(existingPackage));
      setHydrated(true);
    }
  }, [existingPackage, hydrated]);

  // فشل الحفظ يحدث دوماً من خطوة المراجعة (الأخيرة) — بلا هذا، يبقى المستخدم
  // على شاشة المراجعة يرى ملخصاً عاماً للأخطاء بلا أي حقل فعلي ليصلحه.
  useEffect(() => {
    if (!serverErrors) return;
    const earliestStep = Math.min(...Object.keys(serverErrors).map(fieldStepOf));
    setStep(earliestStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitError]);

  const patchData = (patch) => {
    setData((prev) => ({ ...prev, ...patch }));
    // خطأ الباك اند يبقى معروضاً بصرف النظر عن التعديل ما لم نُصفّه صراحة —
    // بمجرد أن يعدّل المستخدم أي حقل، الفحص المحلي (touched) يتولى الإبراز
    // بدلاً منه، فتصفيته هنا تمنع بقاء إطار أحمر لحقل أُصلح فعلاً.
    if (activeMutation.isError) activeMutation.reset();
  };

  const handleSaveDraft = () => {
    const payload = {
      title: data.title.trim(),
      description: data.description.trim(),
      subject_id: Number(data.subject_id),
      session_format: data.session_format,
      capacity: Number(data.capacity),
      sessions_count: Number(data.sessions_count),
      teacher_price: Number(data.teacher_price),
      currency: 'USD',
      discount_percent: data.discount_percent ? Number(data.discount_percent) : null,
      curriculum_ids: data.curriculum_ids,
      stage_ids: data.stage_ids,
      schedules: data.schedules,
    };

    if (isEditing) {
      updatePackage.mutate({ id: packageId, payload }, { onSuccess: () => onClose?.() });
    } else {
      createPackage.mutate(payload, { onSuccess: () => onClose?.() });
    }
  };

  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-card sm:p-8">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t('dashboard.teacherPackages.close')}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
        >
          <X size={18} />
        </button>
      )}

      {isEditing && !hydrated ? (
        <div className="mt-8 flex flex-col gap-3">
          {isLoadingPackage ? (
            <>
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </>
          ) : (
            <p className="text-center text-sm text-accent-pink">{t('dashboard.teacherPackages.empty')}</p>
          )}
        </div>
      ) : (
        <>
          {!readOnly && <WizardStepIndicator steps={STEPS} currentStep={step} translationPrefix="dashboard.addPackage.steps" />}

          {step === 1 && (
            <PackageWizardBasicInfo data={data} onChange={patchData} onNext={() => setStep(2)} serverErrors={serverErrors} />
          )}
          {step === 2 && (
            <PackageWizardScheduling
              data={data}
              onChange={patchData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              serverErrors={serverErrors}
            />
          )}
          {step === 3 && (
            <PackageWizardPricing
              data={data}
              onChange={patchData}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
              serverErrors={serverErrors}
            />
          )}
          {step === 4 && (
            <PackageWizardReview
              data={data}
              isPending={isPending}
              error={submitError}
              onSubmit={handleSaveDraft}
              onBack={() => setStep(3)}
              readOnly={readOnly}
              onClose={onClose}
            />
          )}
        </>
      )}
    </div>
  );
}
