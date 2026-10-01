import { drawItems, type DrawableItem, type DrawContext } from '../../draw.ts';
import type { Rng } from '../../rng.ts';
import type { Difficulty, RoundItem } from '../../types.ts';

/** Catégorie de Bac Éclair telle que le moteur en a besoin. */
export interface BacItem extends DrawableItem {
  readonly excludedLetters: readonly string[];
}

/** Poids des initiales (GAME_DESIGN, annexe A). Les lettres rares valent 1 quand elles sont activées. */
export const LETTER_WEIGHTS: Readonly<Record<string, number>> = {
  A: 8,
  B: 7,
  C: 10,
  D: 6,
  E: 5,
  F: 5,
  G: 5,
  H: 3,
  I: 2,
  J: 3,
  L: 6,
  M: 8,
  N: 3,
  O: 3,
  P: 9,
  R: 6,
  S: 9,
  T: 7,
  U: 2,
  V: 4,
};
export const RARE_LETTERS: readonly string[] = ['K', 'Q', 'W', 'X', 'Y', 'Z'];

/** Lettres jouables pour une catégorie (sans tenir compte des lettres déjà tirées). */
export function allowedLetters(excluded: readonly string[], rareLetters: boolean): string[] {
  const pool = [...Object.keys(LETTER_WEIGHTS), ...(rareLetters ? RARE_LETTERS : [])];
  return pool.filter((l) => !excluded.includes(l));
}

/**
 * Tire une lettre pondérée (GAME_DESIGN §7.3) en excluant les lettres interdites
 * et celles déjà utilisées pour ce tour ou au tour précédent. `null` si plus aucune n'est possible.
 */
export function drawLetter(
  excluded: readonly string[],
  used: readonly string[],
  rareLetters: boolean,
  rng: Rng,
): string | null {
  const candidates = allowedLetters(excluded, rareLetters).filter((l) => !used.includes(l));
  if (candidates.length === 0) return null;
  const total = candidates.reduce((acc, l) => acc + (LETTER_WEIGHTS[l] ?? 1), 0);
  let pick = rng() * total;
  for (const letter of candidates) {
    pick -= LETTER_WEIGHTS[letter] ?? 1;
    if (pick < 0) return letter;
  }
  /* v8 ignore next -- arrondi flottant : la boucle renvoie toujours une lettre */
  return candidates[candidates.length - 1] as string;
}

export function drawBac(
  pool: readonly BacItem[],
  targets: readonly Difficulty[],
  ctx: DrawContext,
  rng: Rng,
): RoundItem[] {
  return drawItems(pool, targets, ctx, rng).map((item) => ({ id: item.id, answer: 0 }));
}
