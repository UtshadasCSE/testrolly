import React from 'react';
import { Mic, Sparkles, Video } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = false }) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Distinctive Testrolly Icon */}
      <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-sm text-emerald-600">
        <Video className={`${iconSize}`} />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
      </div>

      <div>
        <div className={`font-bold tracking-tight text-slate-900 font-heading ${textSize} flex items-center`}>
          <span>Testrolly</span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">AI Credibility & CAS Practice</p>
        )}
      </div>
    </div>
  );
};
