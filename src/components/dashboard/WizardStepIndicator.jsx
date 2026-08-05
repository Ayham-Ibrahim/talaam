import { useT } from '@/hooks/useT';

/**
 * Generic step indicator shared by the package and course creation wizards.
 * DOM order renders right-to-left, so step "1" (last in `steps`) lands active/rightmost.
 */
export function WizardStepIndicator({ steps, currentStep, translationPrefix }) {
  const t = useT();

  return (
    <div className="flex items-center justify-center gap-2 px-16">
      {steps.map((step, i) => {
        const isDone = step.no < currentStep;
        const isActive = step.no === currentStep;
        const isConnectorActive = steps[i + 1]?.no <= currentStep;
        return (
          <div key={step.no} className="flex flex-1 items-center gap-2 last:flex-none">
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-medium ${
                  isActive || isDone ? 'bg-primary text-white' : 'bg-[#E5E5EA] text-[#626262]'
                }`}
              >
                {step.no}
              </span>
              <span className="whitespace-nowrap text-sm font-medium text-ink">{t(`${translationPrefix}.${step.key}`)}</span>
            </div>
            {i < steps.length - 1 && <span className={`h-0.5 flex-1 rounded-full ${isConnectorActive ? 'bg-primary' : 'bg-[#E5E5EA]'}`} />}
          </div>
        );
      })}
    </div>
  );
}
