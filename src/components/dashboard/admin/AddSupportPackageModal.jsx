import { useState } from 'react';
import { X } from 'lucide-react';
import { WizardStepIndicator } from '@/components/dashboard/WizardStepIndicator';
import { SupportPackageWizardBasicInfo } from './SupportPackageWizardBasicInfo';
import { SupportPackageWizardPricing } from './SupportPackageWizardPricing';
import { useAdminCreateSupportPackage } from '@/hooks/useAcademicSupporters';
import { useT } from '@/hooks/useT';

const STEPS = [
  { no: 2, key: 'pricing' },
  { no: 1, key: 'basicInfo' },
];

const INITIAL_DATA = { title: '', tier: 'basic', subjectIds: [], description: '', price: '', supporterProfitPercent: '' };

/**
 * إنشاء باقة دعم من لوحة الأدمن وربطها مباشرة بداعم واحد محدد (supporterId —
 * صفحة ذلك الداعم بالذات بلوحة الأدمن، فلا حاجة لمنتقي داعم هنا). الداعم
 * نفسه لم يعد ينشئ باقاته (راجع SupportPackagePolicy::create) — الأدمن يضع
 * سعر الباقة النهائي ونسبة ربح الداعم منه، والباقة تُنشَر فوراً status=active
 * بلا مرحلة مراجعة (الأدمن بإنشائه إياها هو نفسه الموافقة). خطوتان (محتوى ثم
 * تسعير) داخل مودال بارتفاع محدود (max-h-[90vh] + تمرير داخلي) بدل فورم واحد
 * طويل — كان يفيض عن الشاشة على الموبايل وحتى بعض شاشات الديسكتوب.
 */
export function AddSupportPackageModal({ supporterId, onClose }) {
  const t = useT();
  const createSupportPackage = useAdminCreateSupportPackage(supporterId);

  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL_DATA);
  const patchData = (patch) => setData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    createSupportPackage.mutate(
      {
        academic_supporter_id: supporterId,
        title: data.title.trim(),
        tier: data.tier,
        subject_ids: data.subjectIds,
        description: data.description.trim(),
        price: Number(data.price),
        supporter_profit_percent: Number(data.supporterProfitPercent),
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
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.addSupportPackage.title')}</h3>
          <span className="w-8" />
        </div>

        <p className="mb-4 shrink-0 text-sm text-ink-soft">{t('dashboard.addSupportPackage.hint')}</p>

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
              isPending={createSupportPackage.isPending}
              error={createSupportPackage.isError ? createSupportPackage.error : null}
              submitLabel={t('dashboard.addSupportPackage.submit')}
              submittingLabel={t('dashboard.addSupportPackage.submitting')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
