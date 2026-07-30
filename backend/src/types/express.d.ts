import type { JwtPayload } from 'jsonwebtoken';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: 'user' | 'agent' | 'admin';
    };
  }
}
