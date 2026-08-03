import type { Request, Response, NextFunction } from 'express';
import { IS_PRODUCTION } from '../config/env.js';

/** OWASP A05 — Avoid leaking stack traces and internal errors in production. */
export function secureErrorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) return;

  const status = (err as any)?.status || (err as any)?.statusCode || 500;
  const safeStatus = status >= 400 && status < 600 ? status : 500;

  if (!IS_PRODUCTION) {
    console.error('API error:', err);
  } else {
    console.error('API error:', (err as Error)?.message || 'Unknown error');
  }

  if (safeStatus === 403 && (err as Error)?.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  const message = safeStatus >= 500 && IS_PRODUCTION
    ? 'An unexpected error occurred.'
    : ((err as Error)?.message || 'Request failed');

  res.status(safeStatus).json({ error: message });
}

/** Catch unhandled async errors in route handlers. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

/** Strip dangerous characters and enforce length limits on user-provided text fields. */
export function sanitizeText(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password is too long';
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include at least one letter and one number';
  }
  return null;
}
