import type { Request, Response, NextFunction } from 'express';
import { AUTH_COOKIE, verifyAuthToken } from '../utils/authTokens.js';

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1] || null;
}

export function extractAuthToken(req: Request): string | null {
  return req.cookies?.[AUTH_COOKIE] || extractBearerToken(req);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractAuthToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = verifyAuthToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !['admin', 'agent'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }
  next();
}
