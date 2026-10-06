import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StepCardData {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isFeatured?: boolean;
}

interface HowItWorksCardProps {
  data: StepCardData;
  className?: string;
}

export const HowItWorksCard: React.FC<HowItWorksCardProps> = ({ data, className = '' }) => {
  const Icon = data.icon;

  return (
    <div
      className={`relative w-full max-w-[320px] sm:max-w-[340px] md:max-w-[360px] p-6 sm:p-7 rounded-2xl transition-all duration-300 select-none font-sans ${
        data.isFeatured
          ? 'bg-white border-emerald-300 shadow-[0_12px_35px_rgba(16,185,129,0.12)] ring-1 ring-emerald-200'
          : 'bg-white/95 border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
      } border backdrop-blur-xl ${className}`}
    >
      {/* Top Header with Step Badge and Icon */}
      <div className="flex items-center justify-between mb-5">
        <span
          className={`font-sans text-xs font-semibold tracking-wider px-2.5 py-1 rounded-md ${
            data.isFeatured
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {data.number}
        </span>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${
            data.isFeatured
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm'
              : 'bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight mb-2 font-sans">
        {data.title}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal font-sans">
        {data.description}
      </p>

      {/* Subtle top border highlight for featured center card */}
      {data.isFeatured && (
        <div className="absolute top-0 right-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent pointer-events-none" />
      )}
    </div>
  );
};
