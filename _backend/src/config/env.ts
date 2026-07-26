// @ts-nocheck

import dotenv from 'dotenv';

dotenv.config();

function isProd() {
  return process.env.NODE_ENV === 'production';
}

function panicIfMissingProd(name: string, raw: string | undefined): string {
  if (!raw && isProd()) {
    console.error(`\n⛔ FATAL (production): ${name} environment variable is NOT set.`);
    console.error(`   Add ${name}=... to your backend .env file.\n`);
    process.exit(1);
  }
  return raw ?? '';
}

function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PROD = isProd();

export const PORT = parseInt(process.env.PORT || '5001', 10) || 5001;

export const MONGO_URI = panicIfMissingProd('MONGO_URI', process.env.MONGO_URI);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  if (IS_PROD) {
    console.error(
      '\n⛔ FATAL (production): JWT_SECRET is missing or too short (<32 chars).'
    );
    console.error(
      '   Generate with:  node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\n'
    );
    process.exit(1);
  } else if (!process.env.JWT_SECRET) {
    console.warn(
      '\n⚠️  WARNING: JWT_SECRET is NOT set — using a throwaway dev secret.\n' +
        '   Add JWT_SECRET=<64 random hex chars> to _backend/.env before production.\n' +
        '   Generate with:  node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\n'
    );
  }
}

export const JWT_SECRET = process.env.JWT_SECRET || (
  IS_PROD
    ? (() => { throw new Error('JWT_SECRET required in production'); })()
    : 'ethiou-dev-secret-replace-me-' + Math.random().toString(36).slice(2)
);

export const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (IS_PROD && (!VOYAGE_API_KEY || !GEMINI_API_KEY)) {
  console.warn(
    '\n⚠️  PRODUCTION warning: VOYAGE_API_KEY and/or GEMINI_API_KEY are not set.\n' +
      '   Local fallback embeddings will be used — answer quality may be reduced.\n'
  );
}

export const ADMIN_EMAILS: string[] = parseAdminEmails(process.env.ADMIN_EMAILS);

if (ADMIN_EMAILS.length === 0) {
  console.warn(
    '\n⚠️  WARNING: ADMIN_EMAILS is NOT set in _backend/.env.\n' +
      '   NO users will become admin on registration until you set:\n' +
      '   ADMIN_EMAILS=your@email.com\n'
  );
} else {
  console.log(
    `🔐 Admin auto-granted for: ${ADMIN_EMAILS.map(e =>
      e.replace(/^(.{2})(.*)@(.*)$/, (_, a, b, c) => a + '*'.repeat(b.length) + '@' + c)
    ).join(', ')}`
  );
}

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  const norm = String(email).trim().toLowerCase();
  return ADMIN_EMAILS.includes(norm);
}
