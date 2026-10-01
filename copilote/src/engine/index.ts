/**
 * Moteur de jeu — logique PURE (aucun React, aucun effet de bord, pas de Date ni de DOM).
 * L'état d'une partie est dérivé de { config, seed, events[] } par `reduceMatch`.
 */
export * from './types.ts';
export * from './rng.ts';
export * from './plan.ts';
export * from './draw.ts';
export * from './events.ts';
export * from './match.ts';
export * from './games/closest/machine.ts';
export * from './games/closest/scoring.ts';
export * from './games/round.ts';
export * from './games/bac/machine.ts';
export * from './games/bac/draw.ts';
export * from './games/year/draw.ts';
export * from './games/estim/draw.ts';
export { YEAR_MIN, YEAR_MAX } from './games/year/scoring.ts';
