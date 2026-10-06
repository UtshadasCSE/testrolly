import { InterviewFeedback, ScoreStatus } from '../src/types/interview';

// Centralized Cloudflare Workers AI Model Configurations
export const TRANSCRIPTION_MODEL = process.env.CLOUDFLARE_STT_MODEL || '@cf/openai/whisper';
export const EVALUATION_MODEL = process.env.CLOUDFLARE_LLM_MODEL || '@cf/meta/llama-3.1-8b-instruct';

const SYSTEM_INSTRUCTION = `You are an expert interview-practice evaluator specializing in university admission, credibility, and CAS-style interviews.
Your task is to evaluate the candidate's spoken response transcript against the interview question and expected reference answer.

CRITICAL RULES:
1. The reference answer is a semantic reference guide, NOT a strict word-for-word script.
2. The candidate does NOT need to use the exact same vocabulary or sentence structure.
3. Reward accurate, natural paraphrasing that conveys the correct meaning.
4. For factual questions (e.g. name, date of birth, passport, tuition fees, course details), check factual correctness.
5. Memorization risk: Do NOT penalize factual alignment on short direct questions as "memorized". Flag memorization only if an open-ended question is delivered in an unnaturally robotic or recited manner.
6. Assess textual indicators for fluency and grammar from the spoken transcript, keeping in mind speech-to-text nuances.
7. Return ONLY valid structured JSON matching the requested schema without markdown fences or extraneous text.`;

interface CloudflareApiResponse<T = any> {
  success: boolean;
  errors?: Array<{ code: number; message: string }>;
  messages?: Array<string>;
  result: T;
}

function getCloudflareCredentials(): { accountId: string; apiToken: string } {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken || accountId.trim() === '' || apiToken.trim() === '') {
    throw new Error('CLOUDFLARE_NOT_CONFIGURED');
  }

  return { accountId: accountId.trim(), apiToken: apiToken.trim() };
}

/**
 * Executes a Cloudflare Workers AI REST request with exponential backoff for transient errors.
 */
async function callCloudflareAi<T = any>(
  model: string,
  payload: any,
  contentType: string = 'application/json'
): Promise<T> {
  const { accountId, apiToken } = getCloudflareCredentials();
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  const maxRetries = 3; // 1 initial request + up to 3 retries
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': contentType,
        },
        body: payload,
      });

      // Handle non-transient auth or config failures immediately
      if (response.status === 401 || response.status === 403) {
        console.error('[Testrolly Cloudflare AI] Authentication error (401/403). Invalid credentials.');
        throw new Error('CLOUDFLARE_AUTH_ERROR');
      }

      if (response.status === 404) {
        console.error(`[Testrolly Cloudflare AI] Model ${model} not found or URI invalid (404).`);
        throw new Error('CLOUDFLARE_MODEL_NOT_FOUND');
      }

      // Check for transient rate limit or server errors
      if (response.status === 429 || response.status === 408 || (response.status >= 500 && response.status <= 599)) {
        if (attempt < maxRetries) {
          const jitter = Math.random() * 500;
          const delayMs = Math.pow(2, attempt) * 1000 + jitter;
          console.warn(`[Testrolly Cloudflare AI] Transient status ${response.status} on attempt ${attempt + 1}. Retrying in ${Math.round(delayMs)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
      }

      const json = (await response.json()) as CloudflareApiResponse<T>;

      if (!json.success) {
        const errorMsg = json.errors?.[0]?.message || 'Unknown Cloudflare Workers AI error';
        console.error('[Testrolly Cloudflare AI] API error response:', errorMsg);

        // Check if error is transient
        if (attempt < maxRetries && (errorMsg.includes('rate limit') || errorMsg.includes('overloaded'))) {
          const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        throw new Error(`CLOUDFLARE_API_ERROR: ${errorMsg}`);
      }

      return json.result;
    } catch (err: any) {
      lastError = err;

      if (err?.message === 'CLOUDFLARE_AUTH_ERROR' || err?.message === 'CLOUDFLARE_MODEL_NOT_FOUND' || err?.message === 'CLOUDFLARE_NOT_CONFIGURED') {
        throw err;
      }

      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`[Testrolly Cloudflare AI] Network error on attempt ${attempt + 1}: ${err?.message || err}. Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Cloudflare Workers AI request failed after retries.');
}

/**
 * Transcribe candidate's audio recording using Cloudflare Speech-to-Text (Whisper).
 */
export async function transcribeAudioWithCloudflare(
  audioBuffer?: Buffer,
  audioMimeType?: string,
  transcriptFallback?: string
): Promise<string> {
  if (!audioBuffer || audioBuffer.length === 0) {
    if (transcriptFallback && transcriptFallback.trim().length > 0) {
      return transcriptFallback.trim();
    }
    throw new Error('INAUDIBLE_TRANSCRIPT');
  }

  console.log(`[Testrolly AI] Transcription started using model: ${TRANSCRIPTION_MODEL} (${(audioBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);

  try {
    const result = await callCloudflareAi<{ text?: string; vtt?: string; word_count?: number }>(
      TRANSCRIPTION_MODEL,
      audioBuffer,
      'application/octet-stream'
    );

    let transcript = (result?.text || '').trim();

    if (!transcript && transcriptFallback) {
      transcript = transcriptFallback.trim();
    }

    // Filter out common silent whisper hallucinations
    const low = transcript.toLowerCase();
    if (
      low === 'you' ||
      low === 'thank you.' ||
      low === 'thank you' ||
      low === 'thanks for watching!' ||
      low === 'bye.' ||
      low === 'subtitles by the amara.org community'
    ) {
      if (!transcriptFallback || transcriptFallback.trim() === '') {
        transcript = '';
      }
    }

    if (!transcript || transcript.length === 0) {
      console.warn('[Testrolly AI] Inaudible or empty speech transcript returned from Whisper.');
      throw new Error('INAUDIBLE_TRANSCRIPT');
    }

    const words = transcript.split(/\s+/).filter(Boolean).length;
    console.log(`[Testrolly AI] Transcription successful (${words} words): "${transcript.slice(0, 60)}..."`);
    return transcript;
  } catch (err: any) {
    if (err?.message === 'INAUDIBLE_TRANSCRIPT') {
      throw err;
    }
    if (transcriptFallback && transcriptFallback.trim().length > 0) {
      console.warn('[Testrolly AI] STT failed, using provided fallback transcript for testing.');
      return transcriptFallback.trim();
    }
    console.error('[Testrolly AI] Transcription error:', err?.message || err);
    throw err;
  }
}

/**
 * Deterministically counts common filler words in the transcript.
 */
function extractFillerWords(transcript: string): { count: number; words: { word: string; count: number }[] } {
  const fillers = ['um', 'uh', 'er', 'erm', 'like', 'you know', 'i mean', 'actually', 'basically', 'sort of', 'kind of'];
  const text = transcript.toLowerCase();
  const found: { [word: string]: number } = {};
  let totalCount = 0;

  for (const filler of fillers) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      found[filler] = matches.length;
      totalCount += matches.length;
    }
  }

  const words = Object.entries(found).map(([word, count]) => ({ word, count }));
  return { count: totalCount, words };
}

/**
 * Evaluates candidate's transcript against the question and expected answer using Cloudflare Text LLM.
 */
export async function evaluateTranscriptWithCloudflare(params: {
  question: string;
  expectedAnswer: string;
  transcript: string;
  durationSeconds: number;
}): Promise<InterviewFeedback> {
  const { question, expectedAnswer, transcript, durationSeconds } = params;

  console.log(`[Testrolly AI] Evaluation started using model: ${EVALUATION_MODEL}`);

  const userPrompt = `QUESTION:
${question}

REFERENCE ANSWER:
${expectedAnswer}

CANDIDATE SPOKEN TRANSCRIPT:
${transcript}

RECORDING DURATION:
${durationSeconds} seconds

TASK:
Evaluate the candidate's spoken response objectively and constructively.
Remember: The reference answer is a semantic guide, NOT a script. Accurate natural paraphrasing containing the correct meaning must score highly.

Return strictly valid JSON with this exact schema:
{
  "overallScore": number (0-100 integer),
  "status": "Good" | "Needs Improvement" | "Needs Practice",
  "scores": {
    "accuracy": number (0-100),
    "completeness": number (0-100),
    "relevance": number (0-100),
    "naturalness": number (0-100),
    "fluency": number (0-100),
    "grammar": number (0-100),
    "clarity": number (0-100)
  },
  "memorization": {
    "risk": number (0-100),
    "level": "Low" | "Moderate" | "High",
    "explanation": string
  },
  "strengths": string[] (2-3 bullet points referencing what was said),
  "improvements": string[] (2-3 actionable points referencing what was said),
  "missingPoints": string[] (key missing information if any),
  "overallFeedback": string (constructive paragraph referencing candidate response)
}`;

  const payload = JSON.stringify({
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 1500,
  });

  const result = await callCloudflareAi<any>(EVALUATION_MODEL, payload, 'application/json');

  let rawContent = '';
  if (result?.response) {
    rawContent = typeof result.response === 'string' ? result.response : JSON.stringify(result.response);
  } else if (result?.choices?.[0]?.message?.content) {
    rawContent = result.choices[0].message.content;
  } else if (typeof result === 'string') {
    rawContent = result;
  }

  if (!rawContent || rawContent.trim() === '') {
    throw new Error('Empty response received from Cloudflare evaluation model.');
  }

  // Parse JSON safely
  let parsed: any;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    const cleaned = rawContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      parsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } else {
      throw new Error('Failed to parse structured JSON from Cloudflare model output.');
    }
  }

  console.log(`[Testrolly AI] Evaluation successful. Overall score: ${parsed.overallScore || 'N/A'}`);
  return normalizeCloudflareFeedback(parsed, transcript, durationSeconds);
}

/**
 * Normalizes and validates feedback from Cloudflare Workers AI.
 */
function normalizeCloudflareFeedback(
  data: any,
  transcript: string,
  durationSeconds: number
): InterviewFeedback {
  const clamp = (val: any, fallback: number) => {
    const num = Math.round(Number(val));
    return isNaN(num) ? fallback : Math.max(0, Math.min(100, num));
  };

  const overallScore = clamp(data.overallScore, 75);

  let status: ScoreStatus = 'Good';
  if (overallScore < 50) {
    status = 'Needs Practice';
  } else if (overallScore < 70) {
    status = 'Needs Improvement';
  }

  const rawScores = data.scores || {};
  const scores = {
    accuracy: clamp(rawScores.accuracy, overallScore),
    completeness: clamp(rawScores.completeness, overallScore),
    relevance: clamp(rawScores.relevance, overallScore),
    naturalness: clamp(rawScores.naturalness, overallScore),
    fluency: clamp(rawScores.fluency, overallScore),
    grammar: clamp(rawScores.grammar, overallScore),
    clarity: clamp(rawScores.clarity, overallScore),
  };

  // Deterministic metrics calculation
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;

  let lengthStatus: 'Too Short' | 'Good Length' | 'Too Long' = 'Good Length';
  if (durationSeconds < 6 || wordCount < 8) {
    lengthStatus = 'Too Short';
  } else if (durationSeconds > 120 || wordCount > 250) {
    lengthStatus = 'Too Long';
  }

  const fillerData = extractFillerWords(transcript);

  const rawMem = data.memorization || {};
  const memRisk = clamp(rawMem.risk, 15);
  let memLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  if (memRisk >= 65) memLevel = 'High';
  else if (memRisk >= 35) memLevel = 'Moderate';

  return {
    overallScore,
    status,
    scores,
    answerLength: {
      status: lengthStatus,
      durationSeconds: Math.round(durationSeconds),
      wordCount,
    },
    fillerWords: fillerData,
    memorization: {
      risk: memRisk,
      level: rawMem.level || memLevel,
      explanation: String(rawMem.explanation || 'The response demonstrated natural vocabulary and conversational phrasing.'),
    },
    strengths:
      Array.isArray(data.strengths) && data.strengths.length > 0
        ? data.strengths.map(String)
        : ['Addressed the core requirement of the interview question clearly.'],
    improvements:
      Array.isArray(data.improvements) && data.improvements.length > 0
        ? data.improvements.map(String)
        : ['Consider adding an additional specific supporting detail or example.'],
    missingPoints: Array.isArray(data.missingPoints) ? data.missingPoints.map(String) : [],
    overallFeedback: String(
      data.overallFeedback || 'The candidate delivered a clear and relevant response to the interview question.'
    ),
    transcript,
  };
}

/**
 * Main orchestrator for Cloudflare Workers AI evaluation.
 */
export async function evaluateAnswerWithCloudflare(params: {
  question: string;
  expectedAnswer: string;
  durationSeconds: number;
  audioBuffer?: Buffer;
  audioMimeType?: string;
  transcriptFallback?: string;
}): Promise<InterviewFeedback> {
  // Step 1: Transcribe Audio
  const transcript = await transcribeAudioWithCloudflare(
    params.audioBuffer,
    params.audioMimeType,
    params.transcriptFallback
  );

  // Step 2: Evaluate Transcript
  const feedback = await evaluateTranscriptWithCloudflare({
    question: params.question,
    expectedAnswer: params.expectedAnswer,
    transcript,
    durationSeconds: params.durationSeconds,
  });

  return feedback;
}
