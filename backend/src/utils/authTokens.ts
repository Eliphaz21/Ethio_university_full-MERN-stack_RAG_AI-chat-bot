import type { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET, IS_PRODUCTION, COOKIE_SECURE, COOKIE_DOMAIN } from '../config/env.js';

export const AUTH_COOKIE = 'ethiouni_token';
export const CSRF_COOKIE = 'ethiouni_csrf';
export const CSRF_HEADER = 'x-csrf-token';
export const JWT_EXPIRY = '1d';

const baseCookieOptions = (): CookieOptions => ({
  secure: COOKIE_SECURE,
  sameSite: 'lax',
  path: '/',
  ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
});

export function signAuthToken(payload: { id: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'ethiouni-portal',
    audience: 'ethiouni-users',
  });
}

export function verifyAuthToken(token: string): { id: string; role: 'user' | 'agent' | 'admin' } {
  const decoded = jwt.verify(token, JWT_SECRET, {
    issuer: 'ethiouni-portal',
    audience: 'ethiouni-users',
  }) as { id: string; role: 'user' | 'agent' | 'admin' };
  return decoded;
}

export function createCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function setAuthCookies(res: Response, token: string, csrfToken: string): void {
  res.cookie(AUTH_COOKIE, token, {
    ...baseCookieOptions(),
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie(CSRF_COOKIE, csrfToken, {
    ...baseCookieOptions(),
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  const options = baseCookieOptions();
  res.clearCookie(AUTH_COOKIE, options);
  res.clearCookie(CSRF_COOKIE, options);
}

/** Warn in development if the default secret is still in use. */
export function assertJwtSecretConfigured(): void {
  if (!JWT_SECRET || JWT_SECRET === 'secret') {
    const message = 'JWT_SECRET is missing or using the insecure default. Set a strong secret in backend/.env';
    if (IS_PRODUCTION) {
      throw new Error(message);
    }
    console.warn(`⚠️  ${message}`);
  }
}
