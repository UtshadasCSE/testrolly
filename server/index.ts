import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { evaluateAnswerWithCloudflare } from './cloudflareService.js';
import { getInterviewData, getInterviewQuestionById } from './interviewQuestions.js';
import {
  verifyCredentials,
  createSessionToken,
  parseCookies,
  revokeToken,
  createSessionCookie,
  clearSessionCookie,
  checkRateLimit,
  recordFailedVerification,
  resetVerificationRateLimit,
  getClientIp,
  isRequestSecure,
  isAuthenticated,
} from './auth.js';

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

// Health check and config status endpoint (NEVER exposes secrets)
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

// GET /api/session - Check authentication state
app.get('/api/session', (req, res) => {
  const authed = isAuthenticated(req);
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({ authenticated: authed });
});

// POST /api/verify - Rate-limited university & course gate verification
app.post('/api/verify', (req, res) => {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many verification attempts. Please wait a few minutes before trying again.',
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
  }

  const { university, course } = req.body || {};

  if (!university || !course || typeof university !== 'string' || typeof course !== 'string' || !university.trim() || !course.trim()) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Please provide both your university name and course name.',
    });
  }

  const isValid = verifyCredentials(university, course);
  if (!isValid) {
    recordFailedVerification(ip);
    return res.status(401).json({
      error: 'VERIFICATION_FAILED',
      message: 'Verification failed. Please check your university and course details and try again.',
    });
  }

  resetVerificationRateLimit(ip);
  const token = createSessionToken(university, course);
  const secure = isRequestSecure(req);
  res.setHeader('Set-Cookie', createSessionCookie(token, secure));
  return res.json({
    success: true,
    message: 'Verification successful. Welcome to Testrolly!',
  });
});

// POST /api/logout - Invalidate session & clear cookie ("Lock App")
app.post('/api/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies.testrolly_session) {
    revokeToken(cookies.testrolly_session);
  }
  const secure = isRequestSecure(req);
  res.setHeader('Set-Cookie', clearSessionCookie(secure));
  return res.json({
    success: true,
    message: 'Session ended successfully.',
  });
});

// GET /api/interview-data - Protected interview question bank
app.get('/api/interview-data', (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Access verification required.',
    });
  }

  try {
    const data = getInterviewData();
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return res.json({
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
});

// AI Evaluation Endpoint (Protected)
app.post('/api/evaluate', upload.single('audio'), async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Access verification required to evaluate responses.',
    });
  }

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
