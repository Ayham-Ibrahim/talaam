import { useState } from 'react';
import { X } from 'lucide-react';
import { WizardStepIndicator } from '@/components/dashboard/WizardStepIndicator';
import { SupportPackageWizardBasicInfo } from './SupportPackageWizardBasicInfo';
import { SupportPackageWizardPricing } from './SupportPackageWizardPricing';
import { useAdminUpdateSupportPackage } from '@/hooks/useAcademicSupporters';
import { useT } from '@/hooks/useT';

const STEPS = [
  { no: 2, key: 'pricing' },
  { no: 1, key: 'basicInfo' },
];

/**
 * تعديل أدمن لباقة دعم موجودة — نفس خطوتي AddSupportPackageModal بالضبط
 * (راجعه للتعليقات)، لكن مُعبّأ مسبقاً وموجّه لـ PUT بدل POST. الباك اند يرفض
 * الحفظ (422) لو وُجدت عمليات شراء قائمة على الباقة — نعرض الخطأ كما هو، بلا
 * فحص مسبق بالفرونت (نفس فلسفة زر disable الموجود أصلاً).
 */
export function EditSupportPackageModal({ supporterId, supportPackage, onClose }) {
  const t = useT();
  const updateSupportPackage = useAdminUpdateSupportPackage(supporterId);

  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    title: supportPackage.title ?? '',
    tier: supportPackage.tier ?? 'basic',
    subjectIds: supportPackage.subjectIds ?? [],
    description: supportPackage.description ?? '',
    price: String(supportPackage.studentPrice ?? ''),
    supporterProfitPercent: String(supportPackage.supporterProfitPercent ?? ''),
  });
  const patchData = (patch) => setData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    updateSupportPackage.mutate(
      {
        id: supportPackage.id,
        payload: {
          title: data.title.trim(),
          tier: data.tier,
          subject_ids: data.subjectIds,
          description: data.description.trim(),
          price: Number(data.price),
          supporter_profit_percent: Number(data.supporterProfitPercent),
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.addSupportPackage.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.editSupportPackage.title')}</h3>
          <span className="w-8" />
        </div>

        <p className="mb-4 shrink-0 text-sm text-ink-soft">{t('dashboard.editSupportPackage.hint')}</p>

        <div className="shrink-0">
          <WizardStepIndicator steps={STEPS} currentStep={step} translationPrefix="dashboard.addSupportPackage.steps" />
        </div>

        <div className="mt-4 overflow-y-auto">
          {step === 1 && <SupportPackageWizardBasicInfo data={data} onChange={patchData} onNext={() => setStep(2)} />}
          {step === 2 && (
            <SupportPackageWizardPricing
              data={data}
              onChange={patchData}
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
              isPending={updateSupportPackage.isPending}
              error={updateSupportPackage.isError ? updateSupportPackage.error : null}
              submitLabel={t('dashboard.editSupportPackage.submit')}
              submittingLabel={t('dashboard.editSupportPackage.submitting')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
