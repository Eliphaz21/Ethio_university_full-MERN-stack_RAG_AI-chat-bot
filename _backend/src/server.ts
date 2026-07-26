import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.ts';
import { PORT, IS_PROD } from './config/env.ts';
import authRoutes from './routes/authRoutes.ts';
import adminRoutes from './routes/adminRoutes.ts';
import { requireAuth } from './middleware/auth.ts';

const app = express();

// ── Security headers (Helmet.js-style manual; no extra dependency needed) ──
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()'
  );
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Strict-Transport-Security',
    IS_PROD ? 'max-age=31536000; includeSubDomains' : 'max-age=0'
  );
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: https:",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https:",
      "font-src 'self' data: https:",
    ].join('; ')
  );
  next();
});

// ── CORS: restrict to Vite dev origin in dev; configurable in prod ──
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : IS_PROD
  ? [] // explicitly allow empty list in prod = set your CORS_ORIGIN env
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl / postman
      if (CORS_ORIGIN.length === 0) {
        // Configurable: you locked down, no explicit list
        return cb(null, true);
      }
      if (CORS_ORIGIN.includes(origin)) return cb(null, true);
      cb(new Error('CORS blocked: origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 60 * 60,
  })
);

// Allow large pasted text/PDF content (e.g. 2MB) for knowledge uploads
app.use(express.json({ limit: '2mb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '256kb' }));

// Basic rate limiter for ALL global routes (IP-based, in-memory) — stops
// casual scraping. For production, put behind a real limiter (Redis / Nginx).
type RlHit = { count: number; resetAt: number };
const globalRl: Map<string, RlHit> = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of globalRl) if (v.resetAt <= now) globalRl.delete(k);
}, 60_000).unref?.();
app.use((req, res, next) => {
  const key = 'g:' + (req.ip || 'anon');
  const now = Date.now();
  let h = globalRl.get(key);
  if (!h || h.resetAt <= now) h = { count: 0, resetAt: now + 60_000 };
  h.count++;
  globalRl.set(key, h);
  if (h.count > 600) {
    // 600 req / min / IP — generous for real usage, blocks floods
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
});

// Global error handler (never leak stack trace to client)
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err && String(err.message).toLowerCase().startsWith('cors blocked')) {
      return res.status(403).json({ error: 'CORS blocked' });
    }
    if (err && err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Payload too large' });
    }
    if (err && err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    if (IS_PROD) {
      console.error('SERVER ERROR:', err?.stack || err?.message || err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.error('SERVER ERROR:', err?.stack || err?.message || err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
);

// ── Routes ──
app.use('/api/auth', authRoutes);

// All /api/admin routes require auth first, then admin-role middleware
// is applied per-route in adminRoutes / knowledgeRoutes.
app.use('/api/admin', requireAuth, adminRoutes);

// Load route modules after DB connect to avoid startup crash from voyage/multer
async function start() {
  await connectDB();

  const knowledgeRoutes = (await import('./routes/knowledgeRoutes.ts')).default;
  const chatRoutes = (await import('./routes/chatRoutes.ts')).default;
  // requireAuth is mounted at /api/admin already above; knowledge routes
  // additionally use requireAdmin for their write endpoints.
  app.use('/api/admin', knowledgeRoutes);
  app.use('/api', chatRoutes);

  // 404 JSON fallback
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT} (${IS_PROD ? 'PRODUCTION' : 'development'})`);
  });
}

start().catch((err) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env`);
  } else {
    console.error('Start failed:', err);
  }
  process.exit(1);
});
