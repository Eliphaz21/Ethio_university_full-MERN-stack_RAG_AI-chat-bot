import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

const isLocal =
  MONGO_URI.startsWith('mongodb://127.0.0.1') ||
  MONGO_URI.startsWith('mongodb://localhost') ||
  MONGO_URI.includes('127.0.0.1') ||
  MONGO_URI.includes('localhost');

const baseOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: isLocal ? 5000 : 30000,
  connectTimeoutMS: isLocal ? 5000 : 30000,
  socketTimeoutMS: isLocal ? 15000 : 45000,
  family: 4,
  retryWrites: true,
  maxPoolSize: 10,
};

const mongooseOptions: mongoose.ConnectOptions = isLocal
  ? { ...baseOptions, directConnection: true }
  : baseOptions;

export async function connectDB() {
  if (!MONGO_URI) {
    console.error('[ERROR] MONGO_URI is not defined');
    process.exit(1);
  }

  const usesSrv = MONGO_URI.startsWith('mongodb+srv://');

  if (isLocal) {
    console.log('[INFO] Using LOCAL MongoDB at', MONGO_URI.split('?')[0]);
  } else {
    console.log('[INFO] Using REMOTE MongoDB');
  }

  let lastErr: any;
  const maxRetries = isLocal ? 1 : 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!isLocal) console.log(`[INFO] Connecting to MongoDB (attempt ${attempt}/${maxRetries})...`);
      await mongoose.connect(MONGO_URI, mongooseOptions);
      const host = mongoose.connection.host;
      const name = mongoose.connection.name;
      console.log(`[SUCCESS] Connected to MongoDB -> ${host} / db: ${name}`);
      return;
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || String(err);
      const isDnsIssue =
        err?.code === 'ESERVFAIL' ||
        err?.code === 'ENOTFOUND' ||
        msg.includes('querySrv') ||
        msg.includes('queryTxt') ||
        msg.includes('ENOTFOUND') ||
        msg.includes('getaddrinfo');
      const isLocalRefused =
        isLocal &&
        (msg.includes('ECONNREFUSED') ||
          msg.includes('connect ECONNREFUSED') ||
          msg.includes('timeout') ||
          msg.includes('Timed out'));

      if (attempt < maxRetries) {
        const waitSec = 3 * attempt;
        console.warn(`[WARN] Attempt ${attempt} failed: ${msg}`);
        if (isDnsIssue && usesSrv) {
          console.warn('[INFO] Tip: mongodb+srv:// requires DNS SRV lookup. See .env for alternative options.');
        }
        console.warn(`[INFO] Retrying in ${waitSec}s...\n`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }

      console.error('[ERROR] MongoDB connection error:', msg);
      console.error('');

      if (isLocalRefused) {
        console.error('--------------------------------------------------');
        console.error('  Local MongoDB is NOT running on port 27017.');
        console.error('--------------------------------------------------');
        console.error('  Fix (pick one):');
        console.error('  1. Install + start MongoDB Community Server:');
        console.error('     https://www.mongodb.com/try/download/community');
        console.error('     • Windows installer: choose "Run as Service"');
        console.error('');
        console.error('  2. Or start existing MongoDB manually:');
        console.error('     & "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe"');
        console.error('');
        console.error('  3. Or use Atlas instead (see OPTION B in .env).');
        console.error('--------------------------------------------------');
      } else if (isDnsIssue) {
        console.error('--------------------------------------------------');
        console.error('  This is a DNS / network issue with mongodb+srv://');
        console.error('--------------------------------------------------');
        console.error('  Fix 1: Change Windows DNS to 8.8.8.8 / 1.1.1.1');
        console.error('         then restart terminal / PC.');
        console.error('');
        console.error('  Fix 2: Disable VPN / proxy.');
        console.error('');
        console.error('  Fix 3: Use LOCAL MongoDB (OPTION A in .env) —');
        console.error('         no internet needed, works every time.');
        console.error('');
        console.error('  Fix 4: Get a FRESH Atlas URI (old one is DEAD):');
        console.error('         Atlas → Connect → Drivers → copy new URI,');
        console.error('         paste as OPTION B in .env.');
        console.error('--------------------------------------------------');
      } else if (usesSrv) {
        console.error('[INFO] Hint: If Atlas cluster is paused -> resume it at cloud.mongodb.com');
        console.error('         Or switch to local MongoDB (OPTION A in .env).');
      }
      process.exit(1);
    }
  }
}
