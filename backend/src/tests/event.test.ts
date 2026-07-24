import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, generateTestAuth } from './testSetup.js';
import { EventModel } from '../models/event.js';
import { EventCommentModel } from '../models/eventComment.js';
import { User } from '../models/user.js';
import { createCsrfToken } from '../utils/authTokens.js';

const app = createTestApp();

describe('Event Routes Integration & Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/events', () => {
    it('should return paginated list of events', async () => {
      const mockEvents = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'EthioUni Hackathon',
          description: 'Annual coding event',
          eventType: 'workshop',
          author: '507f1f77bcf86cd799439099',
          likes: [],
          createdAt: new Date(),
        },
      ];

      vi.spyOn(EventModel, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(mockEvents),
          }),
        }),
      } as any);

      vi.spyOn(EventModel, 'countDocuments').mockResolvedValue(1);

      const res = await request(app).get('/api/events?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(1);
      expect(res.body.events[0].title).toBe('EthioUni Hackathon');
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return 400 for invalid ObjectId format', async () => {
      const res = await request(app).get('/api/events/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid event ID format');
    });

    it('should return 404 if event is not found', async () => {
      vi.spyOn(EventModel, 'findById').mockResolvedValue(null);

      const res = await request(app).get('/api/events/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Event not found');
    });
  });

  describe('POST /api/events', () => {
    it('should require authentication or CSRF token to create an event', async () => {
      const csrfToken = createCsrfToken();
      const res = await request(app)
        .post('/api/events')
        .set('Cookie', `ethiouni_csrf=${csrfToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send({ title: 'Test', description: 'Desc' });

      expect(res.status).toBe(401);
    });

    it('should reject invalid external URLs', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const auth = generateTestAuth({ id: userId, role: 'user' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: userId, role: 'user', username: 'Tester' }),
        then: (cb: any) => Promise.resolve({ _id: userId, username: 'Tester' }).then(cb),
      } as any);

      const res = await request(app)
        .post('/api/events')
        .set('Cookie', auth.cookieHeader)
        .set('X-CSRF-Token', auth.csrfToken)
        .send({
          title: 'Valid Title',
          description: 'Valid Description',
          link: 'ftp://malicious-server.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('http:// or https://');
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should block unauthorized users from deleting events authored by others', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const authorId = '507f1f77bcf86cd799439099';
      const auth = generateTestAuth({ id: userId, role: 'user' });

      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: userId, role: 'user' }),
        then: (cb: any) => Promise.resolve({ _id: userId, role: 'user' }).then(cb),
      } as any);

      vi.spyOn(EventModel, 'findById').mockResolvedValue({
        _id: '507f1f77bcf86cd799439022',
        author: authorId,
        title: 'Other User Event',
      } as any);

      const res = await request(app)
        .delete('/api/events/507f1f77bcf86cd799439022')
        .set('Cookie', auth.cookieHeader)
        .set('X-CSRF-Token', auth.csrfToken);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('permission');
    });
  });
});
