import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { PORT, CORS_ORIGINS } from './config/env.js';
import { csrfProtection } from './middleware/csrf.js';
import { applySecurityHeaders, apiRateLimiter, authRateLimiter } from './middleware/security.js';
import { secureErrorHandler } from './middleware/errorHandler.js';
import { assertJwtSecretConfigured } from './utils/authTokens.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import universityRoutes from './routes/universityRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import seoRoutes from './routes/seoRoutes.js';

assertJwtSecretConfigured();

const app = express();
app.set('trust proxy', 1);

applySecurityHeaders(app);

app.use(cors({
  origin(origin, callback) {
    if (!origin || CORS_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(apiRateLimiter);
app.use(csrfProtection);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', universityRoutes);
app.use('/api', eventRoutes);
app.use('/', seoRoutes);

async function start() {
  const knowledgeRoutes = (await import('./routes/knowledgeRoutes.js')).default;
  const chatRoutes = (await import('./routes/chatRoutes.js')).default;
  app.use('/api/admin', knowledgeRoutes);
  app.use('/api', chatRoutes);
  app.use(secureErrorHandler);

  app.listen(PORT, () => {
    console.log(`[INFO] Server running on port ${PORT}`);
  });

  try {
    await connectDB();
    const { seedDatabaseIfEmpty } = await import('./config/seed.js');
    await seedDatabaseIfEmpty();
  } catch (error) {
    console.warn('[WARN] Database initialization failed:', error);
  }
}

start().catch((err) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`[ERROR] Port ${PORT} is already in use. Stop the other process or set PORT in .env`);
  } else {
    console.error('[ERROR] Start failed:', err);
  }
  process.exit(1);
});
