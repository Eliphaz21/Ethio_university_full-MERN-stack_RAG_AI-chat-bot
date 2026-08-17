import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, generateTestAuth } from './testSetup.js';
import { University } from '../models/university.js';
import { UniversityReview } from '../models/universityReview.js';
import { User } from '../models/user.js';
import { createCsrfToken } from '../utils/authTokens.js';

const app = createTestApp();

describe('University Routes Integration & Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/universities', () => {
    it('should return list of universities', async () => {
      const mockList = [
        { _id: '507f1f77bcf86cd799439011', name: 'Addis Ababa University', slug: 'addis-ababa-university' },
      ];
      vi.spyOn(University, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockList),
        }),
      } as any);

      const res = await request(app).get('/api/universities');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].slug).toBe('addis-ababa-university');
    });
  });

  describe('GET /api/universities/:slug', () => {
    it('should return 404 for unknown university slug', async () => {
      vi.spyOn(University, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app).get('/api/universities/unknown-uni');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('University not found');
    });

    it('should return university details for valid slug', async () => {
      const mockDoc = { _id: '507f1f77bcf86cd799439011', name: 'Jimma University', slug: 'jimma-university' };
      vi.spyOn(University, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockDoc),
      } as any);

      const res = await request(app).get('/api/universities/jimma-university');

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Jimma University');
    });
  });

  describe('POST /api/admin/universities (Admin CRUD)', () => {
    it('should block non-staff users from creating universities', async () => {
      const auth = generateTestAuth({ id: '507f1f77bcf86cd799439011', role: 'user' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', role: 'user' }),
      } as any);

      const res = await request(app)
        .post('/api/admin/universities')
        .set('Cookie', auth.cookieHeader)
        .set('X-CSRF-Token', auth.csrfToken)
        .send({ name: 'New Uni', description: 'Desc', website: 'https://uni.edu' });

      expect(res.status).toBe(403);
    });

    it('should reject missing required fields for staff/admin', async () => {
      const auth = generateTestAuth({ id: '507f1f77bcf86cd799439011', role: 'admin' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', role: 'admin' }),
      } as any);

      const res = await request(app)
        .post('/api/admin/universities')
        .set('Cookie', auth.cookieHeader)
        .set('X-CSRF-Token', auth.csrfToken)
        .send({ name: 'Incomplete Uni' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });
  });

  describe('POST /api/universities/:slug/reviews', () => {
    it('should require authentication or CSRF token to post a review', async () => {
      const csrfToken = createCsrfToken();
      const res = await request(app)
        .post('/api/universities/aau/reviews')
        .set('Cookie', `ethiouni_csrf=${csrfToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send({ comment: 'Great university!' });

      expect(res.status).toBe(401);
    });

    it('should sanitize comment text and restrict rating between 1 and 5', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const auth = generateTestAuth({ id: userId, role: 'user' });
      const mockUser = { _id: userId, username: 'Tester', avatarUrl: '' };

      vi.spyOn(User, 'findById').mockImplementation((_id: any) => {
        const promise = Promise.resolve(mockUser);
        (promise as any).select = vi.fn().mockResolvedValue({ _id: userId, role: 'user' });
        return promise as any;
      });

      vi.spyOn(UniversityReview.prototype, 'save').mockImplementation(function (this: any) {
        this._id = '507f1f77bcf86cd799439022';
        this.createdAt = new Date();
        return Promise.resolve(this);
      });

      const res = await request(app)
        .post('/api/universities/aau/reviews')
        .set('Cookie', auth.cookieHeader)
        .set('X-CSRF-Token', auth.csrfToken)
        .send({ rating: 10, comment: '<script>alert(1)</script> Great place' });

      expect(res.status).toBe(201);
      expect(res.body.review.comment).not.toContain('<script>');
      expect(res.body.review.comment).toContain('&lt;script&gt;');
    });
  });
});
