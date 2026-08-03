import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { PORT } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import universityRoutes from './routes/universityRoutes.js';
import seoRoutes from './routes/seoRoutes.js';

const app = express();

app.use(cors());
// Allow large pasted text/PDF content (e.g. 2MB) for knowledge uploads
app.use(express.json({ limit: '2mb' }));

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', universityRoutes);
app.use('/', seoRoutes);

// Register all routes and start listening before the remote database handshake.
// This keeps health/auth responses available during transient MongoDB DNS outages.
async function start() {
  const knowledgeRoutes = (await import('./routes/knowledgeRoutes.js')).default;
  const chatRoutes = (await import('./routes/chatRoutes.js')).default;
  app.use('/api/admin', knowledgeRoutes);
  app.use('/api', chatRoutes);

  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });

  try {
    await connectDB();
  } catch (error) {
    console.warn('⚠️  Database initialization failed:', error);
  }
}

start().catch((err) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env`);
  } else {
    console.error('Start failed:', err);
  }
  process.exit(1);
});
