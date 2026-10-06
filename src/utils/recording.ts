/**
 * Utility functions for audio and video media recording
 */

export function getSupportedVideoMimeType(): string {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return 'video/webm';
  }

  const types = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
  ];

  for (const type of types) {
    try {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    } catch {
      // ignore
    }
  }

  return '';
}

export function formatDuration(seconds: number): string {
  const rounded = Math.floor(seconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function stopMediaStream(stream: MediaStream | null | undefined): void {
  if (!stream) return;
  try {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (e) {
        console.warn('Error stopping track:', e);
      }
    });
  } catch (err) {
    console.error('Error stopping stream tracks:', err);
  }
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
