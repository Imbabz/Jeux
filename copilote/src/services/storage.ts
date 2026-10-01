import type { z } from 'zod';
import { logger } from './logger.ts';

/**
 * Persistance localStorage. Clés préfixées `copilote:` ; toute lecture est validée par zod :
 * en cas de données absentes, invalides ou d'accès refusé, on revient à la valeur par défaut.
 */

export type StorageKey = 'settings' | 'currentMatch' | 'seen' | 'flagged' | 'records' | 'debugLog';

const PREFIX = 'copilote:';

export const storage = {
  read<T>(key: StorageKey, schema: z.ZodType<T>, fallback: T): T {
    let raw: string | null;
    try {
      raw = localStorage.getItem(PREFIX + key);
    } catch (error) {
      logger.warn(`Lecture impossible : ${key}`, String(error));
      return fallback;
    }
    if (raw === null) return fallback;
    try {
      const parsed = schema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
      logger.error(`Données invalides ignorées : ${key}`, parsed.error.issues.slice(0, 5));
    } catch (error) {
      logger.error(`JSON illisible ignoré : ${key}`, String(error));
    }
    return fallback;
  },
  write(key: StorageKey, value: unknown) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (error) {
      logger.error(`Écriture impossible : ${key}`, String(error));
    }
  },
  remove(key: StorageKey) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // Stockage indisponible : rien à supprimer.
    }
  },
};
