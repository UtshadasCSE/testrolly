import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { evaluateAnswerWithGemini } from './geminiService';

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

// Load test.json directly from the single source of truth
function getInterviewData() {
  const filePath = path.resolve(process.cwd(), 'src/data/test.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('Interview data file src/data/test.json not found.');
  }
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
}

// Health check and config status endpoint (NEVER exposes the key)
app.get('/api/health', (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(key && key.trim() !== '' && key !== 'MY_PRIVATE_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    geminiConfigured: isConfigured,
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
    const testData = getInterviewData();
    const foundQuestion = testData.questions?.find((q: any) => q.id === qId);

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

    const feedback = await evaluateAnswerWithGemini({
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

    if (error?.message === 'GEMINI_NOT_CONFIGURED') {
      return res.status(503).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'Gemini API is not configured. Add GEMINI_API_KEY to your local environment file and restart the development server.',
      });
    }

    // Clean user-safe error message
    let safeMessage = 'An unexpected error occurred during AI analysis. Please try again.';
    if (error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('API key not valid')) {
      safeMessage = 'The configured Gemini API key is invalid. Please verify your GEMINI_API_KEY.';
    } else if (error?.message?.includes('QUOTA_EXCEEDED') || error?.message?.includes('429')) {
      safeMessage = 'Gemini API quota exceeded or rate limit reached. Please wait a moment and retry.';
    } else if (error?.message) {
      safeMessage = error.message;
    }

    return res.status(500).json({
      error: 'EVALUATION_FAILED',
      message: safeMessage,
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
  console.log(`✓ Test Interview server listening on port ${PORT}`);
});
