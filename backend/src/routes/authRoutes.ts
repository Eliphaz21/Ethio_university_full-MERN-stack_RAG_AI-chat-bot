import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { JWT_SECRET } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === 'eliphazyab@gmail.com' ? 'admin' : 'user';

    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        institution: user.institution || '',
        department: user.department || '',
        bio: user.bio || '',
        academicTitle: user.academicTitle || '',
        avatarUrl: user.avatarUrl || ''
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/profile - Fetch current logged-in user profile
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: {
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
        createdAt: user.createdAt
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile - Update current user profile details
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
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
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        institution: user.institution || '',
        department: user.department || '',
        bio: user.bio || '',
        academicTitle: user.academicTitle || '',
        avatarUrl: user.avatarUrl || ''
      }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
