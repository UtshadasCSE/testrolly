import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, Cpu, FileCheck } from 'lucide-react';

const PROCESSING_STEPS = [
  { text: 'Processing your recording...', icon: Cpu },
  { text: 'Transcribing your answer...', icon: Brain },
  { text: 'Evaluating your response...', icon: Sparkles },
  { text: 'Preparing your feedback...', icon: FileCheck },
];

export const ProcessingState: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % PROCESSING_STEPS.length);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = PROCESSING_STEPS[currentStepIndex].icon;

  return (
    <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-8 animate-in fade-in duration-300">
      {/* Animated Center Orb */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-60" />
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-25 blur-xl animate-pulse" />
        <div className="relative w-24 h-24 rounded-full bg-white border border-emerald-200 shadow-xl flex items-center justify-center text-emerald-600">
          <CurrentIcon className="w-10 h-10 animate-bounce duration-1000" />
        </div>
      </div>

      {/* Message and Subtitle */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-slate-900 font-heading tracking-tight transition-all duration-300">
          {PROCESSING_STEPS[currentStepIndex].text}
        </h3>
        <p className="text-sm text-slate-600 max-w-sm mx-auto">
          AI is analyzing your spoken response for semantic accuracy, structure, and natural delivery.
        </p>
      </div>

      {/* Progress Steps Indicators */}
      <div className="flex items-center justify-center gap-2 pt-4">
        {PROCESSING_STEPS.map((step, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === currentStepIndex
                ? 'w-8 bg-emerald-600'
                : idx < currentStepIndex
                ? 'w-2 bg-emerald-200'
                : 'w-2 bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
