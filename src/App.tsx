import React, { useState, useEffect, useCallback } from 'react';
import { TestInterview } from './pages/TestInterview';
import { Practice } from './pages/Practice';
import { MobileErrorScreen } from './components/MobileErrorScreen';

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

export function App() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return checkIsMobile();
    }
    return false;
  });

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

  // When mobile device or viewport smaller than 768px is detected, display desktop-only error screen
  if (isMobile) {
    return <MobileErrorScreen />;
  }

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

