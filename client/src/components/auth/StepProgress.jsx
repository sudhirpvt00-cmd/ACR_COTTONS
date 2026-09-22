import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { step: 1, title: 'Details', subtitle: 'Basic Info' },
  { step: 2, title: 'Verify', subtitle: '6-digit OTP' },
  { step: 3, title: 'Secure', subtitle: 'Create Password' },
];

export default function StepProgress({ currentStep = 1 }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-stone-200 z-0" />
        
        {/* Active Progress Fill */}
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-gradient-to-r from-orange-600 to-amber-600 z-0 transition-all duration-500 ease-out"
          style={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
          }}
        />

        {STEPS.map((item) => {
          const isCompleted = currentStep > item.step;
          const isCurrent = currentStep === item.step;

          return (
            <div
              key={item.step}
              className="relative z-10 flex flex-col items-center group cursor-default"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : isCurrent
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white ring-4 ring-orange-100 scale-105'
                    : 'bg-white border-2 border-stone-300 text-stone-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : item.step}
              </div>

              <div className="mt-2 text-center">
                <span
                  className={`block text-[11px] font-bold uppercase tracking-wider ${
                    isCurrent
                      ? 'text-orange-950 font-extrabold'
                      : isCompleted
                      ? 'text-stone-700'
                      : 'text-stone-400'
                  }`}
                >
                  {item.title}
                </span>
                <span className="hidden sm:block text-[10px] text-stone-400">
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
