import React, { useState, useEffect, useCallback } from 'react';
import { TestInterview } from './pages/TestInterview';
import { Practice } from './pages/Practice';

export function App() {
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

  // Parse path and query parameters
  const [pathname, search] = currentUrl.split('?');
  const searchParams = new URLSearchParams(search || '');
  const modeParam = searchParams.get('mode');
  const questionParam = searchParams.get('question');

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

  if (pathname === '/practice' && !isPracticeInterview) {
    return (
      <Practice
        onNavigateHome={() => navigate('/')}
        onPracticeQuestion={(questionId) =>
          navigate(`/test-interview?mode=practice&question=${questionId}`)
        }
      />
    );
  }

  return (
    <TestInterview
      key={isPracticeInterview ? `practice-${practiceQuestionId}` : 'full-interview'}
      mode={isPracticeInterview ? 'practice' : 'full'}
      practiceQuestionId={practiceQuestionId}
      onNavigatePractice={() => navigate('/practice')}
      onNavigateHome={() => navigate('/')}
    />
  );
}

export default App;

