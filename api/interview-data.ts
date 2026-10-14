import { isAuthenticated } from '../server/auth.js';
import { getInterviewData } from '../server/interviewQuestions.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only GET requests are supported.',
    });
  }

  if (!isAuthenticated(req)) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Access verification required.',
    });
  }

  try {
    const data = getInterviewData();
    return res.status(200).json({
      title: data.title,
      description: data.description,
      questions: data.questions,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'DATA_LOAD_ERROR',
      message: 'Failed to load interview data.',
    });
  }
}
