import type { Request, Response, NextFunction } from 'express';
import { CSRF_COOKIE, CSRF_HEADER } from '../utils/authTokens.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Paths that establish a session and issue fresh CSRF tokens themselves. */
const CSRF_EXEMPT_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
]);

/**
 * Double-submit cookie CSRF protection for cookie-based authentication.
 * Mutating requests must include X-CSRF-Token matching the non-httpOnly cookie.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  const requestPath = req.originalUrl.split('?')[0];
  if (CSRF_EXEMPT_PATHS.has(requestPath)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }

  next();
}
