
// Step Wizard 
export const STEPS_LABELS = [
  { label: "Personal", icon: "👤" },
  { label: "Lifestyle", icon: "🏃" },
  { label: "Heart", icon: "🫀" },
  { label: "Vitals", icon: "💉" },
  { label: "Labs", icon: "🔬" },
  { label: "Symptoms", icon: "📋" },
  { label: "Review", icon: "✅" },
];

export function StepWizardPro({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative mb-6 sm:mb-8 -mx-1 px-1 overflow-x-auto">
      <div className="relative flex items-start justify-between min-w-[420px] sm:min-w-0 pb-1">
        {/* connecting line */}
        <div className="absolute top-[18px] left-2 right-2 h-px bg-gray-800 z-0" />
        <div
          className="absolute top-[18px] left-1 right-1 h-px bg-brand-500 z-0 transition-all duration-500"
          style={{ width: `${(currentStep / (STEPS_LABELS.length - 1)) * 100}%` }}
        />

        {STEPS_LABELS.map((s, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={s.label} className="relative z-10 flex flex-col items-center gap-0.5">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-[13px]
                  border-2 transition-all duration-300
                  ${
                    done
                      ? "bg-brand-500 border-brand-500 text-white"
                      : active
                        ? "bg-gray-900 border-brand-500 text-brand-400 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                        : "bg-gray-900 border-gray-700 text-gray-600"
                  }
                `}
              >
                {done ? (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path
                      d="M2 6.5L5.5 10L11 3"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span>{s.icon}</span>
                )}
              </div>
              <span
                className={`text-[9px] font-mono font-semibold uppercase tracking-widest whitespace-nowrap transition-colors duration-300
                  ${active ? "text-brand-400" : done ? "text-gray-400" : "text-gray-600"}
                `}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}