import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { csrfProtection } from '../middleware/csrf.js';
import { applySecurityHeaders } from '../middleware/security.js';
import { secureErrorHandler } from '../middleware/errorHandler.js';
import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import universityRoutes from '../routes/universityRoutes.js';
import eventRoutes from '../routes/eventRoutes.js';
import seoRoutes from '../routes/seoRoutes.js';
import knowledgeRoutes from '../routes/knowledgeRoutes.js';
import chatRoutes from '../routes/chatRoutes.js';
import { signAuthToken, createCsrfToken } from '../utils/authTokens.js';

export function createTestApp() {
  const app = express();
  app.set('trust proxy', 1);
  applySecurityHeaders(app);

  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(csrfProtection);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/admin', knowledgeRoutes);
  app.use('/api', universityRoutes);
  app.use('/api', eventRoutes);
  app.use('/api', chatRoutes);
  app.use('/', seoRoutes);

  app.use(secureErrorHandler);

  return app;
}

export function generateTestAuth(user: { id: string; role: 'user' | 'agent' | 'admin' }) {
  const token = signAuthToken(user);
  const csrfToken = createCsrfToken();
  return {
    token,
    csrfToken,
    cookieHeader: `ethio_uni_session=${token}; ethio_uni_csrf=${csrfToken}`,
  };
}
