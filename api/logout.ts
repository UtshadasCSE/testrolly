import {
  parseCookies,
  revokeToken,
  clearSessionCookie,
  isRequestSecure,
} from '../server/auth.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  const cookies = parseCookies(req.headers?.cookie);
  if (cookies.testrolly_session) {
    revokeToken(cookies.testrolly_session);
  }

  const secure = isRequestSecure(req);
  res.setHeader('Set-Cookie', clearSessionCookie(secure));

  return res.status(200).json({
    success: true,
    message: 'Session ended successfully.',
  });
}
