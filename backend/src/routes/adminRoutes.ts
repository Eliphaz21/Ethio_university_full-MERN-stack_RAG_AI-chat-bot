import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { AuditLog } from '../models/auditLog.js';
import { recordAudit } from '../services/audit.js';

const router = Router();

const userFields = 'username email role phone institution department bio academicTitle avatarUrl createdAt';
const serializeUser = (user: any) => ({
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
});

// GET /api/admin/users - list registered users (admin only)
router.get('/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        // Exclude password field
        const users = await User.find().select(userFields).sort({ createdAt: -1 }).lean();
        res.json(users.map(serializeUser));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/users/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select(userFields).lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(serializeUser(user));
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { username, email, password, role = 'user', phone, institution, department, bio, academicTitle, avatarUrl } = req.body;
        if (!username?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
        if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid user role' });

        const normalizedEmail = String(email).trim().toLowerCase();
        if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ error: 'Email already in use' });

        const created = await User.create({
            username: String(username).trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(String(password), 10),
            role,
            phone: String(phone || '').trim(),
            institution: String(institution || '').trim(),
            department: String(department || '').trim(),
            bio: String(bio || '').trim(),
            academicTitle: String(academicTitle || '').trim(),
            avatarUrl: String(avatarUrl || '').trim(),
        });
        await recordAudit(req, {
            action: 'user.created',
            resourceType: 'user',
            resourceId: String(created._id),
            resourceLabel: created.email,
            details: { role: created.role },
        });
        res.status(201).json({ message: 'User created', user: serializeUser(created) });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/users/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { username, email, password, role, phone, institution, department, bio, academicTitle, avatarUrl } = req.body;

        if (email !== undefined) {
            const normalizedEmail = String(email).trim().toLowerCase();
            const duplicate = await User.exists({ email: normalizedEmail, _id: { $ne: user._id } });
            if (duplicate) return res.status(409).json({ error: 'Email already in use' });
            user.email = normalizedEmail;
        }
        if (username !== undefined) user.username = String(username).trim();
        if (role !== undefined) {
            if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid user role' });
            user.role = role;
        }
        if (password) {
            if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
            user.password = await bcrypt.hash(String(password), 10);
        }
        if (phone !== undefined) user.phone = String(phone).trim();
        if (institution !== undefined) user.institution = String(institution).trim();
        if (department !== undefined) user.department = String(department).trim();
        if (bio !== undefined) user.bio = String(bio).trim();
        if (academicTitle !== undefined) user.academicTitle = String(academicTitle).trim();
        if (avatarUrl !== undefined) user.avatarUrl = String(avatarUrl).trim();
        if (!user.username || !user.email) return res.status(400).json({ error: 'Name and email are required' });

        await user.save();
        await recordAudit(req, {
            action: 'user.updated',
            resourceType: 'user',
            resourceId: String(user._id),
            resourceLabel: user.email,
            details: { role: user.role, passwordChanged: Boolean(password) },
        });
        res.json({ message: 'User updated', user: serializeUser(user) });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/admin/audit-logs - searchable administrative activity history
router.get('/audit-logs', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
        const filter: Record<string, unknown> = {};
        if (req.query.resourceType) filter.resourceType = req.query.resourceType;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.search) {
            const search = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { action: { $regex: search, $options: 'i' } },
                { actorEmail: { $regex: search, $options: 'i' } },
                { resourceLabel: { $regex: search, $options: 'i' } },
            ];
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            AuditLog.countDocuments(filter),
        ]);
        res.json({
            items: logs.map(log => ({ ...log, id: String(log._id), _id: undefined })),
            total,
            page,
            pages: Math.max(Math.ceil(total / limit), 1),
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/users/:id - remove a registered user (admin only)
router.delete('/users/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (id === req.user?.id) return res.status(400).json({ error: 'You cannot delete your active admin account' });
        const deleted = await User.findByIdAndDelete(id as any);
        if (!deleted) return res.status(404).json({ error: 'User not found' });
        await recordAudit(req, {
            action: 'user.deleted',
            resourceType: 'user',
            resourceId: String(deleted._id),
            resourceLabel: deleted.email,
        });
        res.json({ message: 'User removed' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
