import { z } from 'zod';

export const frontendRegisterSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(40, 'Username cannot exceed 40 characters')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const frontendLoginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const frontendProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  phone: z.string().max(20).optional(),
  institution: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  academicTitle: z.string().max(100).optional(),
});
