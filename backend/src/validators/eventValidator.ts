import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').trim(),
  eventType: z.enum(['academic', 'cultural', 'sports', 'workshop', 'general']),
  universityId: z.string().optional(),
  universityName: z.string().optional(),
  eventDate: z.string().datetime().or(z.string().min(5)).optional(),
  location: z.string().optional(),
  isGlobal: z.boolean().or(z.string().transform((v) => v === 'true')).optional(),
});

export const eventQuerySchema = z.object({
  eventType: z.string().optional(),
  universityId: z.string().optional(),
  search: z.string().optional(),
  page: z.string().transform(Number).pipe(z.number().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().positive().max(100)).optional(),
});
