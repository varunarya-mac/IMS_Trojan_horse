/**
 * ProgressSteps Component
 * Animated progress bar with step indicators
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { IoCheckmark } from 'react-icons/io5';

export type ImportStep = 'idle' | 'parsing' | 'validating' | 'importing' | 'complete' | 'error';

interface ProgressStepsProps {
  currentStep: ImportStep;
}

const steps = [
  { key: 'parsing', label: 'Parsing JSON' },
  { key: 'validating', label: 'Validating Structure' },
  { key: 'importing', label: 'Importing Data' },
  { key: 'complete', label: 'Complete' },
];

function getStepIndex(step: ImportStep): number {
  switch (step) {
    case 'idle':
      return -1;
    case 'parsing':
      return 0;
    case 'validating':
      return 1;
    case 'importing':
      return 2;
    case 'complete':
      return 4; // Past all steps
    case 'error':
      return -2;
    default:
      return -1;
  }
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const stepIndex = getStepIndex(currentStep);
  const progressPercent = currentStep === 'complete' ? 100 : Math.max(0, ((stepIndex + 0.5) / steps.length) * 100);

  // Animate progress bar
  useEffect(() => {
    if (progressRef.current && currentStep !== 'idle' && currentStep !== 'error') {
      gsap.to(progressRef.current, {
        width: `${progressPercent}%`,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [progressPercent, currentStep]);

  // Animate step labels
  useEffect(() => {
    if (stepIndex >= 0 && stepRefs.current[stepIndex]) {
      gsap.fromTo(
        stepRefs.current[stepIndex],
        { opacity: 0.5, y: 5 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [stepIndex]);

  if (currentStep === 'idle') {
    return null;
  }

  return (
    <div className="w-full py-6">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div
          ref={progressRef}
          className={`absolute top-0 left-0 h-full rounded-full transition-colors ${
            currentStep === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-green-500'
          }`}
          style={{ width: '0%' }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isActive = index === stepIndex;
          const isCompleted = index < stepIndex || currentStep === 'complete';
          const isPending = index > stepIndex;

          return (
            <div
              key={step.key}
              ref={(el) => (stepRefs.current[index] = el)}
              className="flex flex-col items-center"
            >
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <IoCheckmark className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium text-center ${
                  isCompleted
                    ? 'text-green-600'
                    : isActive
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current Step Message */}
      {currentStep !== 'complete' && currentStep !== 'error' && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">
            {currentStep === 'parsing' && 'Reading and parsing JSON file...'}
            {currentStep === 'validating' && 'Validating data structure...'}
            {currentStep === 'importing' && 'Importing data to database...'}
          </span>
        </div>
      )}
    </div>
  );
}

export default ProgressSteps;
