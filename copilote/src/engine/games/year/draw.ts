import { drawItems, type DrawableItem, type DrawContext } from '../../draw.ts';
import type { Rng } from '../../rng.ts';
import type { Difficulty, RoundItem } from '../../types.ts';

/** Item « Quelle année ? » tel que le moteur en a besoin (le schéma complet est dans src/content). */
export interface YearItem extends DrawableItem {
  readonly year: number;
}

export function drawYear(
  pool: readonly YearItem[],
  targets: readonly Difficulty[],
  ctx: DrawContext,
  rng: Rng,
): RoundItem[] {
  return drawItems(pool, targets, ctx, rng).map((item) => ({ id: item.id, answer: item.year }));
}
