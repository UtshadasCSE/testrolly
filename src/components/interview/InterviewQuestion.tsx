import React from 'react';
import { HelpCircle } from 'lucide-react';

interface InterviewQuestionProps {
  question: string;
}

export const InterviewQuestion: React.FC<InterviewQuestionProps> = ({ question }) => {
  return (
    <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
        <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>Interview Prompt</span>
      </div>
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 leading-snug font-heading tracking-tight">
        {question}
      </h2>
    </div>
  );
};
