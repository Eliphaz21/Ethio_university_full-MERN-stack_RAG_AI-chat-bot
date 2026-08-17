import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, generateTestAuth } from './testSetup.js';
import { User } from '../models/user.js';
import { Knowledge } from '../models/knowledge.js';
import { createCsrfToken } from '../utils/authTokens.js';

const app = createTestApp();

describe('Knowledge Routes Integration & Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/admin/knowledge (Text indexing)', () => {
    it('should block non-staff users from indexing knowledge', async () => {
      const auth = generateTestAuth({ id: '507f1f77bcf86cd799439011', role: 'user' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', role: 'user' }),
        then: (cb: any) => Promise.resolve({ _id: '507f1f77bcf86cd799439011', role: 'user' }).then(cb),
      } as any);

      const res = await request(app)
        .post('/api/admin/knowledge')
        .set('Cookie', auth.cookieHeader)
        .set('X-CSRF-Token', auth.csrfToken)
        .send({ title: 'Admissions FAQ', content: 'AAU admission rules' });

      expect(res.status).toBe(403);
    });

    it('should reject empty knowledge content for staff/admin', async () => {
      const auth = generateTestAuth({ id: '507f1f77bcf86cd799439011', role: 'admin' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', role: 'admin' }),
        then: (cb: any) => Promise.resolve({ _id: '507f1f77bcf86cd799439011', role: 'admin' }).then(cb),
      } as any);

      const res = await request(app)
        .post('/api/admin/knowledge')
        .set('Cookie', auth.cookieHeader)
        .set('X-CSRF-Token', auth.csrfToken)
        .send({ title: 'Admissions FAQ', content: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Content cannot be empty');
    });
  });

  describe('POST /api/admin/knowledge/url (SSRF Protection)', () => {
    it('should reject localhost and internal network URLs', async () => {
      const auth = generateTestAuth({ id: '507f1f77bcf86cd799439011', role: 'admin' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', role: 'admin' }),
        then: (cb: any) => Promise.resolve({ _id: '507f1f77bcf86cd799439011', role: 'admin' }).then(cb),
      } as any);

      const res = await request(app)
        .post('/api/admin/knowledge/url')
        .set('Cookie', auth.cookieHeader)
        .set('X-CSRF-Token', auth.csrfToken)
        .send({ url: 'http://127.0.0.1/admin-secret' });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Private or local network URLs are not allowed');
    });
  });

  describe('GET /api/admin/knowledge', () => {
    it('should return grouped knowledge documents for staff', async () => {
      const auth = generateTestAuth({ id: '507f1f77bcf86cd799439011', role: 'agent' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', role: 'agent' }),
        then: (cb: any) => Promise.resolve({ _id: '507f1f77bcf86cd799439011', role: 'agent' }).then(cb),
      } as any);

      vi.spyOn(Knowledge, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([
              {
                _id: '507f1f77bcf86cd799439099',
                documentId: 'doc-uuid-1',
                title: 'University Charter',
                type: 'text',
                category: 'General',
                content: 'Full charter text',
                uploadedAt: new Date(),
              },
            ]),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/knowledge')
        .set('Cookie', auth.cookieHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].title).toBe('University Charter');
    });
  });
});
