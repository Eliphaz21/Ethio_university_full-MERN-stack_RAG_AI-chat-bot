// @ts-nocheck

import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI || '';
export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';