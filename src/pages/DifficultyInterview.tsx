import React, { useMemo } from 'react';
import { InterviewData } from '../types/interview';
import { Logo } from '../components/Logo';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  Coins,
  Globe,
  GraduationCap,
  Layers,
  Lock,
  Sparkles,
  TrendingUp,
  UserCheck,
  LucideIcon,
} from 'lucide-react';
import { StreakBadge } from '../components/interview/StreakBadge';

interface DifficultyInterviewProps {
  interviewData?: InterviewData | null;
  onSelectCategory: (category: string) => void;
  onNavigateHome: () => void;
  onLockApp?: () => void;
  streak?: number;
}

interface CategoryInfo {
  name: string;
  count: number;
  icon: LucideIcon;
  description: string;
}

// Maps category name to an appropriate Lucide icon with a clean fallback
function getCategoryIcon(name: string): LucideIcon {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes('personal')) return UserCheck;
  if (normalized.includes('course')) return GraduationCap;
  if (normalized.includes('future') || normalized.includes('plan')) return TrendingUp;
  if (normalized.includes('academic') || normalized.includes('professional')) return Briefcase;
  if (normalized.includes('university')) return Building2;
  if (normalized.includes('uk') || normalized.includes('united kingdom')) return Globe;
  if (normalized.includes('sponsor') || normalized.includes('financ')) return Coins;
  return Layers;
}

// Maps category name to a concise, professional description with a dynamic fallback
function getCategoryDescription(name: string): string {
  const normalized = name.toLowerCase().trim();
  if (normalized === 'personal information') {
    return 'Practise answering questions about your identity, passport details, student ID, and personal background.';
  }
  if (normalized === 'course information') {
    return 'Practise questions regarding your chosen programme, course modules, study dates, and academic curriculum.';
  }
  if (normalized === 'future plan') {
    return 'Practise explaining your long-term career goals, post-study plans, and how this degree supports your career path.';
  }
  if (normalized === 'academic and professional') {
    return 'Practise discussing your prior academic qualifications, work experience, career milestones, and skills.';
  }
  if (normalized === 'university related') {
    return 'Practise questions about your university choice, campus facilities, faculty reputation, and student services.';
  }
  if (normalized === 'uk related') {
    return 'Practise explaining why you chose to study in the United Kingdom over your home country or other study destinations.';
  }
  if (normalized === 'financial sponsor') {
    return 'Practise questions about your sponsor, financial support, income, tuition fees, and living expenses.';
  }
  return `Practise focused interview questions on ${name.toLowerCase()} with real-time AI evaluation and feedback.`;
}

export const DifficultyInterview: React.FC<DifficultyInterviewProps> = ({
  interviewData,
  onSelectCategory,
  onNavigateHome,
  onLockApp,
  streak,
}) => {
  const questions = interviewData?.questions || [];

  // Automatically read all unique difficulty values and calculate accurate question counts
  const categories: CategoryInfo[] = useMemo(() => {
    const seen = new Set<string>();
    const list: CategoryInfo[] = [];

    for (const q of questions) {
      const difficulty = q.difficulty?.trim();
      if (difficulty && !seen.has(difficulty)) {
        seen.add(difficulty);
        const count = questions.filter((item) => item.difficulty?.trim() === difficulty).length;
        list.push({
          name: difficulty,
          count,
          icon: getCategoryIcon(difficulty),
          description: getCategoryDescription(difficulty),
        });
      }
    }

    return list;
  }, [questions]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sticky Header / Navigation */}
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

          <div className="flex items-center gap-2 sm:gap-3">
            {typeof streak === 'number' && (
              <StreakBadge streak={streak} className="hidden sm:inline-flex" />
            )}

            {onLockApp && (
              <button
                type="button"
                onClick={onLockApp}
                title="Lock App"
                aria-label="Lock App"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80 text-sm font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] font-sans"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Lock App</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80 text-sm font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] font-sans"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Page Hero Header */}
        <div className="text-center space-y-3 mb-8 sm:mb-10 max-w-3xl mx-auto">
          {/* Eyebrow Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-sm font-sans">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>DIFFICULTY-BASED INTERVIEW</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-[#0F172A] font-extrabold tracking-[-0.04em] font-heading">
            Choose Your Interview Category
          </h1>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-normal leading-relaxed">
            Focus on one topic at a time. Choose a category, practise real interview questions, and improve with AI-powered feedback.
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="max-w-md mx-auto text-center p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Categories Found</h3>
            <p className="text-sm text-slate-500">
              There are currently no interview categories available in the question bank.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.name}
                  className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 group relative"
                >
                  <div>
                    {/* Top row: Category Icon and Question Count badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#079669] group-hover:bg-[#daf6f1] group-hover:scale-105 transition-all duration-200 shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono">
                        {cat.count} {cat.count === 1 ? 'Question' : 'Questions'}
                      </span>
                    </div>

                    {/* Category Title */}
                    <h2 className="text-lg font-bold text-[#0F172A] tracking-tight font-heading mb-2">
                      {cat.name}
                    </h2>

                    {/* Category Description */}
                    <p className="text-sm text-slate-600 leading-relaxed font-normal mb-6">
                      {cat.description}
                    </p>
                  </div>

                  {/* Start Interview Action */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectCategory(cat.name)}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm hover:shadow-md hover:shadow-emerald-600/20 transition-all duration-150 active:scale-[0.98] cursor-pointer"
                    >
                      <span>Start Interview</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 mt-12 px-4">
        <p className="leading-relaxed">
          <span>Testrolly — AI University Admission, Credibility & CAS Practice</span>
          <span className="text-slate-300 mx-2" aria-hidden="true">|</span>
          <a
            href="https://utshastack.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 hover:text-[#079669] transition-colors duration-200 focus:outline-none focus-visible:underline"
          >
            Utsha Das
          </a>
        </p>
      </footer>
    </div>
  );
};
