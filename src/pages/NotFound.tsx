import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Logo } from '../components/Logo';
import { Home, BookOpen, Sparkles, Lock } from 'lucide-react';
import { StreakBadge } from '../components/interview/StreakBadge';

interface NotFoundProps {
  onNavigateHome: () => void;
  onNavigatePractice: () => void;
  onLockApp?: () => void;
  streak?: number;
}

export const NotFound: React.FC<NotFoundProps> = ({
  onNavigateHome,
  onNavigatePractice,
  onLockApp,
  streak,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Set document title and meta description dynamically
  useEffect(() => {
    const previousTitle = document.title;
    document.title = '404 — Page Not Found | Testrolly';

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    let previousDesc = '';
    let createdMeta = false;

    if (metaDesc) {
      previousDesc = metaDesc.getAttribute('content') || '';
      metaDesc.setAttribute(
        'content',
        "The page you're looking for doesn't exist or may have been moved. Let's get you back on track."
      );
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content =
        "The page you're looking for doesn't exist or may have been moved. Let's get you back on track.";
      document.head.appendChild(metaDesc);
      createdMeta = true;
    }

    return () => {
      document.title = previousTitle;
      if (createdMeta && metaDesc && metaDesc.parentNode) {
        metaDesc.parentNode.removeChild(metaDesc);
      } else if (metaDesc && previousDesc) {
        metaDesc.setAttribute('content', previousDesc);
      }
    };
  }, []);

  const getTransition = (delay: number) => ({
    duration: 0.45,
    delay,
    ease: 'easeOut' as const,
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Consistent Sticky Floating Header */}
      <header className="sticky top-3 sm:top-4 z-40 w-[calc(100%-24px)] sm:w-[calc(100%-48px)] max-w-6xl mx-auto">
        <div className="h-16 px-4 sm:px-6 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between transition-all duration-200">
          <button
            type="button"
            onClick={onNavigateHome}
            aria-label="Testrolly home"
            className="cursor-pointer hover:opacity-90 transition-opacity flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
          >
            <Logo size="md" />
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {typeof streak === 'number' && streak > 0 && (
              <StreakBadge streak={streak} className="hidden sm:inline-flex" />
            )}

            {onLockApp && (
              <button
                type="button"
                onClick={onLockApp}
                title="Lock App"
                aria-label="Lock App"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80 text-sm font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Lock App</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80 text-sm font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main 404 Visual & Content: Vertically Centered */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center text-center">
        {/* Eyebrow Pill Badge */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getTransition(0.02)}
          className="mb-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-sm font-sans">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ERROR 404</span>
          </div>
        </motion.div>

        {/* Large Bold 404 Visual with Soft Circular Decorative Glow */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition(0.08)}
          className="relative flex items-center justify-center my-2 sm:my-3 select-none"
        >
          {/* Subtle light-green circular glow background */}
          <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-emerald-100/70 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Large Bold 404: Dark Navy 4s and Primary Green 0 */}
          <div
            className="text-8xl sm:text-9xl md:text-[144px] font-black font-heading tracking-tight leading-none flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-[#0F172A]">4</span>
            <span className="text-[#079669] mx-1 sm:mx-2">0</span>
            <span className="text-[#0F172A]">4</span>
          </div>
        </motion.div>

        {/* Main H1 Heading */}
        <motion.h1
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getTransition(0.14)}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-[-0.04em] font-heading leading-tight mt-2 mb-3"
        >
          Oops! Page Not Found.
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getTransition(0.2)}
          className="text-base sm:text-lg text-slate-600 max-w-md mx-auto font-normal leading-relaxed mb-8"
        >
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s get you back on track.
        </motion.p>

        {/* Action Buttons: Primary 'Back to Home' & Secondary 'Practice Questions' */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getTransition(0.26)}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          {/* Primary Button: Back to Home */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all duration-150 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          {/* Secondary Button: Practice Questions */}
          <button
            type="button"
            onClick={onNavigatePractice}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 font-medium text-base shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Practice Questions</span>
          </button>
        </motion.div>
      </main>

      {/* Consistent Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 mt-auto px-4">
        <p className="leading-relaxed">
          <span>Testrolly — AI University Admission, Credibility & CAS Practice</span>
          <span className="text-slate-300 mx-2" aria-hidden="true">|</span>
          <a
            href="https://utshastack.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 hover:text-[#079669] transition-colors duration-200 focus:outline-none focus-visible:underline"
          >
            Utsha Das
          </a>
        </p>
      </footer>
    </div>
  );
};
