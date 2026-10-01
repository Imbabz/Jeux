import type { z } from 'zod';
import packsJson from './data/packs.json';
import bacJson from './data/bac.json';
import estimJson from './data/estim.json';
import yearJson from './data/year.json';
import {
  bacItemSchema,
  estimItemSchema,
  packSchema,
  yearItemSchema,
  type BacContentItem,
  type EstimContentItem,
  type Pack,
  type YearContentItem,
} from './schemas.ts';

export interface RejectedItem {
  readonly file: string;
  readonly id: string;
  readonly issues: string[];
}

export interface Content {
  readonly packs: readonly Pack[];
  readonly year: readonly YearContentItem[];
  readonly estim: readonly EstimContentItem[];
  readonly bac: readonly BacContentItem[];
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

export interface RawContent {
  readonly packs: unknown;
  readonly year: unknown;
  readonly estim: unknown;
  readonly bac: unknown;
}

export function buildContent(raw: RawContent): Content {
  const packs = packSchema.array().parse(raw.packs);
  const packIds = new Set(packs.map((p) => p.id));
  const year = validateItems('year.json', raw.year, yearItemSchema, packIds);
  const estim = validateItems('estim.json', raw.estim, estimItemSchema, packIds);
  const bac = validateItems('bac.json', raw.bac, bacItemSchema, packIds);
  return {
    packs,
    year: year.items,
    estim: estim.items,
    bac: bac.items,
    rejected: [...year.rejected, ...estim.rejected, ...bac.rejected],
  };
}

/** Implémentation v1 : JSON embarqué dans le build (précaché par le service worker). */
export class LocalJsonSource implements ContentSource {
  load(): Promise<Content> {
    return Promise.resolve(
      buildContent({ packs: packsJson, year: yearJson, estim: estimJson, bac: bacJson }),
    );
  }
}
