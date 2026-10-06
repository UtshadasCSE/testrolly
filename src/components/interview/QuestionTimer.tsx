import React, { useEffect, useState } from 'react';
import { Timer, Zap } from 'lucide-react';

interface QuestionTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  onSkip?: () => void;
}

export const QuestionTimer: React.FC<QuestionTimerProps> = ({
  initialSeconds = 10,
  onComplete,
  onSkip,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onComplete]);

  // Circle progress calculation
  const total = initialSeconds > 0 ? initialSeconds : 10;
  const progressPercent = ((total - secondsLeft) / total) * 100;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-center animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
        <Timer className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span>Preparation Time</span>
      </div>

      <div className="flex items-center justify-center gap-4">
        {/* Circular Countdown Display */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 76 76">
            <circle
              cx="38"
              cy="38"
              r={radius}
              stroke="currentColor"
              strokeWidth="5"
              className="text-slate-100"
              fill="transparent"
            />
            <circle
              cx="38"
              cy="38"
              r={radius}
              stroke="currentColor"
              strokeWidth="5"
              className="text-emerald-500 transition-all duration-1000 ease-linear"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
              {secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
            </span>
          </div>
        </div>

        <div className="text-left space-y-0.5">
          <p className="text-sm font-bold text-slate-900 font-heading">Get ready to answer</p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-[260px]">
            Recording will start <span className="text-emerald-600 font-semibold">automatically</span> when the countdown reaches 0.
          </p>
        </div>
      </div>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 transition-colors pt-1 cursor-pointer font-medium"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>I'm ready now (Skip countdown)</span>
        </button>
      )}
    </div>
  );
};
