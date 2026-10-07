import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Logo } from '../Logo';
import { InterviewPhase } from '../../types/interview';

interface NavbarProps {
  phase: InterviewPhase;
  isPracticeMode?: boolean;
  onGetStarted: () => void;
  onLogoClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ phase, isPracticeMode = false, onGetStarted, onLogoClick }) => {
  return (
    <header className="sticky top-3 sm:top-4 z-50 w-[calc(100%-24px)] sm:w-[calc(100%-48px)] max-w-6xl mx-auto">
      <div className="h-16 px-4 sm:px-6 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between transition-all duration-200">
        {/* Left Side: Testrolly Brand */}
        <div
          onClick={onLogoClick}
          className={onLogoClick ? 'cursor-pointer' : ''}
        >
          <Logo size="md" />
        </div>

        {/* Right Side: Only Get Started Button or Active Mode */}
        <div>
          {isPracticeMode ? (
            <div className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-sans">
              Single Question Practice
            </div>
          ) : phase === 'intro' ? (
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer font-sans"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : phase === 'completed' ? (
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-all duration-150 cursor-pointer font-sans"
            >
              <span>New Practice</span>
            </button>
          ) : (
            <div className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-sans">
              Live Practice Mode
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
