import { z } from 'zod';

export const universityFilterSchema = z.object({
  searchTerm: z.string().default(''),
  selectedRegion: z.string().default('All'),
  selectedType: z.string().default('All'),
  sortBy: z.enum(['name_asc', 'name_desc', 'region', 'type']).default('name_asc'),
});

export type UniversityFilterValues = z.infer<typeof universityFilterSchema>;

export const hubFilterSchema = z.object({
  searchTerm: z.string().default(''),
  selectedEventType: z.string().default('all'),
  selectedUniversity: z.string().default('all'),
  sortBy: z.enum(['newest', 'oldest', 'most_liked']).default('newest'),
});

export type HubFilterValues = z.infer<typeof hubFilterSchema>;
