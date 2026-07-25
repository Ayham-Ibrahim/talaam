import { useState } from 'react';
import { X } from 'lucide-react';
import { PackageWizardStepIndicator } from './PackageWizardStepIndicator';
import { PackageWizardBasicInfo } from './PackageWizardBasicInfo';
import { PackageWizardScheduling } from './PackageWizardScheduling';
import { PackageWizardPricing } from './PackageWizardPricing';
import { PackageWizardReview } from './PackageWizardReview';
import { SUBJECT_OPTIONS } from '@/lib/packageWizardOptions';
import { calculateStudentPrice, DEFAULT_MARGIN_PERCENT } from '@/lib/pricing';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTeacherPackage } from '@/hooks/useDashboard';
import { useT } from '@/hooks/useT';

const INITIAL_DATA = {
  sessionType: 'individual',
  curriculum: '',
  subject: '',
  sessionsCount: '',
  description: '',
  selectedSlots: [],
  teacherPrice: '',
};

export function AddPackageModal({ onClose }) {
  const t = useT();
  const { user } = useAuth();
  const teacherType = user?.teacherType;
  const createPackage = useCreateTeacherPackage();

  const [step, setStep] = useState(1);
  const [data, setData] = useState(() => ({
    ...INITIAL_DATA,
    sessionType: teacherType === 'training_center' ? 'training' : 'individual',
  }));

  const patchData = (patch) => setData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    const { studentPrice } = calculateStudentPrice(Number(data.teacherPrice), DEFAULT_MARGIN_PERCENT);
    const subjectLabel = SUBJECT_OPTIONS.find((o) => o.value === data.subject)?.label ?? '';
    createPackage.mutate(
      {
        packageTitle: data.sessionType === 'training' ? 'دورة تدريبية' : `باقة ${data.sessionsCount} جلسات`,
        type: data.sessionType,
        subject: subjectLabel,
        sessionsCount: Number(data.sessionsCount),
        price: studentPrice,
      },
      { onSuccess: () => onClose?.() }
    );
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

      <PackageWizardStepIndicator currentStep={step} />

      {step === 1 && (
        <PackageWizardBasicInfo data={data} onChange={patchData} teacherType={teacherType} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <PackageWizardScheduling data={data} onChange={patchData} onNext={() => setStep(3)} onBack={() => setStep(1)} />
      )}
      {step === 3 && (
        <PackageWizardPricing data={data} onChange={patchData} onNext={() => setStep(4)} onBack={() => setStep(2)} />
      )}
      {step === 4 && (
        <PackageWizardReview
          data={data}
          isPending={createPackage.isPending}
          onSubmit={handleSubmit}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  );
}
