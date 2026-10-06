import testData from '../src/data/test.json';
import { evaluateAnswerWithCloudflare } from '../server/cloudflareService';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  // Set JSON headers immediately
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are supported for this endpoint.',
    });
  }

  try {
    let questionId: number | null = null;
    let durationSeconds = 0;
    let audioBuffer: Buffer | undefined;
    let audioMimeType = 'audio/webm';
    let transcriptFallback: string | undefined;

    const body = req.body;

    if (body) {
      if (typeof body === 'object' && !Buffer.isBuffer(body)) {
        questionId = parseInt(body.questionId, 10);
        durationSeconds = parseFloat(body.durationSeconds) || 0;
        transcriptFallback = body.transcriptFallback;
        audioMimeType = body.audioMimeType || audioMimeType;

        if (body.audioBase64) {
          audioBuffer = Buffer.from(body.audioBase64, 'base64');
        }
      } else if (typeof body === 'string') {
        try {
          const parsed = JSON.parse(body);
          questionId = parseInt(parsed.questionId, 10);
          durationSeconds = parseFloat(parsed.durationSeconds) || 0;
          transcriptFallback = parsed.transcriptFallback;
          audioMimeType = parsed.audioMimeType || audioMimeType;

          if (parsed.audioBase64) {
            audioBuffer = Buffer.from(parsed.audioBase64, 'base64');
          }
        } catch {
          // not JSON string
        }
      }
    }

    if (questionId === null || isNaN(questionId)) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'A valid questionId is required.',
      });
    }

    // Lookup question from test.json (single source of truth)
    const foundQuestion = testData.questions?.find((q: any) => q.id === questionId);

    if (!foundQuestion) {
      return res.status(404).json({
        error: 'QUESTION_NOT_FOUND',
        message: `Question with ID ${questionId} does not exist in interview data.`,
      });
    }

    const feedback = await evaluateAnswerWithCloudflare({
      question: foundQuestion.question,
      expectedAnswer: foundQuestion.expectedAnswer,
      durationSeconds: Math.round(durationSeconds),
      audioBuffer,
      audioMimeType,
      transcriptFallback,
    });

    return res.status(200).json(feedback);
  } catch (err: any) {
    console.error('[Testrolly Vercel API] Error during evaluation:', err?.message || err);

    if (err?.message === 'CLOUDFLARE_NOT_CONFIGURED') {
      return res.status(503).json({
        error: 'CLOUDFLARE_NOT_CONFIGURED',
        message: 'Cloudflare Workers AI is not configured on the server. Please configure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in Vercel Environment Variables and redeploy.',
      });
    }

    if (err?.message === 'INAUDIBLE_TRANSCRIPT') {
      return res.status(422).json({
        error: 'INAUDIBLE_TRANSCRIPT',
        message: "We couldn't clearly understand your recorded answer. Please try recording your answer again.",
      });
    }

    return res.status(500).json({
      error: 'EVALUATION_FAILED',
      message: "We couldn't analyze your answer right now. Your recording is safe. Please try again.",
    });
  }
}
