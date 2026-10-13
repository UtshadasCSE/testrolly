import React, { useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface StreakCelebrationOverlayProps {
  milestone: number;
  onDismiss: () => void;
}

interface ConfettiParticle {
  id: number;
  x: number;
  width: number;
  height: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  rotation: number;
  isRound: boolean;
}

export const StreakCelebrationOverlay: React.FC<StreakCelebrationOverlayProps> = ({
  milestone,
  onDismiss,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Auto-dismiss after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  // Keyboard accessibility: dismiss on Escape, Enter, or Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  // Generate confetti particles
  const particles: ConfettiParticle[] = useMemo(() => {
    const colors = [
      '#079669', // Brand green
      '#10b981', // Emerald
      '#34d399', // Mint
      '#f59e0b', // Gold / Amber
      '#fbbf24', // Warm Gold
      '#fde047', // Light Gold
      '#14b8a6', // Teal
      '#ffffff', // Pure white
    ];

    return Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      x: (i * 2.38 + (i % 7) * 4) % 96 + 2, // Distributed across width
      width: (i % 3 === 0 ? 10 : i % 3 === 1 ? 8 : 12),
      height: (i % 4 === 0 ? 14 : i % 4 === 1 ? 8 : 10),
      color: colors[i % colors.length],
      delay: (i % 8) * 0.12,
      duration: 2.4 + (i % 5) * 0.3,
      drift: ((i % 5) - 2) * 22,
      rotation: 180 + (i % 6) * 110,
      isRound: i % 4 === 0,
    }));
  }, []);

  // Determine messaging & accents based on milestone
  const { icon, badge, title, subtitle, glowGradient } = useMemo(() => {
    if (milestone === 5) {
      return {
        icon: '🔥',
        badge: '5-QUESTION STREAK',
        title: '🔥 5 GOOD ANSWERS IN A ROW!',
        subtitle: 'Excellent work! Keep your momentum going.',
        glowGradient: 'from-amber-400/30 via-emerald-500/25 to-teal-400/20',
      };
    }
    if (milestone === 10) {
      return {
        icon: '🏆',
        badge: 'DOUBLE STREAK MILESTONE',
        title: '🏆 10 GOOD ANSWERS IN A ROW!',
        subtitle: "Outstanding consistency! You're improving.",
        glowGradient: 'from-yellow-400/40 via-amber-500/30 to-emerald-500/25',
      };
    }
    if (milestone === 15) {
      return {
        icon: '🌟',
        badge: 'ELITE PERFORMANCE',
        title: '🌟 15 GOOD ANSWERS IN A ROW!',
        subtitle: 'An impressive achievement! Keep going.',
        glowGradient: 'from-amber-300/40 via-emerald-400/35 to-teal-500/30',
      };
    }
    return {
      icon: '🎉',
      badge: 'CHAMPION STREAK',
      title: `🎉 ${milestone} GOOD ANSWERS IN A ROW!`,
      subtitle: 'Your consistency is paying off!',
      glowGradient: 'from-emerald-400/40 via-amber-400/35 to-teal-400/30',
    };
  }, [milestone]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200 font-sans"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      aria-describedby="celebration-desc"
    >
      {/* Falling Confetti Layer (Respects prefers-reduced-motion) */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className={`absolute shadow-xs ${p.isRound ? 'rounded-full' : 'rounded-xs'}`}
              style={{
                left: `${p.x}%`,
                width: p.width,
                height: p.height,
                backgroundColor: p.color,
              }}
              initial={{ y: -30, rotate: 0, opacity: 1 }}
              animate={{
                y: '105vh',
                x: p.drift,
                rotate: p.rotation,
                opacity: [1, 1, 0.85, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Main Celebration Card */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.85, opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0, y: -20 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="relative w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-emerald-500/25 shadow-[0_20px_60px_rgba(7,150,105,0.22)] ring-1 ring-amber-400/40 text-center overflow-hidden z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glow */}
        <div
          className={`absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-72 bg-gradient-to-b ${glowGradient} rounded-full blur-3xl pointer-events-none -z-10`}
          aria-hidden="true"
        />

        {/* Manual Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close celebration"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Glowing Icon Badge */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#079669] via-emerald-500 to-amber-400 p-[2.5px] shadow-[0_0_35px_rgba(7,150,105,0.35)]">
            <div className="w-full h-full rounded-[13.5px] bg-white flex items-center justify-center text-4xl select-none">
              {icon}
            </div>
          </div>
          {/* Subtle radiating pulse circle */}
          <div
            className="absolute -inset-2 rounded-3xl bg-amber-400/20 blur-md pointer-events-none -z-10 animate-pulse"
            aria-hidden="true"
          />
        </div>

        {/* Milestone Pill */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{badge}</span>
          </span>
        </div>

        {/* Heading */}
        <h2
          id="celebration-title"
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mb-2 leading-tight"
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p
          id="celebration-desc"
          className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm mx-auto mb-6 font-normal"
        >
          {subtitle}
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-5 rounded-xl bg-[#079669] hover:bg-[#067a55] text-white text-sm font-semibold shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <span>Keep Going</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Auto-dismiss progress countdown bar */}
        <div className="w-full h-1 bg-emerald-100/70 rounded-full overflow-hidden mt-4">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 3.5, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-[#079669] to-amber-500"
          />
        </div>
      </motion.div>
    </div>
  );
};
