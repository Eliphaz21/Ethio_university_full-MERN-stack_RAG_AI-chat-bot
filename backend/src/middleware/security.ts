import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';
import { IS_PRODUCTION } from '../config/env.js';

/** OWASP A05 — Security misconfiguration: standard HTTP hardening headers. */
export function applySecurityHeaders(app: Express): void {
  app.use(
    helmet({
      contentSecurityPolicy: IS_PRODUCTION
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
              imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
              connectSrc: ["'self'", 'https:'],
              frameSrc: ["'self'", 'https://www.google.com', 'https://www.youtube.com', 'https://player.vimeo.com'],
              objectSrc: ["'none'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.disable('x-powered-by');
}

const jsonError = (message: string) => ({ error: message });

/** OWASP A07 — Brute-force protection on authentication endpoints. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonError('Too many authentication attempts. Please try again later.'),
});

/** OWASP A04 — Rate limit AI chat to reduce abuse and cost exhaustion. */
export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonError('Too many chat requests. Please wait a moment and try again.'),
});

/** General API rate limit for all routes. */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonError('Too many requests. Please slow down.'),
});

/** Stricter limit for admin mutation endpoints. */
export const adminWriteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonError('Too many admin requests. Please try again later.'),
});
