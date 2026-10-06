import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  Quote,
  ShieldCheck,
  MessageSquareQuote,
} from 'lucide-react';
import { InterviewFeedback } from '../../types/interview';
import { getMemorizationColors, getScoreColors } from '../../utils/interview';

interface QuestionFeedbackProps {
  feedback: InterviewFeedback;
  isLastQuestion: boolean;
  onNextQuestion: () => void;
  onFinishInterview: () => void;
  onRetryQuestion: () => void;
}

export const QuestionFeedback: React.FC<QuestionFeedbackProps> = ({
  feedback,
  isLastQuestion,
  onNextQuestion,
  onFinishInterview,
  onRetryQuestion,
}) => {
  const [showRetryConfirm, setShowRetryConfirm] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(true);

  const scoreTheme = getScoreColors(feedback.overallScore);
  const memTheme = getMemorizationColors(feedback.memorization.risk);

  const categoryEntries = [
    { label: 'Accuracy', score: feedback.scores.accuracy, desc: 'Factual & semantic correctness' },
    { label: 'Completeness', score: feedback.scores.completeness, desc: 'Key ideas addressed' },
    { label: 'Relevance', score: feedback.scores.relevance, desc: 'Direct answer to question' },
    { label: 'Naturalness', score: feedback.scores.naturalness, desc: 'Conversational tone vs scripted' },
    { label: 'Fluency', score: feedback.scores.fluency, desc: 'Smooth delivery from spoken evidence' },
    { label: 'Grammar', score: feedback.scores.grammar, desc: 'Sentence structure & correctness' },
    { label: 'Clarity', score: feedback.scores.clarity, desc: 'Logical flow & articulation' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Header & Overall Score Card */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Evaluation Complete</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-heading">
              Question Feedback
            </h2>
            <p className="text-sm text-slate-600 max-w-lg">
              Detailed assessment of your spoken response based on university credibility standards.
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className={`p-6 rounded-2xl ${scoreTheme.bg} border ${scoreTheme.border} ${scoreTheme.glow} text-center min-w-[180px] shrink-0`}>
            <p className="text-xs uppercase tracking-widest text-slate-600 font-bold mb-1">
              Overall Score
            </p>
            <div className={`text-5xl font-black font-heading ${scoreTheme.text} tracking-tight`}>
              {feedback.overallScore}
              <span className="text-xl font-normal text-slate-500">/100</span>
            </div>
            <div className="mt-2">
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold ${scoreTheme.badge}`}>
                {feedback.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Spoken Transcript Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
            <span>Spoken Transcript (What Gemini Heard)</span>
          </div>
          <button
            onClick={() => setShowFullTranscript(!showFullTranscript)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            {showFullTranscript ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {showFullTranscript && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm italic font-normal leading-relaxed">
            "{feedback.transcript}"
          </div>
        )}
      </div>

      {/* Category Scores Breakdown */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 font-heading">
          Detailed Performance Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {categoryEntries.map((cat) => {
            const catColors = getScoreColors(cat.score);
            return (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-slate-800">{cat.label}</span>
                    <span className="text-[11px] text-slate-500 block">{cat.desc}</span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${catColors.text}`}>
                    {cat.score}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${catColors.bar} transition-all duration-500 rounded-full`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Diagnostic Metrics (Answer Length, Filler Words, Memorization Risk) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Answer Length */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Answer Length</span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-heading">
            {feedback.answerLength.status}
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <p>Duration: <span className="text-slate-900 font-semibold font-mono">{feedback.answerLength.durationSeconds}s</span></p>
            <p>Word Count: <span className="text-slate-900 font-semibold font-mono">~{feedback.answerLength.wordCount} words</span></p>
          </div>
        </div>

        {/* Filler Words */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Quote className="w-4 h-4 text-amber-600" />
            <span>Filler Words</span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-heading flex items-center gap-2">
            <span>{feedback.fillerWords.count}</span>
            <span className="text-xs font-normal text-slate-500">detected</span>
          </div>
          <div className="text-xs text-slate-600">
            {feedback.fillerWords.words.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {feedback.fillerWords.words.map((f, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold"
                  >
                    "{f.word}" ({f.count}x)
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-emerald-700 text-xs font-medium">No excessive filler words detected.</p>
            )}
          </div>
        </div>

        {/* Memorization Risk */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Memorization Risk</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-slate-900 font-heading">
              {feedback.memorization.risk}
              <span className="text-xs font-normal text-slate-500">/100</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${memTheme.badge}`}>
              {feedback.memorization.level} Risk
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {feedback.memorization.explanation}
          </p>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What You Did Well */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 uppercase tracking-wider font-heading">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>What You Did Well</span>
          </div>
          <ul className="space-y-2.5">
            {feedback.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What You Can Improve */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-800 uppercase tracking-wider font-heading">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>What You Can Improve</span>
          </div>
          <ul className="space-y-2.5">
            {feedback.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing Points (if any) */}
      {feedback.missingPoints && feedback.missingPoints.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Missing Important Points</span>
          </div>
          <ul className="space-y-2">
            {feedback.missingPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comprehensive Overall AI Feedback */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>AI Feedback Summary</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {feedback.overallFeedback}
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setShowRetryConfirm(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Question</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isLastQuestion ? (
            <>
              <button
                type="button"
                onClick={onFinishInterview}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                Finish Early
              </button>
              <button
                type="button"
                onClick={onNextQuestion}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onFinishInterview}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>Finish Interview</span>
            </button>
          )}
        </div>
      </div>

      {/* Retry Confirmation Modal */}
      {showRetryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 font-heading">Retry Question?</h4>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Retrying will restart the 10-second preparation countdown for this question and allow you to record a new answer.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRetryConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRetryConfirm(false);
                  onRetryQuestion();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Yes, Retry Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
