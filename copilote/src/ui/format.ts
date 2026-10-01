import type { PerPlayer } from '../engine/index.ts';

/** Formats d'affichage partagés (aucune règle de jeu). */

export const scoreLine = (names: PerPlayer<string>, scores: PerPlayer<number>) =>
  `${names.A} ${scores.A} – ${scores.B} ${names.B}`;

export const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

export function yearGapLabel(gap: number | null, exact: boolean): string {
  if (gap === null) return 'pas de réponse';
  if (exact) return 'pile !';
  return `à ${plural(gap, 'an', 'ans')}`;
}
