import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    { label: 'Boas-vindas', number: 0 },
    { label: 'Família', number: 1 },
    { label: 'Contas', number: 2 },
    { label: 'Orçamento', number: 3 },
    { label: 'Preferências', number: 4 }
  ];

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="overflow-hidden h-2 bg-muted rounded-full">
          <div
            className="h-full bg-gradient-nexus transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="absolute -top-1 right-0 text-xs text-muted-foreground font-medium">
          {currentStep + 1}/{totalSteps}
        </div>
      </div>

      {/* Steps */}
      <div className="hidden sm:flex justify-between items-start mb-8">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;
          
          return (
            <div key={step.number} className="flex flex-col items-center flex-1 relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-1/2 top-5 w-full h-0.5 -z-10 transition-colors ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
              
              {/* Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-white'
                    : isCurrent
                    ? 'bg-gradient-nexus text-white ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check size={20} />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Label */}
              <span
                className={`mt-2 text-xs font-medium text-center transition-colors ${
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: Current step only */}
      <div className="sm:hidden text-center mb-6">
        <p className="text-sm font-medium text-muted-foreground">
          Passo {currentStep + 1}: <span className="text-primary">{steps[currentStep].label}</span>
        </p>
      </div>
    </div>
  );
};

export default StepIndicator;
