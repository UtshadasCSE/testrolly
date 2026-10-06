import React from 'react';
import { formatDuration } from '../../utils/recording';

interface RecordingIndicatorProps {
  durationSeconds: number;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({ durationSeconds }) => {
  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-rose-200 shadow-md">
      <div className="relative flex items-center justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 recording-dot" />
        <span className="absolute w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping opacity-75" />
      </div>
      <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
        Recording
      </span>
      <span className="w-1 h-3 border-r border-slate-200 mx-0.5" />
      <span className="text-xs font-mono font-bold text-slate-800 tracking-widest">
        {formatDuration(durationSeconds)}
      </span>
    </div>
  );
};
