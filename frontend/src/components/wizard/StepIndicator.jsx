import { Check } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="mb-8 flex items-center justify-between overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                  isComplete
                    ? 'bg-wish-gradient text-white'
                    : isActive
                    ? 'glass-panel ring-2 ring-wish-violet-500 text-wish-violet-600 dark:text-wish-violet-300'
                    : 'glass-panel text-wish-ink-700/50 dark:text-wish-ink-100/40'
                }`}
              >
                {isComplete ? <Check size={14} /> : stepNumber}
              </div>
              <span
                className={`hidden whitespace-nowrap text-[11px] font-medium sm:block ${
                  isActive ? 'text-wish-violet-600 dark:text-wish-violet-300' : 'text-wish-ink-700/50 dark:text-wish-ink-100/40'
                }`}
              >
                {step}
              </span>
            </div>
            {stepNumber < steps.length && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded transition ${
                  isComplete ? 'bg-wish-gradient' : 'bg-wish-violet-500/15'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
