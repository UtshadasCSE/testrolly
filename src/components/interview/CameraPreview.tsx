import React, { useEffect, useRef } from 'react';

interface CameraPreviewProps {
  stream: MediaStream | null;
  isRecording?: boolean;
  recordingDuration?: number;
  overlay?: React.ReactNode;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  stream,
  overlay,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      video.play().catch((err) => {
        console.warn('[CameraPreview] Play error (autoplay handled):', err);
      });
    }
  }, [stream]);

  return (
    <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden shadow-2xl flex items-center justify-center">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />
      ) : (
        <div className="text-slate-500 text-sm">No camera feed available</div>
      )}

      {/* Subtle corner framing marks for professional look */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-500/40 pointer-events-none" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-500/40 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-500/40 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-500/40 pointer-events-none" />

      {/* Dynamic Overlay */}
      {overlay && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
          {overlay}
        </div>
      )}
    </div>
  );
};
