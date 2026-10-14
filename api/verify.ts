import {
  verifyCredentials,
  createSessionToken,
  createSessionCookie,
  checkRateLimit,
  recordFailedVerification,
  resetVerificationRateLimit,
  getClientIp,
  isRequestSecure,
} from '../server/auth.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are supported.',
    });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many verification attempts. Please wait a few minutes before trying again.',
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
  }

  const body = req.body || {};
  let university = body.university;
  let course = body.course;

  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      university = parsed.university;
      course = parsed.course;
    } catch {
      // ignore
    }
  }

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

  return res.status(200).json({
    success: true,
    message: 'Verification successful. Welcome to Testrolly!',
  });
}
