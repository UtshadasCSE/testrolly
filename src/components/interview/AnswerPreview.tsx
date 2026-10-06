import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RotateCcw, Film, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDuration } from '../../utils/recording';

interface AnswerPreviewProps {
  videoUrl: string;
  durationSeconds: number;
  onAnalyze: () => void;
  onRecordAgain: () => void;
  isAnalyzing?: boolean;
}

export const AnswerPreview: React.FC<AnswerPreviewProps> = ({
  videoUrl,
  durationSeconds,
  onAnalyze,
  onRecordAgain,
  isAnalyzing = false,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setIsMetadataLoaded(false);
    setHasVideoError(false);

    if (videoRef.current) {
      // Ensure no live camera MediaStream remains attached
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
  }, [videoUrl]);

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;

    console.log('[Testrolly Recording] Preview metadata loaded:', {
      duration: videoRef.current.duration,
      videoWidth: videoRef.current.videoWidth,
      videoHeight: videoRef.current.videoHeight,
      readyState: videoRef.current.readyState,
    });

    setIsMetadataLoaded(true);
    setHasVideoError(false);

    // Seek slightly to 0.05s to force video pipeline to render the first frame thumbnail
    if (Number.isFinite(videoRef.current.duration) && videoRef.current.duration > 0.1) {
      try {
        videoRef.current.currentTime = 0.05;
      } catch (err) {
        console.warn('[Testrolly Recording] First frame seek adjustment notice:', err);
      }
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const err = videoRef.current?.error;
    console.error('[Testrolly Recording] Video error event:', err || e);
    setHasVideoError(true);
    setIsMetadataLoaded(false);
  };

  const handleReloadPreview = () => {
    setHasVideoError(false);
    setIsMetadataLoaded(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = videoUrl;
      videoRef.current.load();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-emerald-600" />
          <h3 className="text-xl font-bold text-slate-900 font-heading">Your Recorded Answer</h3>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
          Duration: {formatDuration(durationSeconds)}
        </span>
      </div>

      {/* Large Video Player - Matching 70-80% width and 16:9 aspect ratio */}
      <div className="w-full md:w-[90%] lg:w-[80%] mx-auto relative aspect-video rounded-2xl bg-black border border-slate-200 overflow-hidden shadow-xl">
        {/* Loading Overlay while parsing recording headers */}
        {!isMetadataLoaded && !hasVideoError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm text-slate-300 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <p className="text-xs font-medium text-slate-300">Preparing your recording...</p>
          </div>
        )}

        {/* Error Overlay if playback fails */}
        {hasVideoError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 text-slate-200 p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-sm font-semibold text-slate-200">We couldn't load the recording preview.</p>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Your recording is safe and ready for analysis. You can reload the preview or proceed with analysis.
            </p>
            <button
              type="button"
              onClick={handleReloadPreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Preview</span>
            </button>
          </div>
        )}

        <video
          key={videoUrl}
          ref={videoRef}
          src={videoUrl}
          controls
          playsInline
          className="w-full h-full object-contain"
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => setIsMetadataLoaded(true)}
          onError={handleVideoError}
        />
      </div>

      {/* Centered Actions Underneath Video */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          disabled={isAnalyzing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Record Again</span>
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-emerald-100" />
          <span>Analyze My Answer</span>
        </button>
      </div>

      {/* Confirmation Modal for Record Again */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 font-heading">Record Again?</h4>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to discard this recording and record your answer again? You will receive another 10-second preparation timer.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                Keep Current Recording
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  onRecordAgain();
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Yes, Record Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
