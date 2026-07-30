import { Router } from 'express';
import type { Request, Response } from 'express';
import { User } from '../models/user.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { AuditLog } from '../models/auditLog.js';
import { recordAudit } from '../services/audit.js';

const router = Router();

// GET /api/admin/users - list registered users (admin only)
router.get('/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        // Exclude password field
        const users = await User.find().select('username email role phone institution department bio academicTitle avatarUrl createdAt').lean();
        const mapped = users.map(u => ({
            id: String(u._id),
            username: u.username,
            email: u.email,
            role: u.role,
            phone: u.phone || '',
            institution: u.institution || '',
            department: u.department || '',
            bio: u.bio || '',
            academicTitle: u.academicTitle || '',
            avatarUrl: u.avatarUrl || '',
            createdAt: u.createdAt
        }));
        res.json(mapped);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
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
