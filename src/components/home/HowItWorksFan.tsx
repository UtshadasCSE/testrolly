import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Video, Sparkles, TrendingUp } from 'lucide-react';
import { HowItWorksCard, StepCardData } from './HowItWorksCard';

const stepsData: StepCardData[] = [
  {
    number: '01',
    title: 'Practice',
    description: 'Answer interview questions in a realistic camera and microphone environment.',
    icon: Video,
  },
  {
    number: '02',
    title: 'AI Feedback',
    description: 'AI analyzes your answer for accuracy, relevance, clarity, fluency, and naturalness.',
    icon: Sparkles,
    isFeatured: true,
  },
  {
    number: '03',
    title: 'Improve',
    description: 'Review your strengths, mistakes, transcript, and scores before practicing again.',
    icon: TrendingUp,
  },
];

// Desktop card transformations
const desktopCardStyles = [
  {
    rotate: -6,
    x: -30,
    y: 14,
    zIndex: 10,
    scale: 0.96,
  },
  {
    rotate: 0,
    x: 0,
    y: 0,
    zIndex: 20,
    scale: 1,
  },
  {
    rotate: 6,
    x: 30,
    y: 14,
    zIndex: 10,
    scale: 0.96,
  },
];

export const HowItWorksFan: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full max-w-5xl mx-auto pt-4 pb-4">
      {/* Desktop / Tablet: Fanned Overlapping Layout */}
      <div className="hidden sm:flex items-center justify-center -space-x-12 md:-space-x-16 lg:-space-x-20 px-4 py-8">
        {stepsData.map((step, idx) => {
          const config = desktopCardStyles[idx];

          const initial = shouldReduceMotion
            ? { opacity: 0, y: 15 }
            : { opacity: 0, y: 30, rotate: 0, scale: 0.9 };

          const animate = shouldReduceMotion
            ? { opacity: 1, y: 0 }
            : {
                opacity: 1,
                y: config.y,
                x: config.x,
                rotate: config.rotate,
                scale: config.scale,
              };

          return (
            <motion.div
              key={step.number}
              initial={initial}
              animate={animate}
              transition={{
                duration: 0.6,
                delay: 0.2 + idx * 0.12,
                ease: 'easeOut',
              }}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      y: config.y - 10,
                      scale: config.scale * 1.03,
                      zIndex: 30,
                      transition: { duration: 0.2 },
                    }
              }
              style={{ zIndex: config.zIndex }}
              className="transform-gpu origin-bottom will-change-transform"
            >
              <HowItWorksCard data={step} />
            </motion.div>
          );
        })}
      </div>

      {/* Mobile: Clean Vertical Staggered Stack */}
      <div className="flex sm:hidden flex-col items-center gap-4 px-4 py-2">
        {stepsData.map((step, idx) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.15 + idx * 0.1,
              ease: 'easeOut',
            }}
            className="w-full max-w-sm"
          >
            <HowItWorksCard data={step} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
