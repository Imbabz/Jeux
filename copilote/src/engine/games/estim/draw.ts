import { drawItems, type DrawableItem, type DrawContext } from '../../draw.ts';
import type { Rng } from '../../rng.ts';
import type { Difficulty, RoundItem } from '../../types.ts';

/** Question d'Estimation telle que le moteur en a besoin. */
export interface EstimItem extends DrawableItem {
  readonly answer: number;
}

export function drawEstim(
  pool: readonly EstimItem[],
  targets: readonly Difficulty[],
  ctx: DrawContext,
  rng: Rng,
): RoundItem[] {
  return drawItems(pool, targets, ctx, rng).map((item) => ({ id: item.id, answer: item.answer }));
}
