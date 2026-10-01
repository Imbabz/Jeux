import { createRng, SALT, shuffle } from './rng.ts';
import type { Difficulty, DifficultyMode, GameId, QuestionCount } from './types.ts';

/**
 * Ordre des manches (GAME_DESIGN §4.2) : blocs de permutations des jeux activés,
 * sans jamais répéter un jeu deux manches d'affilée (sauf s'il est seul).
 */
export function planRounds(games: readonly GameId[], rounds: number, seed: number): GameId[] {
  const plan: GameId[] = [];
  for (let block = 0; plan.length < rounds; block++) {
    const perm = shuffle(games, createRng(seed, SALT.rotation, block));
    if (perm.length > 1 && perm[0] === plan[plan.length - 1]) {
      [perm[0], perm[1]] = [perm[1] as GameId, perm[0] as GameId];
    }
    plan.push(...perm.slice(0, rounds - plan.length));
  }
  return plan;
}

const CURVES: Record<DifficultyMode, Record<QuestionCount, readonly Difficulty[]>> = {
  mixed: { 3: [1, 2, 3], 5: [1, 1, 2, 2, 3], 7: [1, 1, 2, 2, 2, 3, 3] },
  easy: { 3: [1, 1, 2], 5: [1, 1, 1, 2, 2], 7: [1, 1, 1, 1, 2, 2, 2] },
  hard: { 3: [2, 2, 3], 5: [2, 2, 2, 3, 3], 7: [2, 2, 2, 2, 3, 3, 3] },
};

/** Difficultés cibles des questions d'une manche (GAME_DESIGN §4.3). */
export function difficultyCurve(
  questions: QuestionCount,
  mode: DifficultyMode,
): readonly Difficulty[] {
  return CURVES[mode][questions];
}

/** Difficulté cible d'une question isolée (Passer, mort subite) : le milieu de la plage du mode. */
export function singleDifficulty(mode: DifficultyMode): Difficulty {
  return mode === 'easy' ? 1 : mode === 'hard' ? 3 : 2;
}
