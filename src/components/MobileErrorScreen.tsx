import React from 'react';
import { Laptop } from 'lucide-react';

export const MobileErrorScreen: React.FC = () => {
  return (
    <main
      id="mobile-error-screen"
      data-testid="mobile-error-screen"
      role="alert"
      aria-labelledby="mobile-error-heading"
      aria-describedby="mobile-error-description"
      className="fixed inset-0 z-[9999] min-h-screen w-full bg-white flex flex-col items-center justify-center p-6 text-center select-none"
    >
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Desktop / Laptop Icon */}
        <div
          data-testid="desktop-icon-container"
          className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50/80 border border-emerald-100/60 mb-6 shadow-sm"
        >
          <Laptop
            data-testid="desktop-icon"
            className="w-7 h-7 text-[#079669]"
            style={{ color: '#079669' }}
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        {/* Error Heading */}
        <h1
          id="mobile-error-heading"
          className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3 font-heading"
        >
          This website cannot be accessed on mobile devices.
        </h1>

        {/* Error Description */}
        <p
          id="mobile-error-description"
          className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm sm:max-w-md"
        >
          Testrolly is currently available only on desktop devices. Please open this website on a laptop or desktop computer for the best experience.
        </p>
      </div>
    </main>
  );
};

export default MobileErrorScreen;
