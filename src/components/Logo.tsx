import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  showText = true,
}) => {
  const imageSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-11 w-11' : 'h-10 w-10';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Testrolly Logo Icon */}
      <img
        src="/brand/testrolly-logo.png"
        alt="Testrolly"
        className={`${imageSize} object-contain shrink-0`}
        loading="eager"
      />

      {showText && (
        <div className="flex flex-col justify-center">
          <div className={`font-bold tracking-tight text-slate-900 font-heading ${textSize} flex items-center leading-none`}>
            <span>Testrolly</span>
          </div>
          {showSubtitle && (
            <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">AI Credibility & CAS Practice</p>
          )}
        </div>
      )}
    </div>
  );
};

