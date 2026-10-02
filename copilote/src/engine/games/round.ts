import type { GameId, PlayerId, RoundItem } from '../types.ts';
import {
  bacDecider,
  initBacRound,
  reduceBac,
  restartBac,
  skipBac,
  summarizeBac,
  type BacAction,
  type BacRoundState,
} from './bac/machine.ts';
import {
  initClosestRound,
  reduceClosest,
  restartClosest,
  skipClosest,
  summarizeClosest,
  type ClosestAction,
  type ClosestRoundState,
  type RoundSummary,
} from './closest/machine.ts';

/**
 * Interface commune des mini-jeux : la partie (match.ts) manipule une manche
 * sans connaître ses règles internes.
 */

export type GameRoundState = ClosestRoundState | BacRoundState;
export type GameAction = ClosestAction | BacAction;

export interface RoundSettings {
  readonly multiplier: number;
  readonly exactBonus: boolean;
  /** Joueur qui ouvre la première carte de Bac Éclair. */
  readonly first: PlayerId;
}

export function initRound(
  game: GameId,
  items: readonly RoundItem[],
  settings: RoundSettings,
): GameRoundState {
  return game === 'bac' ? initBacRound(items, settings) : initClosestRound(game, items, settings);
}

/** Applique une action du jeu `game` ; une action destinée à un autre jeu est ignorée. */
export function reduceRound(
  state: GameRoundState,
  game: GameId,
  action: GameAction,
): GameRoundState {
  if (state.kind !== game) return state;
  if (state.kind === 'bac') return reduceBac(state, action as BacAction);
  return reduceClosest(state, action as ClosestAction);
}

/** Item affiché pour le tour en cours. */
export function roundItem(state: GameRoundState): RoundItem {
  return state.items[state.index] as RoundItem;
}

export function skipRound(state: GameRoundState, replacement: RoundItem): GameRoundState {
  return state.kind === 'bac' ? skipBac(state, replacement) : skipClosest(state, replacement);
}

export function restartRound(state: GameRoundState): GameRoundState {
  return state.kind === 'bac' ? restartBac(state) : restartClosest(state);
}

export function summarizeRound(state: GameRoundState): RoundSummary {
  return state.kind === 'bac' ? summarizeBac(state) : summarizeClosest(state);
}

/** Vainqueur d'une mort subite, ou `null` s'il faut rejouer (GAME_DESIGN §14). */
export function suddenDeathWinner(state: GameRoundState): 'A' | 'B' | null {
  if (state.kind === 'bac') return bacDecider(state);
  const winner = state.results[0]?.outcome.winner;
  return winner === 'A' || winner === 'B' ? winner : null;
}
