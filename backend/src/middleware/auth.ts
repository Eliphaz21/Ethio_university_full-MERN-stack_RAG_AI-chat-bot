import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.js';
import { AUTH_COOKIE, verifyAuthToken } from '../utils/authTokens.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'user' | 'agent' | 'admin' };
    }
  }
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1] || null;
}

export function extractAuthToken(req: Request): string | null {
  return req.cookies?.[AUTH_COOKIE] || extractBearerToken(req);
}

/** Verify JWT and refresh role from database (prevents stale privilege escalation). */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractAuthToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = verifyAuthToken(token);
    const user = await User.findById(decoded.id).select('role');
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.user = {
      id: String(user._id),
      role: user.role as 'user' | 'agent' | 'admin',
    };
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

/** Ensure authenticated users can only access their own resource IDs. */
export function requireSelf(paramName = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestedId = String(req.params[paramName] || '');
    if (!req.user?.id || requestedId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}
