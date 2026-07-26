import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.ts';

const ALLOWED_ROLES_ARRAY = ['user', 'admin'] as const;

function parseTokenFromHeader(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h || typeof h !== 'string') return null;
  const [scheme, token] = h.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  if (token.length > 5000) return null;
  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = parseTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      complete: false,
    }) as { id?: string; role?: unknown };

    if (!decoded.id || typeof decoded.id !== 'string') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const role = ALLOWED_ROLES_ARRAY.includes(decoded.role as any)
      ? (decoded.role as 'user' | 'admin')
      : 'user';
    req.user = { id: decoded.id, role };
    next();
  } catch (_e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ error: 'Forbidden: admin permissions required' });
  }
  next();
}
