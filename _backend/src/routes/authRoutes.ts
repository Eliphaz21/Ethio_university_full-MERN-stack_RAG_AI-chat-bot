import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.ts';
import { JWT_SECRET, isAdminEmail, IS_PROD } from '../config/env.ts';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[A-Za-z0-9 _-]{2,50}$/;

function validateRegistration(
  username: unknown,
  email: unknown,
  password: unknown
): string | null {
  if (!username || typeof username !== 'string') return 'Username is required';
  if (!USERNAME_REGEX.test(username))
    return 'Username must be 2-50 chars (letters, numbers, space, _, -)';
  if (!email || typeof email !== 'string') return 'Email is required';
  if (email.length > 254 || !EMAIL_REGEX.test(email)) return 'Invalid email format';
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password is too long (max 128)';
  return null;
}

function sanitizeEmail(e: string): string {
  return String(e).trim().toLowerCase();
}

// Simple in-memory rate limiter (auth endpoints only — restarts on dev server restart)
type Hit = { count: number; resetAt: number };
const _rl: Map<string, Hit> = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of _rl) if (v.resetAt <= now) _rl.delete(k);
}, 60_000).unref?.();
function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  let h = _rl.get(key);
  if (!h || h.resetAt <= now) {
    h = { count: 0, resetAt: now + windowMs };
    _rl.set(key, h);
  }
  h.count++;
  return h.count > max;
}

const BCRYPT_ROUNDS = IS_PROD ? 12 : 10;

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const regRl = rateLimit('reg:' + (req.ip || 'anon'), 10, 10 * 60_000);
    if (regRl) {
      return res
        .status(429)
        .json({ error: 'Too many registration attempts. Try again later.' });
    }

    const { username, email, password } = req.body || {};

    const validationError = validateRegistration(username, email, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const cleanEmail = sanitizeEmail(email as string);

    const existing = await User.findOne({ email: cleanEmail }).select('_id').lean();
    if (existing) {
      // Same message as "validation" to avoid email enumeration
      return res.status(400).json({ error: 'Registration failed. Please check details.' });
    }

    const hashedPassword = await bcrypt.hash(password as string, BCRYPT_ROUNDS);
    const role = isAdminEmail(cleanEmail) ? 'admin' : 'user';

    const user = new User({
      username: String(username).trim(),
      email: cleanEmail,
      password: hashedPassword,
      role,
    });
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      role,
      token: jwt.sign(
        { id: String(user._id), role: user.role },
        JWT_SECRET,
        { expiresIn: IS_PROD ? '12h' : '1d', algorithm: 'HS256' }
      ),
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role as 'user' | 'admin',
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const loginRl = rateLimit(
      'login:' + ((req.ip || 'anon') + ':' + String((req.body?.email || '')).toLowerCase()),
      8,
      15 * 60_000
    );
    if (loginRl) {
      return res
        .status(429)
        .json({ error: 'Too many login attempts. Try again later.' });
    }

    const { email, password } = req.body || {};
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (!EMAIL_REGEX.test(String(email).trim())) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const cleanEmail = sanitizeEmail(email as string);

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Enforce constant-time-ish compare: hash a dummy password so the
      // response time is identical whether the email exists or not.
      await bcrypt.compare(password, '$2a$10$CwTycUXWue0Thq9StjUM0uJ8/K5vYb1j1F7dGQO0hVQ5G0Q0r0u1W');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const pwOk = await bcrypt.compare(password, user.password);
    if (!pwOk) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: String(user._id), role: user.role },
      JWT_SECRET,
      { expiresIn: IS_PROD ? '12h' : '1d', algorithm: 'HS256' }
    );

    res.json({
      token,
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role as 'user' | 'admin',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

export default router;
