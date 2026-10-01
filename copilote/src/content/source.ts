import type { z } from 'zod';
import packsJson from './data/packs.json';
import yearJson from './data/year.json';
import { packSchema, yearItemSchema, type Pack, type YearContentItem } from './schemas.ts';

export interface RejectedItem {
  readonly file: string;
  readonly id: string;
  readonly issues: string[];
}

export interface Content {
  readonly packs: readonly Pack[];
  readonly year: readonly YearContentItem[];
  /** Items écartés par la validation (affichés dans les statistiques du debug). */
  readonly rejected: readonly RejectedItem[];
}

/** Toute lecture de contenu passe par cette interface, pour pouvoir brancher un backend plus tard. */
export interface ContentSource {
  load(): Promise<Content>;
}

/**
 * Valide chaque item séparément : un item invalide est écarté (et listé) sans faire tomber le reste.
 * Les items rattachés à un pack inconnu sont aussi écartés.
 */
export function validateItems<T extends { id: string; packs: string[] }>(
  file: string,
  raw: unknown,
  schema: z.ZodType<T>,
  packIds: ReadonlySet<string>,
): { items: T[]; rejected: RejectedItem[] } {
  const items: T[] = [];
  const rejected: RejectedItem[] = [];
  const list = Array.isArray(raw) ? raw : [];
  for (const entry of list) {
    const parsed = schema.safeParse(entry);
    const id = String((entry as { id?: unknown } | null)?.id ?? '?');
    if (!parsed.success) {
      rejected.push({
        file,
        id,
        issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    } else if (!parsed.data.packs.every((p) => packIds.has(p))) {
      rejected.push({ file, id, issues: ['pack inconnu'] });
    } else {
      items.push(parsed.data);
    }
  }
  return { items, rejected };
}

export function buildContent(rawPacks: unknown, rawYear: unknown): Content {
  const packs = packSchema.array().parse(rawPacks);
  const packIds = new Set(packs.map((p) => p.id));
  const year = validateItems('year.json', rawYear, yearItemSchema, packIds);
  return { packs, year: year.items, rejected: year.rejected };
}

/** Implémentation v1 : JSON embarqué dans le build (précaché par le service worker). */
export class LocalJsonSource implements ContentSource {
  load(): Promise<Content> {
    return Promise.resolve(buildContent(packsJson, yearJson));
  }
}
