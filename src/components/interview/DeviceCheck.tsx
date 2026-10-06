import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, AlertCircle, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { MediaDeviceStatus } from '../../types/interview';

interface DeviceCheckProps {
  onReady: (stream: MediaStream) => void;
  onBack: () => void;
}

export const DeviceCheck: React.FC<DeviceCheckProps> = ({ onReady, onBack }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<MediaDeviceStatus>({
    hasCamera: true,
    hasMicrophone: true,
    cameraGranted: false,
    microphoneGranted: false,
    error: null,
  });
  const [micLevel, setMicLevel] = useState<number>(0);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const startMediaCheck = async () => {
    setIsRequesting(true);
    setDeviceStatus((prev) => ({ ...prev, error: null }));

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setDeviceStatus({
        hasCamera: false,
        hasMicrophone: false,
        cameraGranted: false,
        microphoneGranted: false,
        error: 'Your browser does not support camera and microphone access. Please use Chrome, Safari, Edge, or Firefox.',
      });
      setIsRequesting(false);
      return;
    }

    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      const userStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setStream(userStream);
      setDeviceStatus({
        hasCamera: userStream.getVideoTracks().length > 0,
        hasMicrophone: userStream.getAudioTracks().length > 0,
        cameraGranted: true,
        microphoneGranted: true,
        error: null,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }

      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(userStream);
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateVolume);
          };

          updateVolume();
        }
      } catch (audioErr) {
        console.warn('Audio metering init error:', audioErr);
      }
    } catch (err: any) {
      console.error('getUserMedia error:', err);
      let errorMessage = 'Failed to access camera and microphone.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        if (err.message?.toLowerCase().includes('audio') || err.message?.toLowerCase().includes('mic')) {
          errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings before starting the interview.';
        } else {
          errorMessage = 'Camera access was denied. Please allow camera access in your browser settings before starting the interview.';
        }
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera or microphone found on your device. Please connect a working webcam and microphone.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Your camera or microphone is currently in use by another application. Please close other apps and retry.';
      }

      setDeviceStatus({
        hasCamera: false,
        hasMicrophone: false,
        cameraGranted: false,
        microphoneGranted: false,
        error: errorMessage,
      });
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    startMediaCheck();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleProceed = () => {
    if (stream && deviceStatus.cameraGranted && deviceStatus.microphoneGranted) {
      onReady(stream);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3 flex items-center gap-1.5 cursor-pointer font-medium"
        >
          ← Back to Overview
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-heading">
          Interview Setup & Device Check
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Verify your camera and microphone are operating correctly before beginning the interview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Camera Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden shadow-lg flex items-center justify-center">
            {deviceStatus.cameraGranted ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-300 font-medium">Camera preview will appear here</p>
              </div>
            )}

            {/* Live Camera Badge */}
            {deviceStatus.cameraGranted && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md border border-slate-200/80 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Feed</span>
              </div>
            )}

            {/* Audio Meter Overlay */}
            {deviceStatus.microphoneGranted && (
              <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 flex items-center gap-3 shadow-md">
                <Mic className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-75 rounded-full"
                    style={{ width: `${Math.max(5, micLevel)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-600 shrink-0">
                  {micLevel > 10 ? 'Audio detected' : 'Speak to test mic'}
                </span>
              </div>
            )}
          </div>

          {/* Test Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={startMediaCheck}
              disabled={isRequesting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRequesting ? 'animate-spin' : ''}`} />
              <span>{isRequesting ? 'Testing Devices...' : 'Test Camera & Microphone'}</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium ${deviceStatus.cameraGranted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                <Camera className="w-3.5 h-3.5" />
                <span>{deviceStatus.cameraGranted ? 'Camera ready' : 'Camera off'}</span>
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium ${deviceStatus.microphoneGranted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                <Mic className="w-3.5 h-3.5" />
                <span>{deviceStatus.microphoneGranted ? 'Microphone ready' : 'Mic off'}</span>
              </span>
            </div>
          </div>

          {/* Error Message Box */}
          {deviceStatus.error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-800">Device Access Issue</p>
                <p className="text-xs text-rose-700 leading-relaxed">{deviceStatus.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Instructions & Proceed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Before you begin</span>
            </h3>

            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>Make sure your camera is working.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>Make sure your microphone is working.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>Find a quiet place without background distractions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>You will have 10 seconds to prepare for each question.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>Recording will begin automatically after the preparation timer.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>AI feedback will be provided after each answer.</span>
              </li>
            </ul>
          </div>

          {/* Start Interview Action */}
          <button
            onClick={handleProceed}
            disabled={!deviceStatus.cameraGranted || !deviceStatus.microphoneGranted}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-base shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <span>Start Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!deviceStatus.cameraGranted && (
            <p className="text-center text-xs text-slate-500">
              Please allow camera and microphone permissions to proceed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
