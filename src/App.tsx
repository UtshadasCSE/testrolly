import React, { useState, useEffect, useCallback } from 'react';
import { TestInterview } from './pages/TestInterview';
import { Practice } from './pages/Practice';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  if (currentPath === '/practice') {
    return <Practice onNavigateHome={() => navigate('/')} />;
  }

  return <TestInterview onNavigatePractice={() => navigate('/practice')} />;
}

export default App;
