import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HowItWorksFan } from './HowItWorksFan';

interface HeroSectionProps {
  onStart: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
  const shouldReduceMotion = useReducedMotion();

  const getTransition = (delay: number) => ({
    duration: 0.5,
    delay,
    ease: 'easeOut' as const,
  });

  return (
    <div className="relative w-full overflow-hidden pt-6 md:pt-10 pb-12 px-4 font-sans">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center space-y-6">
        {/* Top Eyebrow Pill Badge */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getTransition(0.02)}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-sm font-sans">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI-POWERED INTERVIEW PRACTICE</span>
          </div>
        </motion.div>

        {/* Main Heading - Clean editorial/SaaS typography */}
        <motion.h1
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getTransition(0.08)}
          className="text-4xl sm:text-5xl md:text-6xl text-slate-900 font-semibold tracking-[-0.04em] leading-[1.05]"
        >
          Practice Smarter.{' '}
          <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 font-semibold">
            Interview Better.
          </span>
        </motion.h1>

        {/* Subtitle / Description */}
        <motion.p
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getTransition(0.16)}
          className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed tracking-normal"
        >
          Practice real interview questions, record your answers, and get AI-powered feedback to improve your confidence before the real interview.
        </motion.p>

        {/* Primary Single CTA Button */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getTransition(0.24)}
          className="pt-2 flex justify-center"
        >
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Fanned How It Works 3-Card Centerpiece directly below Get Started */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition(0.32)}
        className="w-full mt-4 sm:mt-6"
      >
        <HowItWorksFan />
      </motion.div>
    </div>
  );
};
