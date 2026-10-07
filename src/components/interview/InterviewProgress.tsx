import React from 'react';
import { getDifficultyBadgeColor } from '../../utils/interview';
import { DifficultyLevel } from '../../types/interview';

interface InterviewProgressProps {
  currentIndex: number;
  totalQuestions: number;
  difficulty: DifficultyLevel;
  isPracticeMode?: boolean;
  questionId?: number;
}

export const InterviewProgress: React.FC<InterviewProgressProps> = ({
  currentIndex,
  totalQuestions,
  difficulty,
  isPracticeMode = false,
  questionId,
}) => {
  const currentNumber = questionId ?? (currentIndex + 1);

  if (isPracticeMode) {
    return (
      <div className="w-full space-y-2.5">
        <div className="flex items-center justify-between text-xs md:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-900 tracking-tight font-heading">
              Practice Mode • Question {currentNumber}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getDifficultyBadgeColor(
                difficulty
              )}`}
            >
              {difficulty}
            </span>
          </div>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            Single Question Practice
          </span>
        </div>

        {/* Visual Progress Accent Bar */}
        <div className="w-full h-1.5 bg-emerald-100/60 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-full" />
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((currentNumber / totalQuestions) * 100));

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between text-xs md:text-sm">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-slate-900 tracking-tight font-heading">
            Question {currentNumber} of {totalQuestions}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getDifficultyBadgeColor(
              difficulty
            )}`}
          >
            {difficulty}
          </span>
        </div>
        <span className="text-slate-500 font-mono text-xs font-semibold">{progressPercent}% Completed</span>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

