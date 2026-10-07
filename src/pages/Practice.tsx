import React, { useState, useEffect } from 'react';
import interviewDataRaw from '../data/test.json';
import { InterviewData, InterviewQuestion } from '../types/interview';
import { Logo } from '../components/Logo';
import { ArrowLeft, BookOpen, Play, X } from 'lucide-react';

const testData = interviewDataRaw as InterviewData;

interface PracticeProps {
  onNavigateHome: () => void;
  onPracticeQuestion: (questionId: number) => void;
}

export const Practice: React.FC<PracticeProps> = ({ onNavigateHome, onPracticeQuestion }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const questions: InterviewQuestion[] = testData.questions || [];

  // Helper for semantic difficulty styling
  const getDifficultyBadge = (difficulty: string) => {
    const normalized = difficulty?.toLowerCase();
    if (normalized === 'beginner') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (normalized === 'intermediate') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (normalized === 'advanced') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Keyboard accessibility (Escape key) and scroll-lock when modal is open
  useEffect(() => {
    if (!selectedQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedQuestion(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedQuestion]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header / Navigation */}
      <header className="sticky top-3 sm:top-4 z-40 w-[calc(100%-24px)] sm:w-[calc(100%-48px)] max-w-6xl mx-auto">
        <div className="h-16 px-4 sm:px-6 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between transition-all duration-200">
          <button
            type="button"
            onClick={onNavigateHome}
            className="cursor-pointer hover:opacity-90 transition-opacity flex items-center text-left"
          >
            <Logo size="md" />
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80 text-sm font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] font-sans"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Practice Hero Section */}
        <div className="text-center space-y-3 mb-8 sm:mb-10">
          {/* Eyebrow Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-sm font-sans">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>PRACTICE QUESTIONS</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-slate-900 font-semibold tracking-[-0.04em] font-heading">
            Review Before You Practice
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Review all interview questions and reference answers before starting your interview practice.
          </p>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {questions.map((q) => (
            <div
              key={q.id}
              className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
            >
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  INTERVIEW QUESTION
                </div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Question {q.id}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyBadge(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-auto pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedQuestion(q)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer active:scale-[0.98]"
                >
                  <span>View Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPracticeQuestion(q.id)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Practice Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* View Details Modal */}
      {selectedQuestion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedQuestion(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-question-title"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 sm:px-7 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <h2 id="modal-question-title" className="text-xl font-bold text-slate-900 font-heading">
                  Question {selectedQuestion.id}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyBadge(selectedQuestion.difficulty)}`}>
                  {selectedQuestion.difficulty}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with internal scrolling */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-left">
              {/* Full Question */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  INTERVIEW QUESTION
                </p>
                <p className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
                  {selectedQuestion.question}
                </p>
              </div>

              {/* Full Expected Answer with line breaks preserved */}
              <div className="space-y-3 pt-5 border-t border-slate-100">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <span>REFERENCE ANSWER</span>
                </div>
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                  {selectedQuestion.expectedAnswer}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 sm:px-7 sm:py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 mt-12">
        <p>Testrolly — AI University Admission, Credibility & CAS Practice</p>
      </footer>
    </div>
  );
};
