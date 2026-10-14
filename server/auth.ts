import crypto from 'crypto';
import type { IncomingMessage } from 'http';

// Configured credentials - kept strictly on the server
export const CONFIGURED_UNIVERSITY = process.env.VERIFIED_UNIVERSITY || 'Bangor University';
export const CONFIGURED_COURSE = process.env.VERIFIED_COURSE || 'MSc Advanced Data Science';

const SESSION_SECRET = process.env.SESSION_SECRET || 'testrolly-university-verification-secret-2025-secure';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionData {
  iat: number;
  exp: number;
  uni: string;
  course: string;
  nonce: string;
}

/**
 * Normalizes university name:
 * - Trims leading & trailing whitespace
 * - Normalizes multiple spaces into a single space
 * - Case-insensitive (lowercase)
 */
export function normalizeUniversity(input?: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Normalizes course name:
 * - Trims leading & trailing whitespace
 * - Normalizes multiple spaces into a single space
 * - Treats "M.Sc" / "M.Sc." as equivalent to "MSc"
 * - Case-insensitive (lowercase)
 */
export function normalizeCourse(input?: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/\./g, '') // Normalizes M.Sc and M.Sc. to MSc
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Validates entered credentials against server-side target values.
 */
export function verifyCredentials(university?: string, course?: string): boolean {
  if (!university || !course) return false;
  const normUni = normalizeUniversity(university);
  const normCourse = normalizeCourse(course);

  const targetUni = normalizeUniversity(CONFIGURED_UNIVERSITY);
  const targetCourse = normalizeCourse(CONFIGURED_COURSE);

  return normUni === targetUni && normCourse === targetCourse;
}

// In-memory revoked tokens set (for logout / "Lock App")
const revokedTokens = new Set<string>();

export function revokeToken(token?: string): void {
  if (token) {
    revokedTokens.add(token);
  }
}

/**
 * Creates an HMAC-signed session token containing expiry timestamp.
 */
export function createSessionToken(university: string, course: string): string {
  const now = Date.now();
  const sessionData: SessionData = {
    iat: now,
    exp: now + SESSION_DURATION_MS,
    uni: CONFIGURED_UNIVERSITY,
    course: CONFIGURED_COURSE,
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  const payload = Buffer.from(JSON.stringify(sessionData)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

/**
 * Verifies and parses a signed session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token?: string): SessionData | null {
  if (!token || typeof token !== 'string') return null;
  if (revokedTokens.has(token)) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');

    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      return null;
    }

    const data: SessionData = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!data.exp || data.exp < Date.now()) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Parses HTTP Cookie header into key-value map.
 */
export function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx !== -1) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      if (key) {
        cookies[key] = decodeURIComponent(val);
      }
    }
  }
  return cookies;
}

/**
 * Creates Set-Cookie header for session token.
 */
export function createSessionCookie(token: string, isSecure = false): string {
  const parts = [
    `testrolly_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_DURATION_MS / 1000)}`,
  ];
  if (isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/**
 * Creates Set-Cookie header to clear session cookie.
 */
export function clearSessionCookie(isSecure = false): string {
  const parts = [
    'testrolly_session=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ];
  if (isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

// In-memory rate limiting for verification attempts
interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_VERIFICATION_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) return { allowed: true };

  if (now > entry.resetAt) {
    rateLimitMap.delete(ip);
    return { allowed: true };
  }

  if (entry.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

export function recordFailedVerification(ip: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { attempts: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.attempts += 1;
  }
}

export function resetVerificationRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

/**
 * Extracts client IP safely from request headers or socket.
 */
export function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
}

/**
 * Checks if request is over HTTPS or secure protocol.
 */
export function isRequestSecure(req: any): boolean {
  if (req.headers?.['x-forwarded-proto'] === 'https') return true;
  if (req.secure) return true;
  const host = req.headers?.host || '';
  if (process.env.NODE_ENV === 'production' && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    return true;
  }
  return false;
}

/**
 * Checks if an incoming request has a valid authenticated session.
 */
export function isAuthenticated(req: IncomingMessage | any): boolean {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return false;
  const cookies = parseCookies(cookieHeader);
  const token = cookies.testrolly_session;
  if (!token) return false;
  const session = verifySessionToken(token);
  return session !== null;
}
