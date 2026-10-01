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
    /** Indice facultatif, révélé à la demande du copilote (lieu, contexte…). */
    hint: z.string().min(1).max(90).optional(),
  })
  .refine((item) => String(item.year).startsWith(item.centuryHint), {
    message: 'centuryHint doit être le début de year',
    path: ['centuryHint'],
  });
export type YearContentItem = z.infer<typeof yearItemSchema>;

const LETTER = /^[A-Z]$/;

export const estimItemSchema = z.object({
  id: z.string().regex(/^est-\d{4}$/),
  packs: z.array(z.string()).min(1),
  question: z.string().min(1).max(110),
  unit: z.string().min(1).max(24),
  answer: z.number().positive().finite(),
  /** Réponse affichée si le format automatique ne convient pas. */
  answerLabel: z.string().min(1).max(40).optional(),
  difficulty: difficultySchema,
  context: z.string().min(1).max(160),
  /** Année de référence d'une valeur qui évolue (population, record…). */
  referenceYear: z.number().int().min(1900).max(2026).optional(),
  /** Indice facultatif, révélé à la demande du copilote (lieu, contexte…). */
  hint: z.string().min(1).max(90).optional(),
});
export type EstimContentItem = z.infer<typeof estimItemSchema>;

export const bacItemSchema = z.object({
  id: z.string().regex(/^bac-\d{4}$/),
  packs: z.array(z.string()).min(1),
  label: z.string().min(1).max(56),
  difficulty: difficultySchema,
  excludedLetters: z.array(z.string().regex(LETTER)),
});
export type BacContentItem = z.infer<typeof bacItemSchema>;

/**
 * Dictionnaire du Bac Éclair (bac-dictionary.json, chargé à la demande) : pour chaque catégorie
 * et chaque lettre jouable, les entrées « mot, note » (« abeille », « n.f. · insecte »).
 * Indicatif : le copilote peut valider un mot absent.
 */
export const dictionaryEntrySchema = z.tuple([z.string().min(1), z.string()]);
export type DictionaryEntry = z.infer<typeof dictionaryEntrySchema>;
export const bacDictionarySchema = z.record(
  z.string().regex(/^bac-\d{4}$/),
  z.record(z.string().regex(LETTER), z.array(dictionaryEntrySchema)),
);
export type BacDictionary = z.infer<typeof bacDictionarySchema>;
