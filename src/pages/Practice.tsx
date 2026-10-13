import React, { useState, useEffect } from 'react';
import interviewDataRaw from '../data/test.json';
import { InterviewData, InterviewQuestion } from '../types/interview';
import { Logo } from '../components/Logo';
import { ArrowLeft, BookOpen, ChevronDown, Play, X } from 'lucide-react';

const testData = interviewDataRaw as InterviewData;

interface PracticeProps {
  onNavigateHome: () => void;
  onPracticeQuestion: (questionId: number) => void;
}

export const Practice: React.FC<PracticeProps> = ({ onNavigateHome, onPracticeQuestion }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [isModalVariationsExpanded, setIsModalVariationsExpanded] = useState<boolean>(false);
  const questions: InterviewQuestion[] = testData.questions || [];

  const handleOpenDetails = (q: InterviewQuestion) => {
    setIsModalVariationsExpanded(false);
    setSelectedQuestion(q);
  };

  const handleCloseDetails = () => {
    setSelectedQuestion(null);
    setIsModalVariationsExpanded(false);
  };

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

  // Reset modal variations whenever selected question changes or closes
  useEffect(() => {
    setIsModalVariationsExpanded(false);
  }, [selectedQuestion?.id]);

  // Keyboard accessibility (Escape key) and scroll-lock when modal is open
  useEffect(() => {
    if (!selectedQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseDetails();
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
            aria-label="Testrolly home"
            className="cursor-pointer hover:opacity-90 transition-opacity flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
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
                <div className="text-[8px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  INTERVIEW QUESTION
                </div>
                <div className="flex items-start justify-between gap-3 mb-5">
                  <h3 className="text-[10px] font-semibold text-slate-900 leading-snug font-heading">
                    {q.question}
                  </h3>
                  <span className={`inline-flex items-center px-[5px] py-[2px] rounded-full text-[6px] font-medium border shrink-0 ${getDifficultyBadge(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 mt-auto pt-3.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenDetails(q)}
                  className="w-full sm:flex-1 h-8 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-[10px] font-semibold transition-all duration-150 cursor-pointer active:scale-[0.98]"
                >
                  <span>View Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPracticeQuestion(q.id)}
                  className="w-full sm:flex-1 h-8 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg bg-[#daf6f1] hover:bg-emerald-700 text-white text-[10px] font-semibold shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-[0.98]"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Practice Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* View Details Modal */}
      {selectedQuestion && (() => {
        const hasModalVariations =
          Array.isArray(selectedQuestion.questionVariations) &&
          selectedQuestion.questionVariations.length > 0;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseDetails();
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-question-title"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[82vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <h2 id="modal-question-title" className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                    Question {selectedQuestion.id}
                  </h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getDifficultyBadge(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  aria-label="Close modal"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body with internal scrolling */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-left">
                {/* Full Question */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    INTERVIEW QUESTION
                  </p>
                  <div className="text-[14px] font-semibold text-slate-900 leading-snug">
                    <span>{selectedQuestion.question}</span>
                    {hasModalVariations && (
                      <button
                        type="button"
                        onClick={() => setIsModalVariationsExpanded((prev) => !prev)}
                        aria-expanded={isModalVariationsExpanded}
                        aria-controls="modal-question-variations"
                        aria-label={isModalVariationsExpanded ? 'Hide question variations' : 'Show question variations'}
                        title={isModalVariationsExpanded ? 'Hide question variations' : 'Show question variations'}
                        className="inline-flex items-center justify-center w-5 h-5 ml-1.5 align-middle rounded text-[#079669] hover:bg-[#effdf8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#079669] cursor-pointer transition-colors"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-[#079669] transition-transform duration-200 motion-reduce:transition-none ${
                            isModalVariationsExpanded ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    )}
                  </div>

                  {/* Expandable Question Variations */}
                  {hasModalVariations && (
                    <div
                      id="modal-question-variations"
                      role="region"
                      aria-label={`Alternative variations for question ${selectedQuestion.id}`}
                      aria-hidden={!isModalVariationsExpanded}
                      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out motion-reduce:transition-none ${
                        isModalVariationsExpanded
                          ? 'grid-rows-[1fr] opacity-100 pt-2'
                          : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="p-2.5 rounded-lg bg-[#effdf8] border border-green-100 text-left">
                          <div className="text-[10px] font-semibold text-[#079669] uppercase tracking-wider mb-2">
                            QUESTION VARIATIONS ({selectedQuestion.questionVariations!.length})
                          </div>
                          <ol className="divide-y divide-green-100 list-none p-0 m-0">
                            {selectedQuestion.questionVariations!.map((variation, vIdx) => (
                              <li
                                key={vIdx}
                                className={`flex items-start gap-2 ${vIdx > 0 ? 'pt-2' : ''} ${
                                  vIdx < selectedQuestion.questionVariations!.length - 1 ? 'pb-2' : ''
                                }`}
                              >
                                <span className="text-[10px] font-bold text-[#079669] shrink-0 pt-[1px] select-none tabular-nums font-mono">
                                  {String(vIdx + 1).padStart(2, '0')}.
                                </span>
                                <span className="text-[12px] text-slate-700 leading-relaxed break-words font-normal">
                                  {variation}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Full Expected Answer with line breaks preserved */}
                <div className="space-y-2 pt-3.5 border-t border-slate-100">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    <span>REFERENCE ANSWER</span>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-slate-700 text-[12px] leading-relaxed whitespace-pre-line font-normal">
                    {selectedQuestion.expectedAnswer}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 sm:px-6 sm:py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.98]"
                >
                  Done Reviewing
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 mt-12">
        <p>Testrolly — AI University Admission, Credibility & CAS Practice</p>
      </footer>
    </div>
  );
};
