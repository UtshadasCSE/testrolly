export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface InterviewQuestion {
  id: number;
  difficulty: DifficultyLevel;
  question: string;
  expectedAnswer: string;
  preparationTime: number;
}

export interface InterviewData {
  title: string;
  description: string;
  questions: InterviewQuestion[];
}

export interface ScoreBreakdown {
  accuracy: number;
  completeness: number;
  relevance: number;
  naturalness: number;
  fluency: number;
  grammar: number;
  clarity: number;
}

export type ScoreStatus = 'Good' | 'Needs Improvement' | 'Needs Practice';

export interface AnswerLengthAnalysis {
  status: 'Too Short' | 'Good Length' | 'Too Long';
  durationSeconds: number;
  wordCount: number;
}

export interface FillerWordItem {
  word: string;
  count: number;
}

export interface FillerWordAnalysis {
  count: number;
  words: FillerWordItem[];
}

export interface MemorizationAnalysis {
  risk: number; // 0 - 100 (0 = extremely low, 100 = extremely high risk)
  level: 'Low' | 'Moderate' | 'High';
  explanation: string;
}

export interface InterviewFeedback {
  overallScore: number; // 0 - 100
  status: ScoreStatus;
  scores: ScoreBreakdown;
  answerLength: AnswerLengthAnalysis;
  fillerWords: FillerWordAnalysis;
  memorization: MemorizationAnalysis;
  strengths: string[];
  improvements: string[];
  missingPoints: string[];
  overallFeedback: string;
  transcript: string;
}

export interface CompletedQuestion {
  questionId: number;
  question: string;
  difficulty: DifficultyLevel;
  recordingBlob?: Blob;
  recordingUrl?: string;
  durationSeconds: number;
  feedback: InterviewFeedback;
  timestamp: number;
}

export type InterviewPhase =
  | 'intro'
  | 'device-check'
  | 'preparing'
  | 'recording'
  | 'review'
  | 'processing'
  | 'feedback'
  | 'completed';

export interface MediaDeviceStatus {
  hasCamera: boolean;
  hasMicrophone: boolean;
  cameraGranted: boolean;
  microphoneGranted: boolean;
  error?: string | null;
  cameraDeviceId?: string;
  microphoneDeviceId?: string;
}

export interface OverallResultSummary {
  averageScore: number;
  status: ScoreStatus;
  categoryAverages: ScoreBreakdown;
  totalDuration: number;
  totalFillerWords: number;
  commonStrengths: string[];
  commonImprovements: string[];
}
