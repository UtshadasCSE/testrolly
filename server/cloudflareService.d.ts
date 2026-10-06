import type { InterviewFeedback } from '../src/types/interview';

export declare const TRANSCRIPTION_MODEL: string;
export declare const EVALUATION_MODEL: string;

export declare function transcribeAudioWithCloudflare(
  audioBuffer?: Buffer,
  audioMimeType?: string,
  transcriptFallback?: string
): Promise<string>;

export declare function evaluateTranscriptWithCloudflare(params: {
  question: string;
  expectedAnswer: string;
  transcript: string;
  durationSeconds: number;
}): Promise<InterviewFeedback>;

export declare function evaluateAnswerWithCloudflare(params: {
  question: string;
  expectedAnswer: string;
  durationSeconds: number;
  audioBuffer?: Buffer;
  audioMimeType?: string;
  transcriptFallback?: string;
}): Promise<InterviewFeedback>;
