import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve from this package so startup works from the root or backend directory.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const PORT = Number(process.env.PORT) || 5001;
export const MONGO_URI = process.env.MONGO_URI || '';
export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true' || IS_PRODUCTION;
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '';

const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
export const CORS_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .concat(defaultOrigins)
  .filter((origin, index, all) => all.indexOf(origin) === index);

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
export const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || '';

