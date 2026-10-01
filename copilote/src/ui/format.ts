import type { PerPlayer } from '../engine/index.ts';

/** Formats d'affichage partagés, en français (aucune règle de jeu). */

export const scoreLine = (names: PerPlayer<string>, scores: PerPlayer<number>) =>
  `${names.A} ${scores.A} – ${scores.B} ${names.B}`;

export const plural = (n: number, one: string, many: string) => `${n} ${n >= 2 ? many : one}`;

export function yearGapLabel(gap: number | null, exact: boolean): string {
  if (gap === null) return 'pas de réponse';
  if (exact) return 'pile !';
  return `à ${plural(gap, 'an', 'ans')}`;
}

const nf = (digits: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits, useGrouping: true });

/** 6700000 → « 6 700 000 », 2.5 → « 2,5 ». Espaces insécables fines remplacées par des espaces simples. */
export function formatNumber(value: number, digits = 2): string {
  return nf(digits)
    .format(value)
    .replace(/\u202f/g, '\u00a0');
}

const SCALES = [
  { value: 1e9, one: 'milliard', many: 'milliards' },
  { value: 1e6, one: 'million', many: 'millions' },
] as const;

/** 6 700 000 → « 6,7 millions » ; 1 500 000 000 → « 1,5 milliard » ; 384 400 → « 384 400 ». */
export function formatQuantity(value: number): string {
  for (const scale of SCALES) {
    if (value >= scale.value) {
      const scaled = value / scale.value;
      return `${formatNumber(scaled)}\u00a0${scaled >= 2 ? scale.many : scale.one}`;
    }
  }
  return formatNumber(value);
}

/** « 11,8 millions » + « habitants » → « 11,8 millions d'habitants » ; « 206 » + « os » → « 206 os ». */
export function withUnit(quantity: string, unit: string): string {
  if (!/(million|milliard)s?$/.test(quantity)) return `${quantity} ${unit}`;
  return /^[aeiouyhéèêàâîôûœ]/i.test(unit) ? `${quantity} d’${unit}` : `${quantity} de ${unit}`;
}

/** Réponse d'Estimation affichée à la révélation. */
export function estimAnswerLabel(answer: number, unit: string, approximate: boolean): string {
  return `${approximate ? '≈ ' : ''}${withUnit(formatQuantity(answer), unit)}`;
}

/** Écart d'Estimation : « pile ! », « ×1,3 », « ×12 ». */
export function ratioLabel(ratio: number | null, exact: boolean): string {
  if (ratio === null) return 'pas de réponse';
  if (exact) return 'dans le mille !';
  if (ratio > 100) return 'plus de ×100';
  return `×${formatNumber(ratio, ratio < 10 ? 1 : 0)}`;
}

/** Valeur saisie au pavé d'Estimation : « 6,5 » × million → 6 500 000. */
export function parseEstimInput(digits: string, multiplier: number): number {
  const value = Number(digits.replace(',', '.'));
  return Number.isFinite(value) ? value * multiplier : 0;
}
