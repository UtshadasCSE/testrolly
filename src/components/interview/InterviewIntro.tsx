import React from 'react';
import { HeroSection } from '../home/HeroSection';

interface InterviewIntroProps {
  onStart: () => void;
  onPracticeMore?: () => void;
  questionCount?: number;
}

export const InterviewIntro: React.FC<InterviewIntroProps> = ({ onStart, onPracticeMore }) => {
  return <HeroSection onStart={onStart} onPracticeMore={onPracticeMore} />;
};
