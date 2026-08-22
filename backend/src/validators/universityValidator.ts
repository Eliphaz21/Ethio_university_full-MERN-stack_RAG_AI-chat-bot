import { z } from 'zod';

export const createUniversitySchema = z.object({
  name: z.string().min(2, 'University name is required').trim(),
  slug: z.string().min(2).optional(),
  type: z.enum(['Public', 'Private']),
  established: z.number().int().min(1800).max(new Date().getFullYear()),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    region: z.string().min(1, 'Region is required'),
  }),
  description: z.string().optional(),
  website: z.string().url().or(z.literal('')).optional(),
  studentCount: z.number().nonnegative().optional(),
  faculties: z.array(z.string()).optional(),
  campusSize: z.string().optional(),
  logo: z.string().optional(),
  image: z.string().optional(),
});

export const universityQuerySchema = z.object({
  region: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
});
