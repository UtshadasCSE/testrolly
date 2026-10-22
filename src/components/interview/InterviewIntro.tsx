import React from 'react';
import { HeroSection } from '../home/HeroSection';

interface InterviewIntroProps {
  onStart?: () => void;
  onPracticeMore?: () => void;
  onDifficultyInterview?: () => void;
  questionCount?: number;
}

export const InterviewIntro: React.FC<InterviewIntroProps> = ({
  onStart,
  onPracticeMore,
  onDifficultyInterview,
}) => {
  return (
    <HeroSection
      onStart={onStart}
      onPracticeMore={onPracticeMore}
      onDifficultyInterview={onDifficultyInterview}
    />
  );
};
