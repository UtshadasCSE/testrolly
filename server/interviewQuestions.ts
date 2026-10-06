import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { InterviewData, InterviewQuestion } from '../src/types/interview';

let cachedData: InterviewData | null = null;

/**
 * Resolves the location of src/data/test.json across different runtimes:
 * - Vercel Serverless Function (/var/task)
 * - Local Vite dev server
 * - Standalone Node/tsx server
 */
function resolveTestJsonPath(): string {
  const candidatePaths: string[] = [
    path.join(process.cwd(), 'src', 'data', 'test.json'),
    path.resolve(process.cwd(), 'src/data/test.json'),
  ];

  if (typeof import.meta !== 'undefined' && import.meta.url) {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      candidatePaths.push(
        path.resolve(currentDir, '../src/data/test.json'),
        path.resolve(currentDir, '../../src/data/test.json'),
        path.resolve(currentDir, './src/data/test.json'),
        path.resolve(currentDir, 'src/data/test.json')
      );
    } catch {
      // ignore
    }
  }

  for (const candidate of candidatePaths) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.join(process.cwd(), 'src', 'data', 'test.json');
}

/**
 * Reads and parses the single source of truth: src/data/test.json
 */
export function getInterviewData(): InterviewData {
  if (cachedData) {
    return cachedData;
  }

  const filePath = resolveTestJsonPath();
  if (!fs.existsSync(filePath)) {
    throw new Error(`Interview data file not found at: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  cachedData = JSON.parse(raw) as InterviewData;
  return cachedData;
}

/**
 * Returns all interview questions from test.json
 */
export function getInterviewQuestions(): InterviewQuestion[] {
  const data = getInterviewData();
  return data.questions || [];
}

/**
 * Looks up a specific question by ID from test.json
 */
export function getInterviewQuestionById(id: number | string): InterviewQuestion | undefined {
  const numericId = typeof id === 'number' ? id : parseInt(String(id), 10);
  if (isNaN(numericId)) return undefined;
  const questions = getInterviewQuestions();
  return questions.find((q) => q.id === numericId);
}
