import type { PerPlayer, PlayerId } from '../../types.ts';

/**
 * Scoring commun à « Quelle année ? » et « Estimation » (GAME_DESIGN §5).
 * - Année : écart absolu, exact = écart nul.
 * - Estimation : ratio max/min, exact = ratio ≤ 1,01. Comparaisons en entiers exacts
 *   (centièmes, bigint) par produits croisés : aucune erreur d'arrondi possible.
 */

export type ClosestKind = 'year' | 'estim';
export type Answer = number | null;

export interface ClosestOutcome {
  readonly winner: PlayerId | 'tie' | 'none';
  readonly points: PerPlayer<number>;
  readonly exact: PerPlayer<boolean>;
  /** Écart affichable : années d'écart, ou ratio (≥ 1). `null` si pas de réponse. */
  readonly gap: PerPlayer<number | null>;
}

export interface ScoringOptions {
  readonly exactBonus: boolean;
  readonly multiplier: number;
}

const toCents = (value: number): bigint => BigInt(Math.round(value * 100));

function ratioParts(p: number, r: number): [bigint, bigint] {
  const a = toCents(p);
  const b = toCents(r);
  return a >= b ? [a, b] : [b, a];
}

export function isExact(kind: ClosestKind, proposal: number, answer: number): boolean {
  if (kind === 'year') return proposal === answer;
  const [max, min] = ratioParts(proposal, answer);
  return 100n * max <= 101n * min;
}

/** Négatif si `a` est plus proche que `b`, positif si `b` l'est, 0 en cas d'égalité d'écart. */
export function compareProposals(kind: ClosestKind, a: number, b: number, answer: number): number {
  if (kind === 'year') return Math.abs(a - answer) - Math.abs(b - answer);
  const [maxA, minA] = ratioParts(a, answer);
  const [maxB, minB] = ratioParts(b, answer);
  const left = maxA * minB;
  const right = maxB * minA;
  return left === right ? 0 : left < right ? -1 : 1;
}

export function gapOf(kind: ClosestKind, proposal: number, answer: number): number {
  if (kind === 'year') return Math.abs(proposal - answer);
  return Math.max(proposal, answer) / Math.min(proposal, answer);
}

export function scoreClosest(
  kind: ClosestKind,
  answer: number,
  inputs: PerPlayer<Answer>,
  options: ScoringOptions,
): ClosestOutcome {
  const exactOf = (p: Answer) => p !== null && isExact(kind, p, answer);
  const exact = { A: exactOf(inputs.A), B: exactOf(inputs.B) };
  const gap = {
    A: inputs.A === null ? null : gapOf(kind, inputs.A, answer),
    B: inputs.B === null ? null : gapOf(kind, inputs.B, answer),
  };
  const award = (player: PlayerId) =>
    (exact[player] && options.exactBonus ? 2 : 1) * options.multiplier;

  let winner: ClosestOutcome['winner'];
  if (inputs.A === null && inputs.B === null) winner = 'none';
  else if (inputs.B === null) winner = 'A';
  else if (inputs.A === null) winner = 'B';
  else {
    const cmp = compareProposals(kind, inputs.A, inputs.B, answer);
    winner = cmp === 0 ? 'tie' : cmp < 0 ? 'A' : 'B';
  }

  const points = {
    A: winner === 'A' || winner === 'tie' ? award('A') : 0,
    B: winner === 'B' || winner === 'tie' ? award('B') : 0,
  };
  return { winner, points, exact, gap };
}
