import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { evaluateAnswerWithCloudflare } from './cloudflareService.js';
import { getInterviewQuestionById } from './interviewQuestions.js';

// Load environment variables (.env.local takes precedence over .env)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 3005;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for handling audio recordings
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Health check and config status endpoint (NEVER exposes the key)
app.get('/api/health', (req, res) => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const isConfigured = Boolean(
    accountId &&
    apiToken &&
    accountId.trim() !== '' &&
    apiToken.trim() !== ''
  );
  res.json({
    status: 'ok',
    cloudflareConfigured: isConfigured,
    timestamp: new Date().toISOString(),
  });
});

// AI Evaluation Endpoint
app.post('/api/evaluate', upload.single('audio'), async (req, res) => {
  try {
    const { questionId, durationSeconds, transcriptFallback, audioBase64, audioMimeType } = req.body;
    const qId = parseInt(questionId, 10);
    const duration = parseFloat(durationSeconds) || 0;

    if (isNaN(qId)) {
      return res.status(400).json({ error: 'INVALID_REQUEST', message: 'A valid questionId is required.' });
    }

    // Lookup question from test.json
    const foundQuestion = getInterviewQuestionById(qId);

    if (!foundQuestion) {
      return res.status(404).json({
        error: 'QUESTION_NOT_FOUND',
        message: `Question with ID ${qId} does not exist in src/data/test.json.`,
      });
    }

    let audioBuffer: Buffer | undefined;
    let mimeType = audioMimeType || 'audio/webm';

    if (req.file) {
      audioBuffer = req.file.buffer;
      mimeType = req.file.mimetype || mimeType;
    } else if (audioBase64) {
      audioBuffer = Buffer.from(audioBase64, 'base64');
    }

    const feedback = await evaluateAnswerWithCloudflare({
      question: foundQuestion.question,
      expectedAnswer: foundQuestion.expectedAnswer,
      durationSeconds: Math.round(duration),
      audioBuffer,
      audioMimeType: mimeType,
      transcriptFallback: typeof transcriptFallback === 'string' ? transcriptFallback : undefined,
    });

    return res.json(feedback);
  } catch (error: any) {
    console.error('Evaluation error:', error?.message || error);

    if (error?.message === 'CLOUDFLARE_NOT_CONFIGURED') {
      return res.status(503).json({
        error: 'CLOUDFLARE_NOT_CONFIGURED',
        message: 'Cloudflare Workers AI is not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to your environment variables and restart the server.',
      });
    }

    if (error?.message === 'INAUDIBLE_TRANSCRIPT') {
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
});

// Production static file serving if dist exists
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✓ Testrolly server listening on port ${PORT}`);
});
