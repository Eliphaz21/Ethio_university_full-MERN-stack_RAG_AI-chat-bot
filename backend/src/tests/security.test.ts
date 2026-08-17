import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './testSetup.js';
import { createCsrfToken, CSRF_COOKIE, CSRF_HEADER } from '../utils/authTokens.js';
import { User } from '../models/user.js';

const app = createTestApp();

describe('Security Headers, CSRF, and Request Handling Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('HTTP Security Headers (Helmet)', () => {
    it('should disable x-powered-by header to hide technology stack', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('should set X-Content-Type-Options to nosniff', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });

  describe('CSRF Protection Middleware', () => {
    it('should allow GET, HEAD, OPTIONS requests without CSRF token', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('should reject state-mutating requests when CSRF token is missing', async () => {
      const res = await request(app).post('/api/chat').send({ prompt: 'test' });
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('CSRF');
    });

    it('should reject mutating requests when CSRF token in header does not match cookie', async () => {
      const token1 = createCsrfToken();
      const token2 = createCsrfToken();

      const res = await request(app)
        .post('/api/chat')
        .set('Cookie', `${CSRF_COOKIE}=${token1}`)
        .set(CSRF_HEADER, token2)
        .send({ prompt: 'test' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('CSRF');
    });

    it('should allow exempt login/register endpoints without CSRF token', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid@example.com', password: 'Password123' });

      expect(res.status).toBe(401); // Reaches route handler, not blocked by CSRF (403)
    });
  });
});
