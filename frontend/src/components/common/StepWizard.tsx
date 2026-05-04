// src/components/common/StepWizard.tsx
import clsx from 'clsx'

interface StepWizardProps {
  steps:       readonly string[]
  currentStep: number
}

export default function StepWizard({ steps, currentStep }: StepWizardProps) {
  return (
    <div className="flex items-center mb-8">
      {steps.map((label, i) => {
        const done    = i < currentStep
        const current = i === currentStep
        return (
          <div key={label} className="flex flex-col items-center flex-1 relative">
            {/* Connector line */}
            {i > 0 && (
              <div
                className={clsx(
                  'absolute right-1/2 top-[14px] w-full h-px',
                  i <= currentStep ? 'bg-brand-500' : 'bg-gray-800',
                )}
              />
            )}
            {/* Circle */}
            <div
              className={clsx(
                'relative z-10 w-7 h-7 rounded-full flex items-center justify-center',
                'text-[11px] font-bold font-mono border-2 transition-all duration-300',
                done    && 'bg-brand-500 border-brand-500 text-white',
                current && 'border-brand-500 text-brand-400 bg-brand-500/10',
                !done && !current && 'border-gray-700 text-gray-500 bg-gray-900',
              )}
            >
              {done ? '✓' : i + 1}
            </div>
            {/* Label */}
            <p
              className={clsx(
                'text-[9px] font-mono uppercase tracking-widest mt-1.5',
                (done || current) ? 'text-brand-400' : 'text-gray-600',
              )}
            >
              {label.split(' ')[0]}
            </p>
          </div>
        )
      })}
    </div>
  )
}
