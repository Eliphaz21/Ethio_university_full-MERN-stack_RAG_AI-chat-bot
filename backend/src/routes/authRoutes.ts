import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.js';
import { ADMIN_EMAILS } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import {
  signAuthToken,
  setAuthCookies,
  clearAuthCookies,
  createCsrfToken,
} from '../utils/authTokens.js';

const router = Router();

function serializeUser(user: InstanceType<typeof User>) {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    institution: user.institution || '',
    department: user.department || '',
    bio: user.bio || '',
    academicTitle: user.academicTitle || '',
    avatarUrl: user.avatarUrl || '',
    createdAt: user.createdAt,
  };
}

function resolveRoleForEmail(email: string): 'user' | 'admin' {
  return ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedUsername || !normalizedEmail || typeof password !== 'string') {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const role = resolveRoleForEmail(normalizedEmail);

    const user = new User({ username: normalizedUsername, email: normalizedEmail, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login — issues httpOnly session cookie (token never returned to JS)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signAuthToken({ id: String(user._id), role: user.role });
    const csrfToken = createCsrfToken();
    setAuthCookies(res, token, csrfToken);

    res.json({ user: serializeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout — clears session cookies
router.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/session — restore session from httpOnly cookie
router.get('/session', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Session expired' });
    }
    res.json({ user: serializeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/profile - Fetch current logged-in user profile
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: serializeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile - Update current user profile details
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { username, phone, institution, department, bio, academicTitle, avatarUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) user.username = username.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (institution !== undefined) user.institution = institution.trim();
    if (department !== undefined) user.department = department.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (academicTitle !== undefined) user.academicTitle = academicTitle.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl.trim();

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: serializeUser(user),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
