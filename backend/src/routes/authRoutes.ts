import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { User } from '../models/user.js';
import { ADMIN_EMAILS } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import {
  signAuthToken,
  setAuthCookies,
  clearAuthCookies,
  createCsrfToken,
} from '../utils/authTokens.js';
import { sanitizeText, validatePassword } from '../middleware/errorHandler.js';
import { recordAudit } from '../services/audit.js';
import { uploadBufferToCloudinary, isCloudinaryConfigured } from '../services/cloudinary.js';

const router = Router();

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed for avatar!'));
    }
  },
});

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
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const role = resolveRoleForEmail(normalizedEmail);

    const user = new User({ username: normalizedUsername, email: normalizedEmail, password: hashedPassword, role });
    await user.save();

    await recordAudit(req, {
      action: 'auth.register',
      resourceType: 'user',
      resourceId: String(user._id),
      resourceLabel: user.email,
      status: 'success',
    });

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
      await recordAudit(req, {
        action: 'auth.login',
        resourceType: 'user',
        resourceLabel: normalizedEmail,
        status: 'failure',
        details: { reason: 'Invalid credentials' },
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signAuthToken({ id: String(user._id), role: user.role });
    const csrfToken = createCsrfToken();
    setAuthCookies(res, token, csrfToken);

    await recordAudit(req, {
      action: 'auth.login',
      resourceType: 'user',
      resourceId: String(user._id),
      resourceLabel: user.email,
      status: 'success',
    });

    res.json({ user: serializeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout — clears session cookies
router.post('/logout', async (req: Request, res: Response) => {
  await recordAudit(req, {
    action: 'auth.logout',
    resourceType: 'user',
    resourceId: req.user?.id,
    status: 'success',
  });
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

    if (username) user.username = sanitizeText(username, 80);
    if (phone !== undefined) user.phone = sanitizeText(phone, 30);
    if (institution !== undefined) user.institution = sanitizeText(institution, 120);
    if (department !== undefined) user.department = sanitizeText(department, 120);
    if (bio !== undefined) user.bio = sanitizeText(bio, 1000);
    if (academicTitle !== undefined) user.academicTitle = sanitizeText(academicTitle, 120);
    if (avatarUrl !== undefined) {
      const safeUrl = sanitizeText(avatarUrl, 500);
      if (safeUrl && !/^https?:\/\//i.test(safeUrl)) {
        return res.status(400).json({ error: 'Avatar URL must use http or https' });
      }
      user.avatarUrl = safeUrl;
    }

    await user.save();

    await recordAudit(req, {
      action: 'auth.profile_update',
      resourceType: 'user',
      resourceId: String(user._id),
      resourceLabel: user.email,
      status: 'success',
    });

    res.json({
      message: 'Profile updated successfully',
      user: serializeUser(user),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/upload-avatar - Upload profile avatar image to Cloudinary or base64
router.post('/upload-avatar', requireAuth, avatarUpload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    let avatarUrl = '';
    if (isCloudinaryConfigured()) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'ethio_university_avatars');
      avatarUrl = result.secure_url;
    } else {
      const base64 = req.file.buffer.toString('base64');
      avatarUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Avatar upload failed' });
  }
});

export default router;
