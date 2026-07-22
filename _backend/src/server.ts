import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.ts';
import { PORT } from './config/env.ts';
import authRoutes from './routes/authRoutes.ts';
import adminRoutes from './routes/adminRoutes.ts';

const app = express();

app.use(cors());
// Allow large pasted text/PDF content (e.g. 2MB) for knowledge uploads
app.use(express.json({ limit: '2mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Load route modules after DB connect to avoid startup crash from voyage/multer
async function start() {
  await connectDB();

  const knowledgeRoutes = (await import('./routes/knowledgeRoutes.ts')).default;
  const chatRoutes = (await import('./routes/chatRoutes.ts')).default;
  app.use('/api/admin', knowledgeRoutes);
  app.use('/api', chatRoutes);

  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
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