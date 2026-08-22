import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(40, 'Username must not exceed 40 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(40).trim().optional(),
  phone: z.string().max(20).optional(),
  institution: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  academicTitle: z.string().max(100).optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
});
