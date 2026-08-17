import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, generateTestAuth } from './testSetup.js';
import { User } from '../models/user.js';
import { AuditLog } from '../models/auditLog.js';

const app = createTestApp();

describe('Admin Routes Integration & Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('should block non-admin users from accessing user directory', async () => {
      const auth = generateTestAuth({ id: '507f1f77bcf86cd799439011', role: 'user' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', role: 'user' }),
        then: (cb: any) => Promise.resolve({ _id: '507f1f77bcf86cd799439011', role: 'user' }).then(cb),
      } as any);

      const res = await request(app)
        .get('/api/admin/users')
        .set('Cookie', auth.cookieHeader);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Admin access required');
    });

    it('should allow admin users to view user list without password hashes', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      const auth = generateTestAuth({ id: adminId, role: 'admin' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: adminId, role: 'admin' }),
        then: (cb: any) => Promise.resolve({ _id: adminId, role: 'admin' }).then(cb),
      } as any);

      const mockUsers = [
        {
          _id: adminId,
          username: 'Admin User',
          email: 'admin@ethiouni.edu.et',
          role: 'admin',
          createdAt: new Date(),
        },
      ];

      vi.spyOn(User, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue(mockUsers),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/users')
        .set('Cookie', auth.cookieHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].email).toBe('admin@ethiouni.edu.et');
      expect(res.body[0].password).toBeUndefined();
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should prevent an admin from deleting their active account', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      const auth = generateTestAuth({ id: adminId, role: 'admin' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: adminId, role: 'admin' }),
        then: (cb: any) => Promise.resolve({ _id: adminId, role: 'admin' }).then(cb),
      } as any);

      const res = await request(app)
        .delete(`/api/admin/users/${adminId}`)
        .set('Cookie', auth.cookieHeader)
        .set('X-CSRF-Token', auth.csrfToken);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('cannot delete your active admin account');
    });
  });

  describe('GET /api/admin/audit-logs', () => {
    it('should return paginated audit history for admin', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      const auth = generateTestAuth({ id: adminId, role: 'admin' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: adminId, role: 'admin' }),
        then: (cb: any) => Promise.resolve({ _id: adminId, role: 'admin' }).then(cb),
      } as any);

      vi.spyOn(AuditLog, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              lean: vi.fn().mockResolvedValue([
                {
                  _id: '507f1f77bcf86cd799439099',
                  action: 'auth.login',
                  status: 'success',
                  createdAt: new Date(),
                },
              ]),
            }),
          }),
        }),
      } as any);

      vi.spyOn(AuditLog, 'countDocuments').mockResolvedValue(1);

      const res = await request(app)
        .get('/api/admin/audit-logs?page=1&limit=25')
        .set('Cookie', auth.cookieHeader);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(1);
      expect(res.body.total).toBe(1);
    });
  });
});
