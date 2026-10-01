import { randomInt, type Rng } from './rng.ts';
import type { Difficulty } from './types.ts';

/** Ce que le tirage doit savoir d'un item, quel que soit le jeu. */
export interface DrawableItem {
  readonly id: string;
  readonly packs: readonly string[];
  readonly difficulty: Difficulty;
}

export interface DrawContext {
  readonly packs: readonly string[];
  readonly flagged: ReadonlySet<string>;
  /** itemId → numéro d'ordre de sa dernière apparition (GAME_DESIGN §11.2). */
  readonly seen: ReadonlyMap<string, number>;
  readonly avoidSeen: boolean;
  /** Items déjà tirés dans cette partie : jamais reposés. */
  readonly used: ReadonlySet<string>;
}

/** Items du jeu présents dans les packs sélectionnés et non signalés (vus compris). */
export function availableItems<T extends DrawableItem>(
  pool: readonly T[],
  packs: readonly string[],
  flagged: ReadonlySet<string>,
): T[] {
  return pool.filter((item) => !flagged.has(item.id) && item.packs.some((p) => packs.includes(p)));
}

/** Seuil sous lequel un jeu est désactivé pour la partie (GAME_DESIGN §11.3). */
export const MIN_ITEMS_PER_GAME = 10;

/**
 * Tire un item par difficulté cible (GAME_DESIGN §4.3 et §11) :
 * - éligibles = packs ∩ non signalés ∩ non tirés dans la partie ∩ (non vus si demandé) ;
 * - s'il en manque, on recycle les vus les plus anciens ;
 * - pour chaque cible, on prend la difficulté la plus proche (la plus basse à distance égale).
 * Renvoie moins d'items que demandé seulement si le contenu est épuisé.
 */
export function drawItems<T extends DrawableItem>(
  pool: readonly T[],
  targets: readonly Difficulty[],
  ctx: DrawContext,
  rng: Rng,
): T[] {
  const base = availableItems(pool, ctx.packs, ctx.flagged).filter(
    (item) => !ctx.used.has(item.id),
  );
  let candidates = ctx.avoidSeen ? base.filter((item) => !ctx.seen.has(item.id)) : base;
  if (candidates.length < targets.length) {
    const recycled = base
      .filter((item) => ctx.seen.has(item.id))
      .sort((a, b) => (ctx.seen.get(a.id) as number) - (ctx.seen.get(b.id) as number))
      .slice(0, targets.length - candidates.length);
    candidates = [...candidates, ...recycled];
  }

  const picked: T[] = [];
  const remaining = [...candidates];
  for (const target of targets) {
    if (remaining.length === 0) break;
    const distance = (item: T) =>
      Math.abs(item.difficulty - target) * 2 + (item.difficulty > target ? 1 : 0);
    const best = Math.min(...remaining.map(distance));
    const closest = remaining.filter((item) => distance(item) === best);
    const choice = closest[randomInt(rng, closest.length)] as T;
    picked.push(choice);
    remaining.splice(remaining.indexOf(choice), 1);
  }
  return picked;
}
