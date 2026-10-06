import { CompletedQuestion, OverallResultSummary, ScoreBreakdown, ScoreStatus } from '../types/interview';

export function getScoreStatus(score: number): ScoreStatus {
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Needs Practice';
}

export function getScoreColors(score: number) {
  if (score >= 70) {
    return {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      bar: 'bg-emerald-600',
      badge: 'bg-emerald-100/80 text-emerald-800 border-emerald-300',
      glow: 'shadow-[0_4px_16px_rgba(16,185,129,0.12)]',
    };
  }
  if (score >= 50) {
    return {
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      bar: 'bg-amber-500',
      badge: 'bg-amber-100/80 text-amber-800 border-amber-300',
      glow: 'shadow-[0_4px_16px_rgba(245,158,11,0.12)]',
    };
  }
  return {
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    bar: 'bg-rose-500',
    badge: 'bg-rose-100/80 text-rose-800 border-rose-300',
    glow: 'shadow-[0_4px_16px_rgba(244,63,94,0.12)]',
  };
}

export function getMemorizationColors(risk: number) {
  if (risk < 40) {
    return {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      level: 'Low',
    };
  }
  if (risk < 65) {
    return {
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      level: 'Moderate',
    };
  }
  return {
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    level: 'High',
  };
}

export function getDifficultyBadgeColor(difficulty: string) {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Intermediate':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Advanced':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}

export function computeOverallSummary(completedQuestions: CompletedQuestion[]): OverallResultSummary {
  if (completedQuestions.length === 0) {
    return {
      averageScore: 0,
      status: 'Needs Practice',
      categoryAverages: {
        accuracy: 0,
        completeness: 0,
        relevance: 0,
        naturalness: 0,
        fluency: 0,
        grammar: 0,
        clarity: 0,
      },
      totalDuration: 0,
      totalFillerWords: 0,
      commonStrengths: [],
      commonImprovements: [],
    };
  }

  const count = completedQuestions.length;
  const totalScore = completedQuestions.reduce((acc, q) => acc + q.feedback.overallScore, 0);
  const averageScore = Math.round(totalScore / count);

  const categoryTotals: ScoreBreakdown = {
    accuracy: 0,
    completeness: 0,
    relevance: 0,
    naturalness: 0,
    fluency: 0,
    grammar: 0,
    clarity: 0,
  };

  let totalDuration = 0;
  let totalFillerWords = 0;
  const strengthsMap: Record<string, number> = {};
  const improvementsMap: Record<string, number> = {};

  for (const q of completedQuestions) {
    const s = q.feedback.scores;
    categoryTotals.accuracy += s.accuracy;
    categoryTotals.completeness += s.completeness;
    categoryTotals.relevance += s.relevance;
    categoryTotals.naturalness += s.naturalness;
    categoryTotals.fluency += s.fluency;
    categoryTotals.grammar += s.grammar;
    categoryTotals.clarity += s.clarity;

    totalDuration += q.durationSeconds;
    totalFillerWords += q.feedback.fillerWords.count;

    q.feedback.strengths.forEach((str) => {
      strengthsMap[str] = (strengthsMap[str] || 0) + 1;
    });
    q.feedback.improvements.forEach((imp) => {
      improvementsMap[imp] = (improvementsMap[imp] || 0) + 1;
    });
  }

  const categoryAverages: ScoreBreakdown = {
    accuracy: Math.round(categoryTotals.accuracy / count),
    completeness: Math.round(categoryTotals.completeness / count),
    relevance: Math.round(categoryTotals.relevance / count),
    naturalness: Math.round(categoryTotals.naturalness / count),
    fluency: Math.round(categoryTotals.fluency / count),
    grammar: Math.round(categoryTotals.grammar / count),
    clarity: Math.round(categoryTotals.clarity / count),
  };

  const commonStrengths = Object.keys(strengthsMap).slice(0, 4);
  const commonImprovements = Object.keys(improvementsMap).slice(0, 4);

  return {
    averageScore,
    status: getScoreStatus(averageScore),
    categoryAverages,
    totalDuration,
    totalFillerWords,
    commonStrengths,
    commonImprovements,
  };
}
