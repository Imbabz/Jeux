import { z } from 'zod';
import { YEAR_MAX, YEAR_MIN } from '../engine/index.ts';

/** Schémas du contenu (CONTENT_GUIDE §4). Toute donnée chargée passe par eux. */

export const difficultySchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const packSchema = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  name: z.string().min(1),
  emoji: z.string().min(1),
  description: z.string().min(1),
});
export type Pack = z.infer<typeof packSchema>;

export const yearItemSchema = z
  .object({
    id: z.string().regex(/^yr-\d{4}$/),
    packs: z.array(z.string()).min(1),
    category: z.string().min(1).max(24),
    text: z.string().min(1).max(90),
    year: z.number().int().min(YEAR_MIN).max(YEAR_MAX),
    centuryHint: z.string().regex(/^\d{2}$/),
    difficulty: difficultySchema,
    context: z.string().min(1).max(160),
  })
  .refine((item) => String(item.year).startsWith(item.centuryHint), {
    message: 'centuryHint doit être le début de year',
    path: ['centuryHint'],
  });
export type YearContentItem = z.infer<typeof yearItemSchema>;
