import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { evaluateAnswerWithCloudflare } from './cloudflareService';

// Ensure env vars are loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function getInterviewData() {
  const filePath = path.resolve(process.cwd(), 'src/data/test.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('Interview data file src/data/test.json not found.');
  }
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';

  // GET /api/health
  if (req.method === 'GET' && url.startsWith('/api/health')) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const isConfigured = Boolean(
      accountId &&
      apiToken &&
      accountId.trim() !== '' &&
      apiToken.trim() !== ''
    );
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      cloudflareConfigured: isConfigured,
      timestamp: new Date().toISOString(),
    }));
    return true;
  }

  // POST /api/evaluate
  if (req.method === 'POST' && url.startsWith('/api/evaluate')) {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const rawBody = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';

      let questionId: number | null = null;
      let durationSeconds = 0;
      let audioBuffer: Buffer | undefined;
      let audioMimeType = 'audio/webm';
      let transcriptFallback: string | undefined;

      if (contentType.includes('application/json')) {
        const parsed = JSON.parse(rawBody.toString('utf-8'));
        questionId = parseInt(parsed.questionId, 10);
        durationSeconds = parseFloat(parsed.durationSeconds) || 0;
        transcriptFallback = parsed.transcriptFallback;
        if (parsed.audioBase64) {
          audioBuffer = Buffer.from(parsed.audioBase64, 'base64');
          audioMimeType = parsed.audioMimeType || audioMimeType;
        }
      } else if (contentType.includes('multipart/form-data')) {
        // Parse multipart boundary
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        if (boundaryMatch) {
          const boundary = boundaryMatch[1] || boundaryMatch[2];
          const parts = parseMultipart(rawBody, boundary);

          const qIdPart = parts.find((p) => p.name === 'questionId');
          if (qIdPart) questionId = parseInt(qIdPart.data.toString('utf-8').trim(), 10);

          const durPart = parts.find((p) => p.name === 'durationSeconds');
          if (durPart) durationSeconds = parseFloat(durPart.data.toString('utf-8').trim()) || 0;

          const transcriptPart = parts.find((p) => p.name === 'transcriptFallback');
          if (transcriptPart) transcriptFallback = transcriptPart.data.toString('utf-8').trim();

          const audioPart = parts.find((p) => p.name === 'audio' || p.filename);
          if (audioPart) {
            audioBuffer = audioPart.data;
            audioMimeType = audioPart.type || audioMimeType;
          }
        }
      }

      if (questionId === null || isNaN(questionId)) {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'INVALID_REQUEST', message: 'A valid questionId is required.' }));
        return true;
      }

      // Lookup question in test.json
      const testData = getInterviewData();
      const foundQuestion = testData.questions?.find((q: any) => q.id === questionId);

      if (!foundQuestion) {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(404);
        res.end(JSON.stringify({
          error: 'QUESTION_NOT_FOUND',
          message: `Question with ID ${questionId} does not exist in src/data/test.json.`,
        }));
        return true;
      }

      const feedback = await evaluateAnswerWithCloudflare({
        question: foundQuestion.question,
        expectedAnswer: foundQuestion.expectedAnswer,
        durationSeconds: Math.round(durationSeconds),
        audioBuffer,
        audioMimeType,
        transcriptFallback,
      });

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(feedback));
      return true;
    } catch (err: any) {
      console.error('[Testrolly API] Evaluation error:', err?.message || err);
      res.setHeader('Content-Type', 'application/json');

      if (err?.message === 'CLOUDFLARE_NOT_CONFIGURED') {
        res.writeHead(503);
        res.end(JSON.stringify({
          error: 'CLOUDFLARE_NOT_CONFIGURED',
          message: 'Cloudflare Workers AI is not configured on the server. Please configure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in environment variables.',
        }));
        return true;
      }

      if (err?.message === 'INAUDIBLE_TRANSCRIPT') {
        res.writeHead(422);
        res.end(JSON.stringify({
          error: 'INAUDIBLE_TRANSCRIPT',
          message: "We couldn't clearly understand your recorded answer. Please try recording your answer again.",
        }));
        return true;
      }

      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'EVALUATION_FAILED',
        message: "We couldn't analyze your answer right now. Your recording is safe. Please try again.",
      }));
      return true;
    }
  }

  return false;
}

// Lightweight multipart buffer parser helper
interface MultipartPart {
  name?: string;
  filename?: string;
  type?: string;
  data: Buffer;
}

function parseMultipart(buffer: Buffer, boundary: string): MultipartPart[] {
  const parts: MultipartPart[] = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  let start = 0;

  while (true) {
    const boundaryIndex = buffer.indexOf(boundaryBuffer, start);
    if (boundaryIndex === -1) break;

    const partStart = boundaryIndex + boundaryBuffer.length;
    let nextBoundaryIndex = buffer.indexOf(boundaryBuffer, partStart);
    if (nextBoundaryIndex === -1) {
      nextBoundaryIndex = buffer.length;
    }

    const partBuffer = buffer.subarray(partStart, nextBoundaryIndex);
    const headerEndIndex = partBuffer.indexOf('\r\n\r\n');

    if (headerEndIndex !== -1) {
      const headerString = partBuffer.subarray(0, headerEndIndex).toString('utf-8');
      let data = partBuffer.subarray(headerEndIndex + 4);

      // Trim trailing \r\n before next boundary
      if (data.length >= 2 && data[data.length - 2] === 0x0d && data[data.length - 1] === 0x0a) {
        data = data.subarray(0, data.length - 2);
      }

      const nameMatch = headerString.match(/name="([^"]+)"/);
      const filenameMatch = headerString.match(/filename="([^"]+)"/);
      const typeMatch = headerString.match(/Content-Type:\s*([^\r\n]+)/i);

      parts.push({
        name: nameMatch ? nameMatch[1] : undefined,
        filename: filenameMatch ? filenameMatch[1] : undefined,
        type: typeMatch ? typeMatch[1].trim() : undefined,
        data,
      });
    }

    start = nextBoundaryIndex;
  }

  return parts;
}
