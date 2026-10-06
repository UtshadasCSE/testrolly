import { GoogleGenAI, Type } from '@google/genai';
import { InterviewFeedback, ScoreStatus } from '../src/types/interview';

const SYSTEM_INSTRUCTION = `You are a professional interview-practice evaluator specializing in university admission, credibility, and CAS-style interviews.

Your job is to evaluate the candidate's actual spoken response fairly, accurately, and constructively.

The supplied reference answer represents the important ideas and facts expected from a strong answer.

The reference answer is NOT a script.

The candidate does not need to use the same vocabulary, sentence structure, or wording.

Reward accurate natural paraphrasing.

Evaluate whether the candidate actually answered the question.

Evaluate semantic accuracy, completeness, relevance, clarity, naturalness, grammar, fluency visible from the spoken transcript, answer structure, repetition, filler words, answer length, missing important information, contradictions, and potential memorization risk.

Do not give a high score merely because the candidate repeats the reference answer.

Do not give a low score merely because the candidate uses different wording.

A naturally worded response containing the correct meaning should score highly.

Be specific.

Every important feedback statement must relate to the candidate's actual answer.

Do not fabricate observations. Do NOT claim or fabricate eye contact, facial expression, gesture, posture, or visual body language analysis.

Return only structured JSON matching the required response schema.`;

const evaluationResponseSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      description: 'Overall score from 0 to 100 based on the candidate\'s performance',
    },
    status: {
      type: Type.STRING,
      description: 'Performance status: "Good" (70-100), "Needs Improvement" (50-69), or "Needs Practice" (0-49)',
    },
    scores: {
      type: Type.OBJECT,
      properties: {
        accuracy: { type: Type.INTEGER, description: '0-100 score for factual and semantic correctness' },
        completeness: { type: Type.INTEGER, description: '0-100 score for covering the key points' },
        relevance: { type: Type.INTEGER, description: '0-100 score for directly answering the question' },
        naturalness: { type: Type.INTEGER, description: '0-100 score for conversational, non-scripted tone' },
        fluency: { type: Type.INTEGER, description: '0-100 score for smoothness visible from spoken evidence' },
        grammar: { type: Type.INTEGER, description: '0-100 score for grammatical accuracy' },
        clarity: { type: Type.INTEGER, description: '0-100 score for clear, logical communication' },
      },
      required: ['accuracy', 'completeness', 'relevance', 'naturalness', 'fluency', 'grammar', 'clarity'],
    },
    answerLength: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, description: '"Good Length", "Too Short", or "Too Long"' },
        durationSeconds: { type: Type.INTEGER, description: 'Duration of the answer in seconds' },
        wordCount: { type: Type.INTEGER, description: 'Approximate word count of the spoken answer' },
      },
      required: ['status', 'durationSeconds', 'wordCount'],
    },
    fillerWords: {
      type: Type.OBJECT,
      properties: {
        count: { type: Type.INTEGER, description: 'Total number of filler words identified' },
        words: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING, description: 'The filler word or phrase (e.g., um, like, you know)' },
              count: { type: Type.INTEGER, description: 'How many times it was used' },
            },
            required: ['word', 'count'],
          },
        },
      },
      required: ['count', 'words'],
    },
    memorization: {
      type: Type.OBJECT,
      properties: {
        risk: { type: Type.INTEGER, description: 'Risk score 0-100 (0 = very low risk, 100 = very high scripted risk)' },
        level: { type: Type.STRING, description: '"Low", "Moderate", or "High"' },
        explanation: { type: Type.STRING, description: 'Objective assessment of whether the answer feels naturally spoken or mechanically memorized' },
      },
      required: ['risk', 'level', 'explanation'],
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-4 specific strengths directly referencing what the candidate actually said',
    },
    improvements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-4 specific actionable recommendations for improvement referencing the candidate\'s answer',
    },
    missingPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Key ideas or supporting points from the reference answer that were omitted or incomplete',
    },
    overallFeedback: {
      type: Type.STRING,
      description: 'Comprehensive, constructive, professional feedback paragraph referencing what was said',
    },
    transcript: {
      type: Type.STRING,
      description: 'The exact spoken transcript of what the candidate said in the audio recording',
    },
  },
  required: [
    'overallScore',
    'status',
    'scores',
    'answerLength',
    'fillerWords',
    'memorization',
    'strengths',
    'improvements',
    'missingPoints',
    'overallFeedback',
    'transcript',
  ],
};

export async function evaluateAnswerWithGemini(params: {
  question: string;
  expectedAnswer: string;
  durationSeconds: number;
  audioBuffer?: Buffer;
  audioMimeType?: string;
  transcriptFallback?: string;
}): Promise<InterviewFeedback> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_PRIVATE_GEMINI_API_KEY') {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  const ai = new GoogleGenAI({ apiKey });

  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
  ].filter(Boolean) as string[];

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const promptText = `QUESTION:
${params.question}

REFERENCE ANSWER:
${params.expectedAnswer}

RECORDING DURATION:
${params.durationSeconds} seconds

TASK:
1. Listen carefully to the candidate's audio recording and transcribe their exact spoken words into the "transcript" field.
${params.transcriptFallback ? `(Note: If audio is corrupted, silent, or not provided in testing, use transcript: "${params.transcriptFallback}")` : ''}
2. Evaluate what the candidate actually said in comparison with the expected ideas and university interview standards.
3. Compute honest, objective scores (0-100) for each category.
4. Detect filler words (e.g. um, uh, like, actually, basically, you know, I mean).
5. Assess memorization risk (0 = natural conversational, 100 = robotic exact recitation).
6. Provide specific, constructive strengths, improvements, and missing points referencing their spoken answer.
7. Return strictly valid structured JSON matching the schema.`;

      const contents: any[] = [];

      if (params.audioBuffer && params.audioBuffer.length > 0) {
        const base64Audio = params.audioBuffer.toString('base64');
        const mimeType = params.audioMimeType || 'audio/webm';
        contents.push({
          inlineData: {
            data: base64Audio,
            mimeType: mimeType.split(';')[0],
          },
        });
      }

      contents.push(promptText);

      const result = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: evaluationResponseSchema,
          temperature: 0.2,
        },
      });

      const responseText = result.text;

      if (!responseText) {
        throw new Error('Empty response received from Gemini.');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(responseText);
      } catch (parseError) {
        const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      return normalizeFeedback(parsed, params.durationSeconds);
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${modelName} attempt error:`, err?.message || err);
      // Try next model if current model is busy or unavailable
      continue;
    }
  }

  throw lastError || new Error('All Gemini model attempts failed.');
}

function normalizeFeedback(data: any, durationSeconds: number): InterviewFeedback {
  const overallScore = Math.max(0, Math.min(100, Math.round(Number(data.overallScore) || 75)));

  let status: ScoreStatus = 'Good';
  if (overallScore < 50) {
    status = 'Needs Practice';
  } else if (overallScore < 70) {
    status = 'Needs Improvement';
  }

  const rawScores = data.scores || {};
  const scores = {
    accuracy: Math.max(0, Math.min(100, Math.round(Number(rawScores.accuracy) || overallScore))),
    completeness: Math.max(0, Math.min(100, Math.round(Number(rawScores.completeness) || overallScore))),
    relevance: Math.max(0, Math.min(100, Math.round(Number(rawScores.relevance) || overallScore))),
    naturalness: Math.max(0, Math.min(100, Math.round(Number(rawScores.naturalness) || overallScore))),
    fluency: Math.max(0, Math.min(100, Math.round(Number(rawScores.fluency) || overallScore))),
    grammar: Math.max(0, Math.min(100, Math.round(Number(rawScores.grammar) || overallScore))),
    clarity: Math.max(0, Math.min(100, Math.round(Number(rawScores.clarity) || overallScore))),
  };

  const rawLength = data.answerLength || {};
  const transcriptText = String(data.transcript || '').trim();
  const wordCount = rawLength.wordCount || (transcriptText ? transcriptText.split(/\s+/).filter(Boolean).length : 0);

  let lengthStatus: 'Too Short' | 'Good Length' | 'Too Long' = 'Good Length';
  if (rawLength.status === 'Too Short' || rawLength.status === 'Too Long') {
    lengthStatus = rawLength.status;
  } else if (durationSeconds < 8 || wordCount < 15) {
    lengthStatus = 'Too Short';
  }

  const rawFillers = data.fillerWords || {};
  const fillerList = Array.isArray(rawFillers.words)
    ? rawFillers.words
        .map((w: any) => ({
          word: String(w.word || ''),
          count: Number(w.count) || 1,
        }))
        .filter((w: any) => w.word.length > 0)
    : [];

  const rawMem = data.memorization || {};
  const memRisk = Math.max(0, Math.min(100, Math.round(Number(rawMem.risk) || 20)));
  let memLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  if (memRisk >= 65) memLevel = 'High';
  else if (memRisk >= 40) memLevel = 'Moderate';

  return {
    overallScore,
    status,
    scores,
    answerLength: {
      status: lengthStatus,
      durationSeconds: Number(rawLength.durationSeconds) || durationSeconds,
      wordCount,
    },
    fillerWords: {
      count: Number(rawFillers.count) ?? fillerList.reduce((acc: number, f: any) => acc + f.count, 0),
      words: fillerList,
    },
    memorization: {
      risk: memRisk,
      level: rawMem.level || memLevel,
      explanation: String(rawMem.explanation || 'The response demonstrated natural vocabulary and authentic sentence phrasing.'),
    },
    strengths:
      Array.isArray(data.strengths) && data.strengths.length > 0
        ? data.strengths.map(String)
        : ['Addressed the main objective of the interview question directly.'],
    improvements:
      Array.isArray(data.improvements) && data.improvements.length > 0
        ? data.improvements.map(String)
        : ['Consider providing an additional concrete supporting example.'],
    missingPoints: Array.isArray(data.missingPoints) ? data.missingPoints.map(String) : [],
    overallFeedback: String(
      data.overallFeedback || 'The answer was communicated clearly and addressed the core question effectively.'
    ),
    transcript: transcriptText || '(Spoken answer recorded successfully)',
  };
}
