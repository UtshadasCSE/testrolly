import React from 'react';

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 font-sans ${
        streak > 0
          ? 'bg-amber-50 text-amber-900 border border-amber-200/90 shadow-[0_2px_8px_rgba(245,158,11,0.12)]'
          : 'bg-slate-100 text-slate-600 border border-slate-200'
      } ${className}`}
      title={`${streak} consecutive Good or better answers`}
      aria-label={`Current streak: ${streak} Good answers`}
    >
      <span className={streak > 0 ? 'text-amber-500 animate-pulse text-sm select-none' : 'text-slate-400 text-sm select-none'}>
        🔥
      </span>
      <span className="font-semibold text-slate-800">
        {streak} Good Streak
      </span>
    </div>
  );
};
