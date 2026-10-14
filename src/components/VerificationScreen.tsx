import React, { useState } from 'react';
import { ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

interface VerificationScreenProps {
  onSuccess: () => void;
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({ onSuccess }) => {
  const [university, setUniversity] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Client-side validation: ensure both fields are filled
    const trimmedUni = university.trim();
    const trimmedCourse = course.trim();

    if (!trimmedUni || !trimmedCourse) {
      setErrorMessage('Please provide both your university name and course name.');
      return;
    }

    // 2. Loading state while checking
    setIsLoading(true);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          university: trimmedUni,
          course: trimmedCourse,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        // Verification succeeded
        setSuccessMessage('Verification successful. Welcome to Testrolly!');
        setTimeout(() => {
          onSuccess();
        }, 600);
      } else {
        // Verification failed or rate limited
        const message =
          data?.message ||
          'Verification failed. Please check your university and course details and try again.';
        setErrorMessage(message);
      }
    } catch (err) {
      setErrorMessage('Verification failed. Please check your network connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      id="verification-screen"
      data-testid="verification-screen"
      className="min-h-screen w-full bg-[#f8fafc] flex flex-col justify-center items-center px-4 sm:px-6 py-12 select-none"
    >
      <div className="w-full max-w-[440px] mx-auto">
        {/* Verification Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8 sm:p-10 transition-all duration-200">
          {/* LOGO */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" showSubtitle={false} showText={true} />
          </div>

          {/* HEADING & SUBHEADING */}
          <div className="text-center mb-7">
            <p className="text-xs sm:text-sm font-semibold text-[#079669] mt-1 tracking-wide">
              Private AI-Powered Interview Practice
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
              Please verify your university and course details to continue.
            </p>
          </div>

          {/* ALERT MESSAGES */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs sm:text-sm text-rose-700 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-xl bg-[#effdf8] border border-[#daf6f1] flex items-start gap-2.5 text-xs sm:text-sm text-[#079669] animate-in fade-in duration-150"
            >
              <CheckCircle2 className="w-4 h-4 text-[#079669] shrink-0 mt-0.5" />
              <div className="leading-snug font-medium">{successMessage}</div>
            </div>
          )}

          {/* VERIFICATION FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* INPUT FIELD 1: University Name */}
            <div>
              <label
                htmlFor="university-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                University Name
              </label>
              <input
                id="university-name"
                name="university"
                type="text"
                autoComplete="organization"
                disabled={isLoading}
                value={university}
                onChange={(e) => {
                  setUniversity(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your university name"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#079669] focus:border-transparent transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* INPUT FIELD 2: Course Name */}
            <div>
              <label
                htmlFor="course-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Course Name
              </label>
              <input
                id="course-name"
                name="course"
                type="text"
                autoComplete="off"
                disabled={isLoading}
                value={course}
                onChange={(e) => {
                  setCourse(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your course name"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#079669] focus:border-transparent transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: '#079669' }}
                className="w-full py-3.5 px-5 rounded-xl hover:bg-[#068059] active:scale-[0.99] text-white font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#079669]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Checking Verification...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Your University Credibility & CAS Verification Gate
        </p>
      </div>
    </main>
  );
};
