import React from 'react';
import { HeroSection } from '../home/HeroSection';

interface InterviewIntroProps {
  onStart: () => void;
  questionCount?: number;
}

export const InterviewIntro: React.FC<InterviewIntroProps> = ({ onStart }) => {
  return <HeroSection onStart={onStart} />;
};
