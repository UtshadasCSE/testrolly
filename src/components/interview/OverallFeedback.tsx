import React, { useState } from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  MessageSquareQuote,
} from 'lucide-react';
import { CompletedQuestion, OverallResultSummary } from '../../types/interview';
import {
  computeOverallSummary,
  getDifficultyBadgeColor,
  getMemorizationColors,
  getScoreColors,
} from '../../utils/interview';
import { formatDuration } from '../../utils/recording';

interface OverallFeedbackProps {
  completedQuestions: CompletedQuestion[];
  onRestart: () => void;
}

export const OverallFeedback: React.FC<OverallFeedbackProps> = ({
  completedQuestions,
  onRestart,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const summary: OverallResultSummary = computeOverallSummary(completedQuestions);
  const scoreColors = getScoreColors(summary.averageScore);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const categoryEntries = [
    { label: 'Accuracy', score: summary.categoryAverages.accuracy },
    { label: 'Completeness', score: summary.categoryAverages.completeness },
    { label: 'Relevance', score: summary.categoryAverages.relevance },
    { label: 'Naturalness', score: summary.categoryAverages.naturalness },
    { label: 'Fluency', score: summary.categoryAverages.fluency },
    { label: 'Grammar', score: summary.categoryAverages.grammar },
    { label: 'Clarity', score: summary.categoryAverages.clarity },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 md:py-10 pb-20 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-8 md:p-10 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>Interview Complete</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
              Overall Interview Results
            </h2>
            <p className="text-sm text-slate-600 max-w-lg leading-relaxed">
              You completed all {completedQuestions.length} interview questions. Here is your comprehensive evaluation across credibility and admission criteria.
            </p>
          </div>

          {/* Large Overall Score Card */}
          <div className={`p-6 rounded-2xl ${scoreColors.bg} border ${scoreColors.border} ${scoreColors.glow} text-center min-w-[200px] shrink-0`}>
            <p className="text-xs uppercase tracking-widest text-slate-600 font-bold mb-1">
              Interview Score
            </p>
            <div className={`text-6xl font-black font-heading ${scoreColors.text} tracking-tight`}>
              {summary.averageScore}
              <span className="text-2xl font-normal text-slate-500">/100</span>
            </div>
            <div className="mt-2">
              <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold ${scoreColors.badge}`}>
                {summary.status}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-semibold">Completed Questions</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{completedQuestions.length}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-semibold">Total Spoken Time</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{formatDuration(summary.totalDuration)}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 block font-semibold">Total Fillers Used</span>
            <span className="text-lg font-bold text-amber-700 font-mono">{summary.totalFillerWords}</span>
          </div>
        </div>
      </div>

      {/* Category Averages */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <span>Average Performance by Evaluation Criteria</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {categoryEntries.map((cat) => {
            const catColors = getScoreColors(cat.score);
            return (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{cat.label}</span>
                  <span className={`font-mono font-bold ${catColors.text}`}>{cat.score}/100</span>
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

      {/* Common Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 uppercase tracking-wider font-heading">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Overall Strengths</span>
          </div>
          <ul className="space-y-2.5">
            {summary.commonStrengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-800 uppercase tracking-wider font-heading">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Areas to Improve</span>
          </div>
          <ul className="space-y-2.5">
            {summary.commonImprovements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="text-amber-600 font-bold shrink-0">•</span>
                <span className="leading-relaxed">{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Detailed Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 font-heading">
          Question-by-Question Breakdown
        </h3>

        <div className="space-y-3">
          {completedQuestions.map((q, idx) => {
            const isExpanded = expandedIndex === idx;
            const qColors = getScoreColors(q.feedback.overallScore);
            const memRisk = getMemorizationColors(q.feedback.memorization.risk);

            return (
              <div
                key={q.questionId}
                className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm transition-all duration-200"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(idx)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1 pr-4">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getDifficultyBadgeColor(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 truncate">{q.question}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${qColors.badge}`}>
                      {q.feedback.overallScore}/100 — {q.feedback.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-6 animate-in fade-in duration-150">
                    {/* Transcript */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Candidate Spoken Transcript</span>
                      </span>
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm italic text-slate-800 leading-relaxed shadow-sm">
                        "{q.feedback.transcript}"
                      </div>
                    </div>

                    {/* Scores grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="text-[11px] text-slate-500 font-semibold block">Accuracy</span>
                        <span className="text-base font-bold text-slate-900">{q.feedback.scores.accuracy}/100</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="text-[11px] text-slate-500 font-semibold block">Completeness</span>
                        <span className="text-base font-bold text-slate-900">{q.feedback.scores.completeness}/100</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="text-[11px] text-slate-500 font-semibold block">Relevance</span>
                        <span className="text-base font-bold text-slate-900">{q.feedback.scores.relevance}/100</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="text-[11px] text-slate-500 font-semibold block">Clarity</span>
                        <span className="text-base font-bold text-slate-900">{q.feedback.scores.clarity}/100</span>
                      </div>
                    </div>

                    {/* Diagnostics row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 block mb-1 font-semibold">Answer Length</span>
                        <span className="font-semibold text-slate-900">{q.feedback.answerLength.status} ({q.feedback.answerLength.durationSeconds}s)</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 block mb-1 font-semibold">Filler Words</span>
                        <span className="font-semibold text-slate-900">{q.feedback.fillerWords.count} detected</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 block mb-1 font-semibold">Memorization Risk</span>
                        <span className={`font-semibold ${memRisk.text}`}>{q.feedback.memorization.risk}/100 ({q.feedback.memorization.level})</span>
                      </div>
                    </div>

                    {/* Detailed Feedback & Improvements */}
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 leading-relaxed shadow-sm">
                        <span className="font-bold text-slate-900 block mb-1">Evaluator Feedback:</span>
                        {q.feedback.overallFeedback}
                      </div>

                      {q.feedback.improvements.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Key Improvements:</span>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {q.feedback.improvements.map((imp, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Restart CTA */}
      <div className="pt-6 flex justify-center">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Practice Another Session</span>
        </button>
      </div>
    </div>
  );
};
