import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createTestApp, generateTestAuth } from './testSetup.js';
import { User } from '../models/user.js';

const app = createTestApp();

describe('Auth Routes Integration & Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should reject registration when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Test User' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('should reject invalid email formatting', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Test', email: 'invalid-email', password: 'Password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('valid email');
    });

    it('should reject weak passwords lacking numbers or letters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Test', email: 'test@example.com', password: 'onlyletters' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('at least one letter and one number');
    });

    it('should reject registration if email is already taken', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue({ email: 'test@example.com' } as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Test', email: 'test@example.com', password: 'Password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email already in use');
    });

    it('should register a valid user successfully', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue(null);
      vi.spyOn(User.prototype, 'save').mockResolvedValue({ _id: '507f1f77bcf86cd799439011', email: 'new@example.com' } as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'New User', email: 'new@example.com', password: 'Password123' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'Password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should log in successfully and set httpOnly auth cookie & CSRF token', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        password: '$2a$12$hashedpassword',
        createdAt: new Date(),
      };
      vi.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'john@example.com', password: 'Password123' });

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('john@example.com');

      const rawCookies = res.headers['set-cookie'];
      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies || ''];
      expect(cookies.some((c: string) => c.includes('ethiouni_token'))).toBe(true);
      expect(cookies.some((c: string) => c.includes('ethiouni_csrf'))).toBe(true);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear session cookies on logout', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 if unauthenticated', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });

    it('should return user profile when authenticated', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const auth = generateTestAuth({ id: userId, role: 'user' });
      const mockUser = {
        _id: userId,
        username: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date(),
      };

      vi.spyOn(User, 'findById').mockImplementation((_id: any) => ({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any));

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Cookie', auth.cookieHeader);

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('John Doe');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should reject invalid avatar URLs (non-HTTP/HTTPS)', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const auth = generateTestAuth({ id: userId, role: 'user' });
      const mockUser = {
        _id: userId,
        username: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(User, 'findById').mockImplementation((_id: any) => ({
        select: vi.fn().mockResolvedValue({ _id: userId, role: 'user' }),
        then: (cb: any) => Promise.resolve(mockUser).then(cb),
      } as any));

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Cookie', auth.cookieHeader)
        .set('X-CSRF-Token', auth.csrfToken)
        .send({ avatarUrl: 'javascript:alert(1)' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Avatar URL must use http or https');
    });
  });
});
