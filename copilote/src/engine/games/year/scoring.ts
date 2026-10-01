import {
  scoreClosest,
  type Answer,
  type ClosestOutcome,
  type ScoringOptions,
} from '../closest/scoring.ts';
import type { PerPlayer } from '../../types.ts';

/** Écart en années : |proposition − réponse| ; exact = écart nul (GAME_DESIGN §5.2). */
export function scoreYear(
  answer: number,
  inputs: PerPlayer<Answer>,
  options: ScoringOptions,
): ClosestOutcome {
  return scoreClosest('year', answer, inputs, options);
}

/** Bornes des années du contenu v1 (GAME_DESIGN §8.2). */
export const YEAR_MIN = 1000;
export const YEAR_MAX = 2025;
