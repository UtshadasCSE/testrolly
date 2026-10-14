import { isAuthenticated } from '../server/auth.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const authed = isAuthenticated(req);
  return res.status(200).json({
    authenticated: authed,
  });
}
