import React, { useState, useRef, useEffect } from 'react';
import interviewDataRaw from '../data/test.json';
import {
  CompletedQuestion,
  InterviewData,
  InterviewFeedback,
  InterviewPhase,
  InterviewQuestion as IInterviewQuestion,
} from '../types/interview';
import { InterviewIntro } from '../components/interview/InterviewIntro';
import { DeviceCheck } from '../components/interview/DeviceCheck';
import { InterviewProgress } from '../components/interview/InterviewProgress';
import { InterviewQuestion } from '../components/interview/InterviewQuestion';
import { QuestionTimer } from '../components/interview/QuestionTimer';
import { CameraPreview } from '../components/interview/CameraPreview';
import { RecordingIndicator } from '../components/interview/RecordingIndicator';
import { AnswerPreview } from '../components/interview/AnswerPreview';
import { ProcessingState } from '../components/interview/ProcessingState';
import { QuestionFeedback } from '../components/interview/QuestionFeedback';
import { OverallFeedback } from '../components/interview/OverallFeedback';
import { Navbar } from '../components/navbar/Navbar';
import {
  blobToBase64,
  extractAudioFromBlob,
  formatDuration,
  getSupportedVideoMimeType,
  stopMediaStream,
} from '../utils/recording';
import { AlertCircle, RefreshCw, Square, Loader2, ArrowLeft } from 'lucide-react';

const testData = interviewDataRaw as InterviewData;

interface TestInterviewProps {
  mode?: 'full' | 'practice';
  practiceQuestionId?: number;
  onNavigatePractice?: () => void;
  onNavigateHome?: () => void;
}

export const TestInterview: React.FC<TestInterviewProps> = ({
  mode = 'full',
  practiceQuestionId,
  onNavigatePractice,
  onNavigateHome,
}) => {
  const isPracticeMode = mode === 'practice';
  const allQuestions: IInterviewQuestion[] = testData.questions || [];
  const practiceQuestion =
    isPracticeMode && practiceQuestionId
      ? allQuestions.find((q) => q.id === practiceQuestionId)
      : undefined;

  const isInvalidPracticeQuestion = isPracticeMode && !practiceQuestion;

  const questions: IInterviewQuestion[] =
    isPracticeMode && practiceQuestion ? [practiceQuestion] : allQuestions;

  // Navigation & Interview State
  const [phase, setPhase] = useState<InterviewPhase>(isPracticeMode ? 'device-check' : 'intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [completedQuestions, setCompletedQuestions] = useState<CompletedQuestion[]>([]);

  // Hardware & Media State
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Current Question Recording & Feedback State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [currentRecordingBlob, setCurrentRecordingBlob] = useState<Blob | null>(null);
  const [currentRecordingUrl, setCurrentRecordingUrl] = useState<string | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<InterviewFeedback | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const currentQuestion: IInterviewQuestion | undefined = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;

  const mediaStreamRef = useRef<MediaStream | null>(null);
  mediaStreamRef.current = mediaStream;

  const currentRecordingUrlRef = useRef<string | null>(null);
  currentRecordingUrlRef.current = currentRecordingUrl;

  // Cleanup ONLY on component unmount
  useEffect(() => {
    return () => {
      stopMediaStream(mediaStreamRef.current);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (currentRecordingUrlRef.current) {
        try {
          URL.revokeObjectURL(currentRecordingUrlRef.current);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Handler: When Device Check completes successfully
  const handleDeviceCheckReady = (stream: MediaStream) => {
    setMediaStream(stream);
    setCurrentQuestionIndex(0);
    setCompletedQuestions([]);
    setPhase('preparing');
  };

  // Handler: Preparation Timer Finished -> Start Recording automatically
  const handlePreparationFinished = () => {
    startRecording();
  };

  // Start MediaRecorder
  const startRecording = () => {
    if (!mediaStream) {
      console.error('[Testrolly Recording] No media stream available for recording');
      return;
    }

    recordedChunksRef.current = [];
    setRecordingDuration(0);
    setAnalysisError(null);
    setIsFinalizing(false);

    try {
      const mimeType = getSupportedVideoMimeType();
      const options: MediaRecorderOptions = {};
      if (mimeType) {
        options.mimeType = mimeType;
      }

      console.log('[Testrolly Recording] Initializing MediaRecorder with options:', options);
      const recorder = new MediaRecorder(mediaStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log(`[Testrolly Recording] Chunk received: ${event.data.size} bytes (Total chunks: ${recordedChunksRef.current.length})`);
        }
      };

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || mimeType || 'video/webm';
        const totalChunks = recordedChunksRef.current.length;
        const blob = new Blob(recordedChunksRef.current, { type: finalMime });

        const calculatedDuration = recordingStartTimeRef.current > 0
          ? Math.max(1, Math.round((Date.now() - recordingStartTimeRef.current) / 1000))
          : recordingDuration;

        console.log('[Testrolly Recording] MediaRecorder onstop event completed:', {
          chunks: totalChunks,
          blobSize: blob.size,
          blobType: blob.type,
          durationSeconds: calculatedDuration,
        });

        if (blob.size === 0) {
          console.error('[Testrolly Recording] Error: Empty recording blob created.');
          setAnalysisError('Recording failed to capture media. Please try recording again.');
          setIsFinalizing(false);
          setPhase('preparing');
          return;
        }

        // Clean up previous URL if replacing
        if (currentRecordingUrl) {
          try {
            URL.revokeObjectURL(currentRecordingUrl);
          } catch {
            // ignore
          }
        }

        const url = URL.createObjectURL(blob);
        setCurrentRecordingBlob(blob);
        setCurrentRecordingUrl(url);
        setRecordingDuration(calculatedDuration);
        setIsFinalizing(false);
        setPhase('review');
      };

      recorder.onerror = (event: any) => {
        console.error('[Testrolly Recording] MediaRecorder error event:', event?.error || event);
        setIsFinalizing(false);
        setIsRecording(false);
      };

      recorder.start(500);
      setIsRecording(true);
      setPhase('recording');
      recordingStartTimeRef.current = Date.now();

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = window.setInterval(() => {
        const elapsedSecs = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setRecordingDuration(elapsedSecs);
      }, 500);
    } catch (err: any) {
      console.error('[Testrolly Recording] Error starting MediaRecorder:', err);
      setAnalysisError('Failed to start recording. Please check camera and microphone permissions.');
      setIsRecording(false);
      setIsFinalizing(false);
    }
  };

  // Stop MediaRecorder
  const handleStopRecording = () => {
    if (isFinalizing || !isRecording) return;
    setIsFinalizing(true);
    setIsRecording(false);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        console.log('[Testrolly Recording] Requesting data flush and stopping MediaRecorder...');
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.requestData();
        }
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('[Testrolly Recording] Error calling stop on MediaRecorder:', err);
        setIsFinalizing(false);
      }
    } else {
      setIsFinalizing(false);
    }
  };

  // Handler: Candidate chooses "Record Again" from preview
  const handleRecordAgain = () => {
    if (currentRecordingUrl) {
      try {
        URL.revokeObjectURL(currentRecordingUrl);
      } catch {
        // ignore
      }
      setCurrentRecordingUrl(null);
    }
    setCurrentRecordingBlob(null);
    setAnalysisError(null);
    setIsFinalizing(false);
    setPhase('preparing');
  };

  // Handler: Candidate clicks "Analyze My Answer"
  const handleAnalyzeAnswer = async () => {
    if (!currentRecordingBlob || !currentQuestion) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setPhase('processing');

    try {
      console.log(`[Testrolly Analysis] Video size: ${(currentRecordingBlob.size / 1024 / 1024).toFixed(2)} MB, MIME: ${currentRecordingBlob.type || 'video/webm'}`);
      
      // Extract pristine 16kHz mono WAV audio for Cloudflare Whisper STT
      const audioBlob = await extractAudioFromBlob(currentRecordingBlob);
      console.log(`[Testrolly Analysis] Extracted audio size: ${(audioBlob.size / 1024).toFixed(1)} KB, MIME: ${audioBlob.type}`);

      const base64Audio = await blobToBase64(audioBlob);

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          durationSeconds: recordingDuration,
          audioBase64: base64Audio,
          audioMimeType: audioBlob.type || 'audio/wav',
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      console.log(`[Testrolly API] Status: ${response.status}, Content-Type: ${contentType}`);

      let data: any = null;
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseErr) {
          console.error('[Testrolly API] Failed to parse JSON response:', parseErr);
        }
      } else {
        const rawText = await response.text();
        console.warn('[Testrolly API] Received non-JSON response from server/Vercel:', rawText.slice(0, 300));
      }

      if (!response.ok || !data) {
        let userFriendlyMessage = "We couldn't analyze your answer right now. Your recording is safe. Please try again.";
        if (data?.message) {
          userFriendlyMessage = data.message;
        } else if (response.status === 413) {
          userFriendlyMessage = "The recording payload was too large for the server. Your recording is safe, please try a slightly shorter answer.";
        }
        throw new Error(userFriendlyMessage);
      }

      setCurrentFeedback(data);
      setPhase('feedback');
    } catch (err: any) {
      console.error('[Testrolly Recording] Evaluation API error:', err);
      setAnalysisError(err.message || "We couldn't analyze your answer right now. Your recording is safe. Please try again.");
      setPhase('review'); // Keep recording safe in review screen
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler: Save current feedback to completed questions list
  const saveCurrentQuestionResult = () => {
    if (currentQuestion && currentFeedback) {
      const completed: CompletedQuestion = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        difficulty: currentQuestion.difficulty,
        recordingBlob: currentRecordingBlob || undefined,
        recordingUrl: currentRecordingUrl || undefined,
        durationSeconds: recordingDuration,
        feedback: currentFeedback,
        timestamp: Date.now(),
      };

      setCompletedQuestions((prev) => {
        const filtered = prev.filter((q) => q.questionId !== currentQuestion.id);
        return [...filtered, completed];
      });
    }
  };

  // Handler: Next Question
  const handleNextQuestion = () => {
    saveCurrentQuestionResult();

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentRecordingBlob(null);
      if (currentRecordingUrl) {
        try {
          URL.revokeObjectURL(currentRecordingUrl);
        } catch {
          // ignore
        }
        setCurrentRecordingUrl(null);
      }
      setCurrentFeedback(null);
      setAnalysisError(null);
      setIsFinalizing(false);
      setPhase('preparing');
    } else {
      handleFinishInterview();
    }
  };

  // Handler: Retry Question / Practice Again after feedback
  const handleRetryQuestion = () => {
    if (currentRecordingUrl) {
      try {
        URL.revokeObjectURL(currentRecordingUrl);
      } catch {
        // ignore
      }
      setCurrentRecordingUrl(null);
    }
    setCurrentRecordingBlob(null);
    setCurrentFeedback(null);
    setAnalysisError(null);
    setIsFinalizing(false);
    setPhase('preparing');
  };

  // Handler: Finish Interview
  const handleFinishInterview = () => {
    saveCurrentQuestionResult();
    stopMediaStream(mediaStream);
    setMediaStream(null);
    setPhase('completed');
  };

  // Handler: Restart entire session
  const handleRestartSession = () => {
    if (currentRecordingUrl) {
      try {
        URL.revokeObjectURL(currentRecordingUrl);
      } catch {
        // ignore
      }
      setCurrentRecordingUrl(null);
    }
    setCurrentRecordingBlob(null);
    setCurrentFeedback(null);
    setCompletedQuestions([]);
    setCurrentQuestionIndex(0);
    setIsFinalizing(false);
    setPhase('intro');
  };

  // Safe fallback UI when invalid question is requested in Practice Mode
  if (isInvalidPracticeQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar
          phase="intro"
          isPracticeMode={true}
          onGetStarted={() => onNavigatePractice?.()}
          onLogoClick={onNavigateHome}
        />
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 w-full">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Question Not Found</h2>
            <p className="text-sm text-slate-600">
              The requested practice question (ID: {practiceQuestionId ?? 'invalid'}) does not exist in our interview database.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigatePractice}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Practice Questions</span>
              </button>
            </div>
          </div>
        </main>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          <p>Testrolly — AI University Admission, Credibility & CAS Practice</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Floating Rounded Navbar */}
      <Navbar
        phase={phase}
        isPracticeMode={isPracticeMode}
        onGetStarted={() => setPhase('device-check')}
        onLogoClick={() => {
          handleRestartSession();
          if (onNavigateHome) onNavigateHome();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col justify-center">
        {/* Phase 1: Intro */}
        {phase === 'intro' && !isPracticeMode && (
          <InterviewIntro
            onStart={() => setPhase('device-check')}
            onPracticeMore={onNavigatePractice}
            questionCount={questions.length}
          />
        )}

        {/* Phase 2: Device Check */}
        {phase === 'device-check' && (
          <DeviceCheck
            onReady={handleDeviceCheckReady}
            onBack={() => {
              if (isPracticeMode) {
                if (onNavigatePractice) {
                  onNavigatePractice();
                } else {
                  setPhase('intro');
                }
              } else {
                setPhase('intro');
              }
            }}
            backLabel={isPracticeMode ? '← Back to Practice Questions' : '← Back to Overview'}
            actionLabel={isPracticeMode ? 'Start Practice' : 'Start Interview'}
          />
        )}

        {/* Phase 3 & 4: Preparing / Recording — Centered Vertical Hierarchy */}
        {(phase === 'preparing' || phase === 'recording') && currentQuestion && (
          <div className="max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
            {/* 1. Progress Header */}
            <InterviewProgress
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              difficulty={currentQuestion.difficulty}
              isPracticeMode={isPracticeMode}
              questionId={currentQuestion.id}
            />

            {/* 2. Question Prompt Area */}
            <InterviewQuestion question={currentQuestion.question} />

            {/* 3. Large Centered Camera Video (~70-80% desktop width, 16:9 aspect ratio) */}
            <div className="w-full md:w-[90%] lg:w-[80%] mx-auto">
              <CameraPreview
                key={`cam-${currentQuestion.id}`}
                stream={mediaStream}
                isRecording={isRecording}
                recordingDuration={recordingDuration}
                overlay={
                  phase === 'recording' ? (
                    <div className="flex justify-start items-start w-full">
                      <RecordingIndicator durationSeconds={recordingDuration} />
                    </div>
                  ) : isFinalizing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm text-white space-y-2">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                      <p className="text-sm font-semibold">Preparing your recording...</p>
                    </div>
                  ) : null
                }
              />
            </div>

            {/* 4. Controls / Countdown Area Underneath the Large Video */}
            <div className="w-full md:w-[90%] lg:w-[80%] mx-auto">
              {phase === 'preparing' && (
                <QuestionTimer
                  key={`timer-${currentQuestion.id}`}
                  initialSeconds={currentQuestion.preparationTime || 10}
                  onComplete={handlePreparationFinished}
                  onSkip={handlePreparationFinished}
                />
              )}

              {phase === 'recording' && (
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-center">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-rose-600 font-bold">Answer in Progress</p>
                    <p className="text-3xl font-black font-mono text-slate-900">{formatDuration(recordingDuration)}</p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-normal max-w-md">
                    Look directly into your camera and answer naturally as you would in a formal university interview.
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      disabled={isFinalizing}
                      className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-base shadow-xl shadow-rose-600/25 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      {isFinalizing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Finalizing Recording...</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-4 h-4 fill-white" />
                          <span>Stop Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 5: Review Recorded Answer */}
        {phase === 'review' && currentRecordingUrl && (
          <div className="space-y-6">
            {/* Analysis Error Alert (if previous submit failed) */}
            {analysisError && (
              <div className="w-full md:w-[90%] lg:w-[80%] max-w-4xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-700 text-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <p className="font-bold text-rose-800">We couldn't analyze your answer right now.</p>
                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">Your recording is safe. Please try again.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAnalyzeAnswer}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-sm transition-all active:scale-[0.98]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Analysis</span>
                </button>
              </div>
            )}

            <AnswerPreview
              videoUrl={currentRecordingUrl}
              durationSeconds={recordingDuration}
              onAnalyze={handleAnalyzeAnswer}
              onRecordAgain={handleRecordAgain}
              isAnalyzing={isAnalyzing}
            />
          </div>
        )}

        {/* Phase 6: Processing / AI Evaluation */}
        {phase === 'processing' && <ProcessingState />}

        {/* Phase 7: Question Feedback */}
        {phase === 'feedback' && currentFeedback && (
          <QuestionFeedback
            feedback={currentFeedback}
            isLastQuestion={isLastQuestion}
            isPracticeMode={isPracticeMode}
            onNextQuestion={handleNextQuestion}
            onFinishInterview={handleFinishInterview}
            onRetryQuestion={handleRetryQuestion}
            onBackToQuestions={onNavigatePractice}
          />
        )}

        {/* Phase 8: Final Interview Completed Summary */}
        {phase === 'completed' && (
          <OverallFeedback
            completedQuestions={completedQuestions}
            onRestart={handleRestartSession}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 mt-8">
        <p>Testrolly — AI University Admission, Credibility & CAS Practice</p>
      </footer>
    </div>
  );
};
