import React, { useState, useEffect, useCallback } from 'react';
import { TestInterview } from './pages/TestInterview';
import { Practice } from './pages/Practice';
import { DifficultyInterview } from './pages/DifficultyInterview';
import { NotFound } from './pages/NotFound';
import { MobileErrorScreen } from './components/MobileErrorScreen';
import { VerificationScreen } from './components/VerificationScreen';
import { Logo } from './components/Logo';
import { Loader2 } from 'lucide-react';
import { InterviewData } from './types/interview';

function checkIsMobile(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 1. Responsive viewport detection with a 768px breakpoint (< 768px is mobile)
  const mediaQuery = window.matchMedia('(max-width: 767px)');
  const isSmallViewport = mediaQuery.matches || window.innerWidth < 768;

  // 2. Mobile device detection (smartphones: Android phones, iPhones, and other smartphones)
  const ua = navigator.userAgent || '';
  const isSmartphone = /Android.*Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  return isSmallViewport || isSmartphone;
}

function isKnownRoute(pathname: string): boolean {
  if (
    pathname === '/' ||
    pathname === '/practice' ||
    pathname === '/difficulty-interview' ||
    pathname === '/test-interview'
  ) {
    return true;
  }
  // Matches /practice/:id where :id is numeric
  if (/^\/practice\/\d+$/.test(pathname)) {
    return true;
  }
  return false;
}

export function App() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return checkIsMobile();
    }
    return false;
  });

  // Mobile detection listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const handleViewportChange = () => {
      setIsMobile(checkIsMobile());
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleViewportChange);
    } else {
      mediaQuery.addListener(handleViewportChange);
    }

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleViewportChange);
      } else {
        mediaQuery.removeListener(handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, []);

  const [currentUrl, setCurrentUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState({}, '', path);
      setCurrentUrl(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Session Authentication & Interview Data State
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);

  // Authenticated Data Loader
  const loadInterviewData = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/interview-data', { credentials: 'same-origin' });
      if (res.status === 401) {
        setSessionStatus('unauthenticated');
        setInterviewData(null);
        return false;
      }
      if (res.ok) {
        const data = await res.json();
        setInterviewData(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Initial Session Check
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await fetch('/api/session', { credentials: 'same-origin' });
        const data = await res.json().catch(() => null);

        if (!isMounted) return;

        if (res.ok && data?.authenticated) {
          setSessionStatus('authenticated');
          const success = await loadInterviewData();
          if (!success && isMounted) {
            setSessionStatus('unauthenticated');
          }
        } else {
          setSessionStatus('unauthenticated');
        }
      } catch {
        if (isMounted) {
          setSessionStatus('unauthenticated');
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [loadInterviewData]);

  // Handle successful verification
  const handleVerificationSuccess = useCallback(async () => {
    setSessionStatus('authenticated');
    await loadInterviewData();
    navigate('/');
  }, [navigate, loadInterviewData]);

  // Handle Lock App
  const handleLockApp = useCallback(async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // ignore
    }
    setSessionStatus('unauthenticated');
    setInterviewData(null);
    navigate('/');
  }, [navigate]);

  // 1. Existing Mobile-Only Restriction takes PRIORITY over all screens
  if (isMobile) {
    return <MobileErrorScreen />;
  }

  // 2. Parse current route
  const [pathname, search] = currentUrl.split('?');

  // 3. Catch-all: Custom 404 Page for unknown routes
  if (!isKnownRoute(pathname)) {
    return (
      <NotFound
        onNavigateHome={() => navigate('/')}
        onNavigatePractice={() => navigate('/practice')}
        onLockApp={sessionStatus === 'authenticated' ? handleLockApp : undefined}
      />
    );
  }

  // 4. Initial verification status check loading state
  if (sessionStatus === 'checking') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-slate-600 select-none">
        <Logo size="lg" showSubtitle={false} className="mb-4" />
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-[#079669]" />
          <span>Checking verification...</span>
        </div>
      </div>
    );
  }

  // 5. Verification Gate: shown whenever the user is not authenticated
  if (sessionStatus === 'unauthenticated') {
    return <VerificationScreen onSuccess={handleVerificationSuccess} />;
  }

  // 6. Loading state while fetching protected interview questions after verification
  if (!interviewData) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-slate-600 select-none">
        <Logo size="lg" showSubtitle={false} className="mb-4" />
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-[#079669]" />
          <span>Loading practice questions...</span>
        </div>
      </div>
    );
  }

  // 7. Authenticated App Navigation
  const searchParams = new URLSearchParams(search || '');
  const modeParam = searchParams.get('mode');
  const questionParam = searchParams.get('question');
  const categoryParam = searchParams.get('category') || searchParams.get('difficulty');

  const isPracticeInterview =
    modeParam === 'practice' ||
    (pathname.startsWith('/practice/') && pathname !== '/practice');

  let practiceQuestionId: number | undefined;
  if (questionParam) {
    practiceQuestionId = parseInt(questionParam, 10);
  } else if (pathname.startsWith('/practice/')) {
    const idStr = pathname.replace('/practice/', '');
    practiceQuestionId = parseInt(idStr, 10);
  }

  // Practice More List Page (/practice without a specific question)
  if (pathname === '/practice' && !isPracticeInterview) {
    return (
      <Practice
        onNavigateHome={() => navigate('/')}
        onPracticeQuestion={(questionId) =>
          navigate(`/test-interview?mode=practice&question=${questionId}`)
        }
        onLockApp={handleLockApp}
        interviewData={interviewData}
      />
    );
  }

  // Difficulty Interview Category Selection Page (/difficulty-interview without category selected)
  if (pathname === '/difficulty-interview' && !categoryParam) {
    return (
      <DifficultyInterview
        interviewData={interviewData}
        onSelectCategory={(category) =>
          navigate(`/difficulty-interview?category=${encodeURIComponent(category)}`)
        }
        onNavigateHome={() => navigate('/')}
        onLockApp={handleLockApp}
      />
    );
  }

  // Difficulty-Based Interview Mode (either /difficulty-interview?category=... or /test-interview?mode=difficulty&category=...)
  const isDifficultyInterview =
    (pathname === '/difficulty-interview' && Boolean(categoryParam)) ||
    (modeParam === 'difficulty' && Boolean(categoryParam));

  const interviewKey = isPracticeInterview
    ? `practice-${practiceQuestionId}`
    : isDifficultyInterview
    ? `difficulty-${categoryParam}`
    : 'full-interview';

  return (
    <TestInterview
      key={interviewKey}
      mode={isPracticeInterview ? 'practice' : isDifficultyInterview ? 'difficulty' : 'full'}
      practiceQuestionId={practiceQuestionId}
      selectedDifficulty={isDifficultyInterview ? (categoryParam ?? undefined) : undefined}
      onNavigatePractice={() => navigate('/practice')}
      onNavigateDifficulty={() => navigate('/difficulty-interview')}
      onNavigateHome={() => navigate('/')}
      onLockApp={handleLockApp}
      interviewData={interviewData}
    />
  );
}

export default App;
